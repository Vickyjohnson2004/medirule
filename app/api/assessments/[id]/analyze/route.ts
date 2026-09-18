import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import Assessment from '@/models/Assessment';
import AssessmentResult from '@/models/AssessmentResult';
import { connectDB } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { analyzeSymptoms } from '@/services/rule-engine';
import { apiError, apiSuccess } from '@/lib/security';

/**
 * POST /api/assessments/:id/analyze
 *
 * Re-runs analysis on an existing assessment.
 * Useful for admin re-analysis when the knowledge base has been updated.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser(['patient', 'professional', 'admin']);
    const { id } = await params;
    await connectDB();

    const assessment = await Assessment.findById(id).lean();
    if (!assessment) return apiError('Assessment not found', 'NOT_FOUND', 404);
    if (user.role === 'patient' && String(assessment.userId) !== String(user._id)) {
      return apiError('Forbidden', 'FORBIDDEN', 403);
    }

    const result = await analyzeSymptoms({
      symptoms: assessment.symptoms.map((s) => ({
        symptomId: s.symptomId ? String(s.symptomId) : undefined,
        customText: s.customText,
        severity: s.severity as any,
        duration: s.duration as any,
        onset: s.onset as any,
        frequency: s.frequency,
        characteristics: s.characteristics,
      })),
      followUpAnswers: Object.fromEntries(assessment.followUpAnswers || new Map()),
    });

    const saved = await AssessmentResult.findOneAndUpdate(
      { assessmentId: id },
      {
        assessmentId: id,
        ruleVersionSnapshot: result.matches.map((m) => ({
          ruleId: new mongoose.Types.ObjectId(m.ruleId),
          version: m.ruleVersion,
          name: m.name,
          conditionName: m.conditionName,
          score: m.score,
          maxScore: m.maxScore,
          minimumScore: m.minimumScore,
          matchedSymptoms: m.matchedSymptoms,
          missingSymptoms: m.missingSymptoms,
          explanation: m.explanation,
          advisory: m.advisory,
        })),
        redFlags: result.redFlags,
        riskLevel: result.riskLevel,
        advisory: result.advisory,
        disclaimer: result.disclaimer,
        noMatch: result.noMatch,
        unknownSymptoms: result.unknownSymptoms,
      },
      { upsert: true, new: true },
    );

    await Assessment.updateOne(
      { _id: id },
      { status: 'analyzed', riskLevel: result.riskLevel, analysisId: saved._id },
    );

    return apiSuccess(result);
  } catch (e: any) {
    if (e.message === 'UNAUTHORIZED') return apiError('Please sign in', 'UNAUTHORIZED', 401);
    console.error('[POST /api/assessments/:id/analyze]', e);
    return apiError('Unable to analyze assessment', 'ASSESSMENT_ANALYSIS_ERROR', 500);
  }
}

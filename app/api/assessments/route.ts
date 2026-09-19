import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import Assessment from '@/models/Assessment';
import AssessmentResult from '@/models/AssessmentResult';
import UnknownSymptom from '@/models/UnknownSymptom';
import { connectDB } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { assessmentSchema } from '@/validators/assessment';
import { analyzeSymptoms } from '@/services/rule-engine';
import { apiError, apiSuccess } from '@/lib/security';

/**
 * POST /api/assessments
 *
 * Saves the assessment AND runs analysis in one atomic request so
 * the client can redirect straight to /results/:id without a separate
 * analyze call that could silently fail.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(['patient', 'professional', 'admin']);
    const parsed = assessmentSchema.safeParse(await req.json());
    if (!parsed.success) {
      return apiError('Please provide a valid assessment', 'VALIDATION_ERROR');
    }

    await connectDB();

    // 1. Identify unknown (custom) symptom texts
    const unknown = parsed.data.symptoms
      .filter((s) => !s.symptomId && s.customText)
      .map((s) => s.customText!.trim());

    // 2. Save assessment in "submitted" state first
    const assessment = await Assessment.create({
      userId: user._id,
      symptoms: parsed.data.symptoms,
      followUpAnswers: parsed.data.followUpAnswers,
      status: 'submitted',
      unknownSymptoms: unknown,
    });

    // 3. Record unknown symptoms for knowledge-base review
    if (unknown.length) {
      await Promise.all(
        unknown.map((text) =>
          UnknownSymptom.findOneAndUpdate(
            { normalizedText: text.toLowerCase(), status: 'pending' },
            {
              text,
              normalizedText: text.toLowerCase(),
              userId: user._id,
              assessmentId: assessment._id,
              $inc: { occurrenceCount: 1 },
            },
            { upsert: true, new: true, setDefaultsOnInsert: true },
          ),
        ),
      );
    }

    // 4. Run the rule-engine analysis immediately
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

    // 5. Persist the analysis result
    const saved = await AssessmentResult.findOneAndUpdate(
      { assessmentId: assessment._id },
      {
        assessmentId: assessment._id,
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

    // 6. Update assessment to "analyzed"
    await Assessment.updateOne(
      { _id: assessment._id },
      { status: 'analyzed', riskLevel: result.riskLevel, analysisId: saved._id },
    );

    return apiSuccess({ id: String(assessment._id) }, 201);
  } catch (e: any) {
    if (e.message === 'UNAUTHORIZED') return apiError('Please sign in', 'UNAUTHORIZED', 401);
    console.error('[POST /api/assessments]', e);
    return apiError('Unable to save assessment', 'ASSESSMENT_SAVE_ERROR', 500);
  }
}

/**
 * GET /api/assessments
 * Returns the current user's assessment history (patients) or all (admin).
 */
export async function GET() {
  try {
    const user = await requireUser(['patient', 'professional', 'admin']);
    await connectDB();
    const rows = await Assessment.find(user.role === 'admin' ? {} : { userId: user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    return apiSuccess(rows);
  } catch (e: any) {
    if (e.message === 'UNAUTHORIZED') return apiError('Please sign in', 'UNAUTHORIZED', 401);
    return apiError('Unable to load assessment history', 'ASSESSMENT_FETCH_ERROR', 500);
  }
}

export type Role = 'patient' | 'professional' | 'admin';
export type RiskLevel = 'low' | 'moderate' | 'high' | 'emergency';
export type Severity = 'mild' | 'moderate' | 'severe';
export type Duration = 'less_than_24h' | '1_3_days' | '4_7_days' | '1_2_weeks' | 'more_than_2_weeks';
export type Onset = 'sudden' | 'gradual';
export type AssessmentStatus = 'draft' | 'submitted' | 'analyzed';

export interface SymptomInput {
  symptomId?: string;
  customText?: string;
  severity: Severity;
  duration: Duration;
  onset: Onset;
  frequency?: string;
  characteristics?: string;
}

export interface AnalysisInput {
  symptoms: SymptomInput[];
  followUpAnswers: Record<string, string>;
}

export interface RuleMatch {
  ruleId: string;
  ruleVersion: number;
  name: string;
  conditionName: string;
  description: string;
  score: number;
  maxScore: number;
  minimumScore: number;
  matchedSymptoms: string[];
  missingSymptoms: string[];
  explanation: string;
  advisory: string;
}

export interface AnalysisResult {
  riskLevel: RiskLevel;
  redFlags: { name: string; message: string; matchedText: string }[];
  matches: RuleMatch[];
  unknownSymptoms: string[];
  noMatch: boolean;
  advisory: string;
  disclaimer: string;
}

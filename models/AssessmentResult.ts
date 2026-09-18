import mongoose, { Schema, Document, Model, Types } from 'mongoose';
export interface IAssessmentResult extends Document {
  assessmentId: Types.ObjectId;
  ruleVersionSnapshot: {
    ruleId: Types.ObjectId;
    version: number;
    name: string;
    score: number;
    minimumScore: number;
    matchedSymptoms: string[];
    missingSymptoms: string[];
    explanation: string;
    advisory: string;
  }[];
  redFlags: { name: string; message: string; matchedText: string }[];
  riskLevel: string;
  advisory: string;
  disclaimer: string;
  createdAt: Date;
  updatedAt: Date;
}
const schema = new Schema<IAssessmentResult>(
  {
    assessmentId: { type: Schema.Types.ObjectId, ref: 'Assessment', required: true, unique: true },
    ruleVersionSnapshot: [
      {
        ruleId: { type: Schema.Types.ObjectId, ref: 'Rule' },
        version: Number,
        name: String,
        score: Number,
        minimumScore: Number,
        matchedSymptoms: [String],
        missingSymptoms: [String],
        explanation: String,
        advisory: String,
      },
    ],
    redFlags: [{ name: String, message: String, matchedText: String }],
    riskLevel: String,
    advisory: String,
    disclaimer: String,
  },
  { timestamps: true },
);
export default (mongoose.models.AssessmentResult as Model<IAssessmentResult>) ||
  mongoose.model<IAssessmentResult>('AssessmentResult', schema);

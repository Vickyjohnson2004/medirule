import mongoose,{Schema,Document,Model,Types} from 'mongoose';
export interface IHealthProfile extends Document {userId:Types.ObjectId;age?:number;sex?:string;relevantHealthInfo?:string;knownConditions?:string[];allergies?:string[];riskFactors?:string[];createdAt:Date;updatedAt:Date}
const schema=new Schema<IHealthProfile>({userId:{type:Schema.Types.ObjectId,ref:'User',unique:true,required:true,index:true},age:{type:Number,min:0,max:120},sex:{type:String,maxLength:30},relevantHealthInfo:{type:String,maxLength:1000},knownConditions:[String],allergies:[String],riskFactors:[String]},{timestamps:true});
export default (mongoose.models.HealthProfile as Model<IHealthProfile>)||mongoose.model<IHealthProfile>('HealthProfile',schema);

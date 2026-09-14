import mongoose,{Schema,Document,Model} from 'mongoose';
export interface ISymptom extends Document {name:string;slug:string;category:string;description?:string;aliases:string[];isActive:boolean;createdAt:Date;updatedAt:Date}
const schema=new Schema<ISymptom>({name:{type:String,required:true,trim:true},slug:{type:String,required:true,unique:true,index:true},category:{type:String,required:true,index:true},description:String,aliases:[String],isActive:{type:Boolean,default:true,index:true}},{timestamps:true});
schema.index({name:'text',aliases:'text'}); export default (mongoose.models.Symptom as Model<ISymptom>)||mongoose.model<ISymptom>('Symptom',schema);

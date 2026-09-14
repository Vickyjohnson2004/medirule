import mongoose,{Schema,Document,Model} from 'mongoose';
export interface ICondition extends Document {name:string;description:string;status:'active'|'inactive';createdAt:Date;updatedAt:Date}
const schema=new Schema<ICondition>({name:{type:String,required:true,unique:true},description:{type:String,required:true},status:{type:String,enum:['active','inactive'],default:'active'}},{timestamps:true}); export default (mongoose.models.Condition as Model<ICondition>)||mongoose.model<ICondition>('Condition',schema);

import mongoose,{Schema,Document,Model} from 'mongoose';
export interface IAdvisory extends Document {title:string;body:string;urgency:'routine'|'soon'|'urgent';status:'active'|'inactive';createdAt:Date;updatedAt:Date}
const schema=new Schema<IAdvisory>({title:{type:String,required:true},body:{type:String,required:true},urgency:{type:String,enum:['routine','soon','urgent'],default:'routine'},status:{type:String,enum:['active','inactive'],default:'active'}},{timestamps:true}); export default (mongoose.models.Advisory as Model<IAdvisory>)||mongoose.model<IAdvisory>('Advisory',schema);

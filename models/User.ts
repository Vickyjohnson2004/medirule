import mongoose,{Schema,Document,Model} from 'mongoose';
import type {Role} from '@/types';
export interface IUser extends Document {name:string;email:string;passwordHash:string;role:Role;isActive:boolean;createdAt:Date;updatedAt:Date}
const schema=new Schema<IUser>({name:{type:String,required:true,trim:true,maxLength:100},email:{type:String,required:true,unique:true,lowercase:true,trim:true,index:true},passwordHash:{type:String,required:true,select:false},role:{type:String,enum:['patient','professional','admin'],default:'patient',index:true},isActive:{type:Boolean,default:true}}, {timestamps:true});
export default (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>('User',schema);

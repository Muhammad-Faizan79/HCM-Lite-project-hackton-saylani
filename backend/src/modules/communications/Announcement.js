import mongoose from 'mongoose';
const schema = new mongoose.Schema({ title: {type:String,required:true}, message:{type:String,required:true}, author:{type:mongoose.Schema.Types.ObjectId,ref:'User'} }, {timestamps:true});
export default mongoose.model('Announcement', schema);

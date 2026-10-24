import mongoose from 'mongoose';
const schema = new mongoose.Schema({ actor:{type:mongoose.Schema.Types.ObjectId,ref:'User'}, actorRole:String, action:String, entity:String, entityId:String, before:mongoose.Schema.Types.Mixed, after:mongoose.Schema.Types.Mixed }, {timestamps:true});
export default mongoose.model('AuditLog', schema);

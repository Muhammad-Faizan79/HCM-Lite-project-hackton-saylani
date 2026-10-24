import mongoose from 'mongoose';
const schema = new mongoose.Schema({
 employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
 type: { type: String, enum: ['annual','sick','casual','unpaid'], required: true },
 startDate: { type: Date, required: true }, endDate: { type: Date, required: true },
 days: { type: Number, required: true }, reason: { type: String, required: true },
 status: { type: String, enum: ['pending','approved','rejected','cancelled'], default: 'pending' },
 reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, reviewComment: String
}, { timestamps: true });
export default mongoose.model('LeaveRequest', schema);

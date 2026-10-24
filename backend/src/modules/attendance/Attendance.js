import mongoose from 'mongoose';
const schema = new mongoose.Schema({
 employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
 date: { type: Date, required: true }, checkIn: Date, checkOut: Date,
 status: { type: String, enum: ['present','late','half_day','absent','missing_checkout','on_leave'], default: 'present' },
 correctionReason: String, correctionStatus: { type: String, enum: ['none','pending','approved','rejected'], default: 'none' }
}, { timestamps: true });
schema.index({ employee: 1, date: 1 }, { unique: true });
export default mongoose.model('Attendance', schema);

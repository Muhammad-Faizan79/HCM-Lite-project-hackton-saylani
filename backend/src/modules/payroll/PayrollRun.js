import mongoose from 'mongoose';
const schema = new mongoose.Schema({
 month: { type: String, required: true }, status: { type: String, enum: ['draft','finalized'], default: 'draft' },
 rows: [{ employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }, employeeName: String, employeeCode: String, basic: Number, hra: Number, medical: Number, gross: Number, tax: Number, deductions: Number, net: Number }],
 totalGross: Number, totalNet: Number, finalizedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, finalizedAt: Date
}, { timestamps: true });
schema.index({ month: 1 }, { unique: true });
export default mongoose.model('PayrollRun', schema);

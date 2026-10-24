import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  employeeCode: { type: String, required: true, unique: true, trim: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  email: { type: String, required: true, lowercase: true, trim: true, unique: true },
  phone: String, address: String, department: { type: String, required: true },
  designation: { type: String, required: true }, joinDate: { type: Date, required: true },
  status: { type: String, enum: ['active','probation','inactive'], default: 'active' },
  basicSalary: { type: Number, required: true, min: 1 },
  exitDate: Date
}, { timestamps: true });
export default mongoose.model('Employee', schema);

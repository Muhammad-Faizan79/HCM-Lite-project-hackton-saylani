import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  name: { type: String, required: true },
  officeStart: { type: String, default: '09:00' },
  graceMinutes: { type: Number, default: 15 },
  halfDayHours: { type: Number, default: 5 },
  weekendDays: { type: [Number], default: [0,6] },
  officeLat: Number, officeLng: Number, officeRadius: { type: Number, default: 150 },
  departments: [{ type: String }], designations: [{ type: String }],
  leaveTypes: { type: [{ name: String, quota: Number }], default: [{name:'annual',quota:14},{name:'sick',quota:8},{name:'casual',quota:10},{name:'unpaid',quota:999}] },
  holidays: [{ date: Date, name: String }]
}, { timestamps: true });
export default mongoose.model('Organization', schema);

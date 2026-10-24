import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import authRoutes from './modules/auth/routes.js';
import orgRoutes from './modules/organization/routes.js';
import employeeRoutes from './modules/employees/routes.js';
import attendanceRoutes from './modules/attendance/routes.js';
import leaveRoutes from './modules/leave/routes.js';
import payrollRoutes from './modules/payroll/routes.js';
import analyticsRoutes from './modules/analytics/routes.js';
import aiRoutes from './modules/ai/routes.js';
import commsRoutes from './modules/communications/routes.js';
import { errorHandler } from './shared/errors.js';
import constect from './server.js';
import dotenv from "dotenv"
dotenv.config()
const app = express();


app.use(cors());
 (async()=>{
   await constect()
 })()
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));
app.get('/api/health', (_req, res) => res.json({ ok: true, app: 'HCM Lite' }));
app.use('/api/auth', authRoutes);
app.use('/api/organization', orgRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/comms', commsRoutes);
app.use(errorHandler);


// app.listen("5000", ()=>console.log("run"))
export default app;


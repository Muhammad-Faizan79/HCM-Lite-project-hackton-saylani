import {Router} from 'express';
import Employee from '../employees/Employee.js';
import Attendance from '../attendance/Attendance.js';
import LeaveRequest from '../leave/LeaveRequest.js';
import PayrollRun from '../payroll/PayrollRun.js';
import {protect,allow} from '../../shared/auth.js';
import {startOfDay,endOfDay} from '../../shared/date.js';
const router=Router();router.use(protect);
router.get('/dashboard',async(req,res,next)=>{try{
 const today=startOfDay(),tomorrow=new Date(today);tomorrow.setDate(tomorrow.getDate()+1);
 const month=new Date().toISOString().slice(0,7);
 let employeeFilter={status:{$in:['active','probation']}};if(req.user.role==='employee')employeeFilter._id=req.user.employee;
 const [headcount,present,late,onLeave,pendingLeaves,employees,attendance,latestPayroll]=await Promise.all([
 Employee.countDocuments(employeeFilter),
 Attendance.countDocuments({date:{$gte:today,$lt:tomorrow},status:'present',...(req.user.role==='employee'?{employee:req.user.employee}:{})}),
 Attendance.countDocuments({date:{$gte:today,$lt:tomorrow},status:'late',...(req.user.role==='employee'?{employee:req.user.employee}:{})}),
 LeaveRequest.countDocuments({status:'approved',startDate:{$lte:endOfDay()},endDate:{$gte:today},...(req.user.role==='employee'?{employee:req.user.employee}:{})}),
 LeaveRequest.countDocuments({status:'pending',...(req.user.role==='employee'?{employee:req.user.employee}:{})}),
 Employee.find(employeeFilter).select('name department designation basicSalary status'),
 Attendance.find({date:{$gte:new Date(Date.now()-6*86400000)},...(req.user.role==='employee'?{employee:req.user.employee}:{})}).populate('employee','department name'),
 req.user.role==='employee'?PayrollRun.find({status:'finalized','rows.employee':req.user.employee}).sort({month:-1}).limit(1):PayrollRun.findOne({month})
 ]);
 const byDepartment={};for(const e of employees)byDepartment[e.department]=(byDepartment[e.department]||0)+1;
 res.json({headcount,present,late,onLeave,pendingLeaves,byDepartment,attendanceTrend:attendance.map(a=>({date:a.date,status:a.status,department:a.employee?.department})),payroll:latestPayroll?{month:latestPayroll.month,totalGross:latestPayroll.totalGross,totalNet:latestPayroll.totalNet}:null,employees:employees.slice(0,8)});
}catch(e){next(e)}});
export default router;

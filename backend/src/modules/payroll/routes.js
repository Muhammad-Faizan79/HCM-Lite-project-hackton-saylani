import {Router} from 'express';
import PayrollRun from './PayrollRun.js';
import Employee from '../employees/Employee.js';
import Attendance from '../attendance/Attendance.js';
import LeaveRequest from '../leave/LeaveRequest.js';
import {protect,allow} from '../../shared/auth.js';
import {audit} from '../../shared/audit.js';
const router=Router();router.use(protect);
router.get('/',async(req,res,next)=>{try{
 const runs=await PayrollRun.find().sort({month:-1});if(req.user.role==='employee'){
  const e=await Employee.findById(req.user.employee);return res.json(runs.map(r=>({...r.toObject(),rows:r.rows.filter(x=>String(x.employee)===String(e?._id))})).filter(r=>r.rows.length));
 }res.json(runs);
}catch(e){next(e)}});
router.post('/run',allow('hr','admin'),async(req,res,next)=>{try{
 const month=String(req.body.month||'');if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(month))return res.status(400).json({message:'Month must be YYYY-MM'});
 if(await PayrollRun.exists({month}))return res.status(409).json({message:'Payroll run already exists for this month'});
 const [year,mon]=month.split('-').map(Number);const from=new Date(year,mon-1,1),to=new Date(year,mon,0,23,59,59,999);
 const employees=await Employee.find({status:{$in:['active','probation']},joinDate:{$lte:to}});
 const rows=[];
 for(const e of employees){
  const gross=e.basicSalary*1.5,hra=e.basicSalary*.4,medical=e.basicSalary*.1;
  const daysInMonth=new Date(year,mon,0).getDate(),working=Math.max(1,Math.round(daysInMonth*5/7));
  const attendance=await Attendance.find({employee:e._id,date:{$gte:from,$lte:to}});
  const approvedLeave=await LeaveRequest.find({employee:e._id,status:'approved',startDate:{$lte:to},endDate:{$gte:from},type:'unpaid'});
  const absent=attendance.filter(a=>a.status==='absent').length,half=attendance.filter(a=>a.status==='half_day').length;
  const unpaid=approvedLeave.reduce((s,l)=>s+l.days,0);const deductions=Math.max(0,(gross/working)*(absent+unpaid+half*.5));
  const annual=gross*12;let tax=0;if(annual>3600000)tax=510000+(annual-3600000)*.35;else if(annual>2400000)tax=210000+(annual-2400000)*.25;else if(annual>1200000)tax=30000+(annual-1200000)*.15;else if(annual>600000)tax=(annual-600000)*.05;
  const monthlyTax=tax/12;
  rows.push({employee:e._id,employeeName:e.name,employeeCode:e.employeeCode,basic:e.basicSalary,hra,medical,gross,tax:monthlyTax,deductions,net:Math.max(0,gross-monthlyTax-deductions)});
 }
 const run=await PayrollRun.create({month,status:'draft',rows,totalGross:rows.reduce((s,r)=>s+r.gross,0),totalNet:rows.reduce((s,r)=>s+r.net,0)});
 await audit(req.user,'payroll.run','PayrollRun',run._id,null,run.toObject());res.status(201).json(run);
}catch(e){next(e)}});
router.post('/:id/finalize',allow('admin'),async(req,res,next)=>{try{
 const run=await PayrollRun.findById(req.params.id);if(!run)return res.status(404).json({message:'Payroll run not found'});if(run.status==='finalized')return res.status(409).json({message:'Already finalized'});
 run.status='finalized';run.finalizedBy=req.user._id;run.finalizedAt=new Date();await run.save();await audit(req.user,'payroll.finalize','PayrollRun',run._id,null,run.toObject());res.json(run);
}catch(e){next(e)}});
export default router;

import {Router} from 'express';
import {protect} from '../../shared/auth.js';
import Employee from '../employees/Employee.js';
import Attendance from '../attendance/Attendance.js';
import LeaveRequest from '../leave/LeaveRequest.js';
import {startOfDay,endOfDay} from '../../shared/date.js';
const router=Router();router.use(protect);
router.post('/chat',async(req,res,next)=>{try{
 const question=String(req.body.message||'').trim();if(!question)return res.status(400).json({message:'Message required'});
 const q=question.toLowerCase();let answer='';
 if(/salary|payroll/.test(q)&&req.user.role==='employee'&&!/my|mera|meri|apni/.test(q))answer='Maazrat, aap doosray employee ki salary nahi dekh sakte.';
 else if(/headcount|how many employee|kitne employee|active employee/.test(q)&&req.user.role!=='employee')answer=`Active/probation employees: ${await Employee.countDocuments({status:{$in:['active','probation']}})}.`;
 else if(/late|der se/.test(q)){
  const count=await Attendance.countDocuments({date:{$gte:startOfDay(),$lte:endOfDay()},status:'late',...(req.user.role==='employee'?{employee:req.user.employee}:{})});answer=`Aaj late check-ins: ${count}.`;
 } else if(/leave balance|leave left|chhutti|kitni chhutti/.test(q)&&req.user.role==='employee'){
  const used=await LeaveRequest.aggregate([{$match:{employee:req.user.employee,status:'approved',type:{$ne:'unpaid'}}},{$group:{_id:'$type',days:{$sum:'$days'}}}]);answer='Approved leave usage: '+(used.map(x=>`${x._id}: ${x.days} days`).join(', ')||'abhi koi approved leave nahi')+'.';
 } else if(/policy|late|grace|half day|casual|sick/.test(q))answer='Policy ke mutabiq office start 09:00 hai aur 15 minutes grace period hai. 5 hours se kam kaam half-day hota hai. Annual quota 14, sick 8, casual 10 working days hai; unpaid leave unlimited hai.';
 else answer='Main aapke sawal ko abhi limited built-in HR tools se answer nahi kar saka. Attendance, active headcount ya leave policy ke baare mein pooch kar dekhein.';
 res.json({answer,generatedBy:'HCM Lite assistant',aiGenerated:true,providerConfigured:Boolean(process.env.AI_API_KEY)});
}catch(e){next(e)}});
router.post('/summary',async(req,res,next)=>{try{
 const [employees,pending,late]=await Promise.all([Employee.countDocuments({status:{$in:['active','probation']}}),LeaveRequest.countDocuments({status:'pending'}),Attendance.countDocuments({date:{$gte:startOfDay(),$lte:endOfDay()},status:'late'})]);
 res.json({insights:[`${employees} active/probation employees currently registered.`,`${pending} leave requests are pending review.`,`${late} late check-ins recorded today.`],aiGenerated:true});
}catch(e){next(e)}});
export default router;

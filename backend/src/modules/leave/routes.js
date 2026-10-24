import {Router} from 'express';
import LeaveRequest from './LeaveRequest.js';
import Employee from '../employees/Employee.js';
import Organization from '../organization/Organization.js';
import {protect,allow} from '../../shared/auth.js';
import {workingDays} from '../../shared/date.js';
import {audit} from '../../shared/audit.js';
import Notification from '../communications/Notification.js';
const router=Router();router.use(protect);
router.get('/',async(req,res,next)=>{try{
 const filter={};if(req.user.role==='employee')filter.employee=req.user.employee;if(req.query.status)filter.status=req.query.status;
 res.json(await LeaveRequest.find(filter).populate('employee','name employeeCode department').populate('reviewer','name').sort({createdAt:-1}).limit(500));
}catch(e){next(e)}});
router.get('/balance/me',allow('employee'),async(req,res,next)=>{try{
 const org=await Organization.findOne();const year=new Date().getFullYear();const start=new Date(year,0,1),end=new Date(year,11,31);
 const approved=await LeaveRequest.find({employee:req.user.employee,status:'approved',startDate:{$lte:end},endDate:{$gte:start}});
 const types=org?.leaveTypes||[{name:'annual',quota:14},{name:'sick',quota:8},{name:'casual',quota:10},{name:'unpaid',quota:999}];
 res.json(types.map(t=>({type:t.name,quota:t.quota,used:approved.filter(l=>l.type===t.name).reduce((s,l)=>s+l.days,0),remaining:Math.max(0,t.quota-approved.filter(l=>l.type===t.name).reduce((s,l)=>s+l.days,0))})));
}catch(e){next(e)}});
router.post('/',allow('employee'),async(req,res,next)=>{try{
 const {type,startDate,endDate,reason}=req.body;if(!type||!startDate||!endDate||!reason)return res.status(400).json({message:'Type, dates and reason required'});
 const start=new Date(startDate),end=new Date(endDate);if(Number.isNaN(+start)||Number.isNaN(+end)||end<start)return res.status(400).json({message:'Invalid date range'});
 const org=await Organization.findOne();const holidays=(org?.holidays||[]).map(h=>h.date);const days=workingDays(start,end,holidays);
 if(days<1)return res.status(422).json({message:'Select at least one working day'});
 const overlap=await LeaveRequest.findOne({employee:req.user.employee,status:{$in:['pending','approved']},startDate:{$lte:end},endDate:{$gte:start}});
 if(overlap)return res.status(422).json({message:'Leave dates overlap an existing request'});
 const quota=(org?.leaveTypes||[]).find(t=>t.name===type)?.quota??({annual:14,sick:8,casual:10,unpaid:999}[type]);
 if(type!=='unpaid'){
  const yearStart=new Date(start.getFullYear(),0,1),yearEnd=new Date(start.getFullYear(),11,31);
  const prior=await LeaveRequest.find({employee:req.user.employee,type,status:'approved',startDate:{$lte:yearEnd},endDate:{$gte:yearStart}});
  const used=prior.reduce((s,l)=>s+l.days,0);if(used+days>quota)return res.status(422).json({message:`Insufficient ${type} leave balance`});
 }
 const item=await LeaveRequest.create({employee:req.user.employee,type,startDate:start,endDate:end,days,reason});
 await audit(req.user,'leave.create','LeaveRequest',item._id,null,item.toObject());res.status(201).json(item);
}catch(e){next(e)}});
router.patch('/:id/review',allow('hr','admin'),async(req,res,next)=>{try{
 const {status,comment}=req.body;if(!['approved','rejected'].includes(status))return res.status(400).json({message:'Choose approved or rejected'});
 const item=await LeaveRequest.findById(req.params.id);if(!item)return res.status(404).json({message:'Leave request not found'});
 if(item.status!=='pending')return res.status(409).json({message:'Request already reviewed'});
 item.status=status;item.reviewer=req.user._id;item.reviewComment=comment||'';await item.save();
 const emp=await Employee.findById(item.employee);if(emp?.user)await Notification.create({user:emp.user,title:`Leave ${status}`,message:`Your ${item.type} leave request was ${status}. ${comment||''}`});
 await audit(req.user,'leave.review','LeaveRequest',item._id,null,item.toObject());res.json(item);
}catch(e){next(e)}});
router.patch('/:id/cancel',allow('employee'),async(req,res,next)=>{try{
 const item=await LeaveRequest.findOne({_id:req.params.id,employee:req.user.employee});if(!item)return res.status(404).json({message:'Request not found'});
 if(!['pending','approved'].includes(item.status))return res.status(409).json({message:'Cannot cancel this request'});
 item.status='cancelled';await item.save();await audit(req.user,'leave.cancel','LeaveRequest',item._id,null,item.toObject());res.json(item);
}catch(e){next(e)}});
export default router;

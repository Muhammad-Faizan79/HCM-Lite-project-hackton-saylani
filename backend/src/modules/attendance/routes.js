import {Router} from 'express';
import Attendance from './Attendance.js';
import Employee from '../employees/Employee.js';
import Organization from '../organization/Organization.js';
import LeaveRequest from '../leave/LeaveRequest.js';
import {protect,allow} from '../../shared/auth.js';
import {startOfDay,endOfDay} from '../../shared/date.js';
import {audit} from '../../shared/audit.js';
const router=Router();router.use(protect);
router.get('/',async(req,res,next)=>{try{
 const filter={};if(req.user.role==='employee')filter.employee=req.user.employee;
 if(req.query.date){filter.date={$gte:startOfDay(req.query.date),$lte:endOfDay(req.query.date)}}
 const items=await Attendance.find(filter).populate('employee','name employeeCode department').sort({date:-1}).limit(500);res.json(items);
}catch(e){next(e)}});
router.post('/check-in',allow('employee'),async(req,res,next)=>{try{
 const employee=await Employee.findById(req.user.employee);if(!employee)return res.status(400).json({message:'Employee profile not linked'});
 const date=startOfDay();const existing=await Attendance.findOne({employee:employee._id,date});
 if(existing)return res.status(409).json({message:'Check-in already exists for today'});
 const org=await Organization.findOne();const [h,m]=String(org?.officeStart||'09:00').split(':').map(Number);
 const threshold=new Date();threshold.setHours(h,m+(org?.graceMinutes||15),0,0);
 const now=new Date();const record=await Attendance.create({employee:employee._id,date,checkIn:now,status:now>threshold?'late':'present'});
 await audit(req.user,'attendance.check_in','Attendance',record._id,null,record.toObject());res.status(201).json(record);
}catch(e){next(e)}});
router.post('/check-out',allow('employee'),async(req,res,next)=>{try{
 const record=await Attendance.findOne({employee:req.user.employee,date:{$gte:startOfDay(),$lte:endOfDay()}});
 if(!record||!record.checkIn)return res.status(404).json({message:'Check in first'});
 if(record.checkOut)return res.status(409).json({message:'Already checked out'});
 record.checkOut=new Date();const org=await Organization.findOne();if((record.checkOut-record.checkIn)/3600000<(org?.halfDayHours||5))record.status='half_day';else if(record.status==='present'||record.status==='late')record.status=record.status;
 await record.save();await audit(req.user,'attendance.check_out','Attendance',record._id,null,record.toObject());res.json(record);
}catch(e){next(e)}});
router.post('/correction',allow('employee'),async(req,res,next)=>{try{
 const {date,reason,checkIn,checkOut}=req.body;if(!date||!reason)return res.status(400).json({message:'Date and reason required'});
 let record=await Attendance.findOne({employee:req.user.employee,date:{$gte:startOfDay(date),$lte:endOfDay(date)}});
 if(!record)record=await Attendance.create({employee:req.user.employee,date:startOfDay(date),status:'missing_checkout'});
 record.correctionReason=reason;record.correctionStatus='pending';if(checkIn)record.checkIn=new Date(checkIn);if(checkOut)record.checkOut=new Date(checkOut);await record.save();
 await audit(req.user,'attendance.correction.request','Attendance',record._id,null,record.toObject());res.status(201).json(record);
}catch(e){next(e)}});
router.patch('/:id/correction',allow('hr','admin'),async(req,res,next)=>{try{
 const record=await Attendance.findById(req.params.id);if(!record)return res.status(404).json({message:'Record not found'});
 if(!['approved','rejected'].includes(req.body.status))return res.status(400).json({message:'Status must be approved or rejected'});
 record.correctionStatus=req.body.status;await record.save();await audit(req.user,'attendance.correction.review','Attendance',record._id,null,record.toObject());res.json(record);
}catch(e){next(e)}});
export default router;

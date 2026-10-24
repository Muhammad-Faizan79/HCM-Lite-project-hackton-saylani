import {Router} from 'express';
import bcrypt from 'bcryptjs';
import Employee from './Employee.js';
import User from '../auth/User.js';
import Attendance from '../attendance/Attendance.js';
import LeaveRequest from '../leave/LeaveRequest.js';
import {protect,allow} from '../../shared/auth.js';
import {audit} from '../../shared/audit.js';
const router=Router(); router.use(protect);
router.get('/',async(req,res,next)=>{try{
 const filter={}; if(req.user.role==='employee'){if(!req.user.employee)return res.json([]);filter._id=req.user.employee;}
 if(req.query.department)filter.department=req.query.department;
 if(req.query.search)filter.$or=[{name:new RegExp(req.query.search,'i')},{email:new RegExp(req.query.search,'i')},{employeeCode:new RegExp(req.query.search,'i')}];
 const page=Math.max(1,Number(req.query.page)||1),limit=Math.min(100,Math.max(1,Number(req.query.limit)||50));
 const [items,total]=await Promise.all([Employee.find(filter).sort({createdAt:-1}).skip((page-1)*limit).limit(limit),Employee.countDocuments(filter)]);
 res.json({items,total,page,limit});
}catch(e){next(e)}});
router.get('/:id',async(req,res,next)=>{try{
 if(req.user.role==='employee' && String(req.user.employee)!==req.params.id)return res.status(403).json({message:'Own profile only'});
 const e=await Employee.findById(req.params.id).populate('user','name email role'); if(!e)return res.status(404).json({message:'Employee not found'});res.json(e);
}catch(e){next(e)}});
router.post('/',allow('hr','admin'),async(req,res,next)=>{try{
 const {employeeCode,name,email,phone,address,department,designation,joinDate,basicSalary,password}=req.body;
 if(!employeeCode||!name||!email||!department||!designation||!joinDate||Number(basicSalary)<=0)return res.status(400).json({message:'Employee code, name, email, department, designation, join date and salary > 0 required'});
 const temp=password||`Change-${Math.random().toString(36).slice(2,8)}A9`;
 const user=await User.create({name,email,passwordHash:await bcrypt.hash(temp,12),role:'employee',mustChangePassword:true});
 const employee=await Employee.create({employeeCode,name,email,phone,address,department,designation,joinDate,basicSalary:Number(basicSalary),user:user._id});
 user.employee=employee._id; await user.save();
 await audit(req.user,'employee.create','Employee',employee._id,null,employee.toObject());
 res.status(201).json({employee,temporaryPassword:temp});
}catch(e){next(e)}});
router.patch('/:id',allow('hr','admin','employee'),async(req,res,next)=>{try{
 const employee=await Employee.findById(req.params.id); if(!employee)return res.status(404).json({message:'Employee not found'});
 if(req.user.role==='employee' && String(req.user.employee)!==String(employee._id))return res.status(403).json({message:'Own profile only'});
 const before=employee.toObject(); const fields=req.user.role==='employee'?['phone','address']:['name','phone','address','department','designation','status','basicSalary'];
 for(const k of fields)if(req.body[k]!==undefined)employee[k]=req.body[k];
 await employee.save(); await audit(req.user,'employee.update','Employee',employee._id,before,employee.toObject());res.json(employee);
}catch(e){next(e)}});
router.get('/:id/360',async(req,res,next)=>{try{
 if(req.user.role==='employee'&&String(req.user.employee)!==req.params.id)return res.status(403).json({message:'Own data only'});
 const employee=await Employee.findById(req.params.id);if(!employee)return res.status(404).json({message:'Employee not found'});
 const [attendance,leaves]=await Promise.all([Attendance.find({employee:employee._id}).sort({date:-1}).limit(30),LeaveRequest.find({employee:employee._id}).sort({createdAt:-1}).limit(20)]);
 res.json({employee,attendance,leaves});
}catch(e){next(e)}});
export default router;

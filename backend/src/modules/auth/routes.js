import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from './User.js';
import Organization from '../organization/Organization.js';
import Employee from '../employees/Employee.js';
import { protect, allow } from '../../shared/auth.js';
import { audit } from '../../shared/audit.js';
const router = Router();
const sign = user => jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'development-only-change-me', { expiresIn: '12h' });
router.get('/setup-status', async (_req,res) => res.json({ setupComplete: await Organization.exists({}) && await User.exists({role:'admin'}) }));
router.post('/setup', async (req,res,next) => {
 try {
  if (await User.exists({role:'admin'}) || await Organization.exists({})) return res.status(409).json({message:'Initial setup already completed'});
  const { companyName, name, email, password } = req.body;
  if (!companyName || !name || !email || !password || password.length < 8) return res.status(400).json({message:'Company, name, email and password (8+ chars) required'});
  await Organization.create({name:companyName});
  const user = await User.create({name,email,passwordHash:await bcrypt.hash(password,12),role:'admin'});
  await audit(user,'setup.create','Organization',companyName,null,{companyName});
  res.status(201).json({token:sign(user),user:{id:user._id,name:user.name,email:user.email,role:user.role}});
 } catch(e){next(e)}
});
router.post('/login', async (req,res,next) => {
 try {
  const user=await User.findOne({email:String(req.body.email||'').toLowerCase()});
  if(!user || !user.active || !(await bcrypt.compare(req.body.password||'',user.passwordHash))) return res.status(401).json({message:'Email or password is incorrect'});
  res.json({token:sign(user),user:{id:user._id,name:user.name,email:user.email,role:user.role,employee:user.employee,mustChangePassword:user.mustChangePassword}});
 } catch(e){next(e)}
});
router.get('/me',protect,(req,res)=>res.json({user:req.user}));
router.post('/users',protect,allow('admin'),async(req,res,next)=>{
 try{
  const {name,email,password,role}=req.body;
  if(!['hr','employee'].includes(role)) return res.status(400).json({message:'Admin can create HR or employee accounts only'});
  if(!name||!email||!password||password.length<8) return res.status(400).json({message:'Name, email and password (8+ chars) required'});
  const user=await User.create({name,email,passwordHash:await bcrypt.hash(password,12),role,mustChangePassword:true});
  await audit(req.user,'user.create','User',user._id,null,{name,email,role});
  res.status(201).json({id:user._id,name,email,role,mustChangePassword:true});
 }catch(e){next(e)}
});
router.patch('/change-password',protect,async(req,res,next)=>{
 try{
  if(!req.body.password || req.body.password.length<8) return res.status(400).json({message:'Password must be at least 8 characters'});
  const user=await User.findById(req.user._id); user.passwordHash=await bcrypt.hash(req.body.password,12); user.mustChangePassword=false; await user.save();
  res.json({message:'Password changed'});
 }catch(e){next(e)}
});
export default router;

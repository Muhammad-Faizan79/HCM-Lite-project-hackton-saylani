import {Router} from 'express';
import Announcement from './Announcement.js';
import AuditLog from './AuditLog.js';
import Notification from './Notification.js';
import {protect,allow} from '../../shared/auth.js';
import {audit} from '../../shared/audit.js';
const router=Router();router.use(protect);
router.get('/announcements',async(_req,res,next)=>{try{res.json(await Announcement.find().populate('author','name').sort({createdAt:-1}).limit(100))}catch(e){next(e)}});
router.post('/announcements',allow('admin','hr'),async(req,res,next)=>{try{
 const {title,message}=req.body;if(!title||!message)return res.status(400).json({message:'Title and message required'});
 const item=await Announcement.create({title,message,author:req.user._id});await audit(req.user,'announcement.create','Announcement',item._id,null,item.toObject());res.status(201).json(item);
}catch(e){next(e)}});
router.get('/notifications',async(req,res,next)=>{try{res.json(await Notification.find({user:req.user._id}).sort({createdAt:-1}).limit(100))}catch(e){next(e)}});
router.patch('/notifications/:id/read',async(req,res,next)=>{try{const n=await Notification.findOneAndUpdate({_id:req.params.id,user:req.user._id},{read:true},{new:true});if(!n)return res.status(404).json({message:'Notification not found'});res.json(n)}catch(e){next(e)}});
router.get('/audit',allow('admin'),async(_req,res,next)=>{try{res.json(await AuditLog.find().populate('actor','name email role').sort({createdAt:-1}).limit(200))}catch(e){next(e)}});
export default router;

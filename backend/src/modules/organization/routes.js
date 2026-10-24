import {Router} from 'express';
import Organization from './Organization.js';
import {protect,allow} from '../../shared/auth.js';
import {audit} from '../../shared/audit.js';
const router=Router();
router.use(protect);
router.get('/',async(_req,res)=>res.json(await Organization.findOne()));
router.patch('/',allow('admin'),async(req,res,next)=>{try{
 const org=await Organization.findOne(); if(!org)return res.status(404).json({message:'Complete first-run setup'});
 const before=org.toObject(); const allowed=['name','officeStart','graceMinutes','halfDayHours','weekendDays','officeLat','officeLng','officeRadius','departments','designations','leaveTypes','holidays'];
 for(const k of allowed) if(req.body[k]!==undefined) org[k]=req.body[k];
 await org.save(); await audit(req.user,'organization.update','Organization',org._id,before,org.toObject()); res.json(org);
}catch(e){next(e)}});
export default router;

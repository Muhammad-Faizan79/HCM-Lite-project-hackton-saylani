import dotenv from 'dotenv';
dotenv.config();
import app from './app.js';
import mongoose from 'mongoose';


const port = process.env.PORT || 5000;
const URI = "mongodb+srv://hackton459_db_user:faizan%40123@hackton.snjiv5m.mongodb.net/"
mongoose.connect(URI)
.then(() => {
  console.log('MongoDB connected');
  app.listen(port, () => console.log(`HCM Lite API running on port ${port}`));
   
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
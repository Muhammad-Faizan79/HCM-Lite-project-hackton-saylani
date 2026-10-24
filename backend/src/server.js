import dotenv from 'dotenv';
dotenv.config();
import app from './app.js';
import mongoose from 'mongoose';


const port = process.env.PORT || 5000;
const URI = process.env.MONGODB_URI
mongoose.connect(URI)
.then(() => {
  console.log('MongoDB connected');
  
})
.catch((err) => {
  console.error('MongoDB connection failed:', err.message);
  process.exit(1);
});
// app.listen(port, () => console.log(`HCM Lite API running on port ${port}`));
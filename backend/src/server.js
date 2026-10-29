// import app from './app.js';


// const port = process.env.PORT || 5000;
// mongoose.connect(URI)
// .then(() => {
  //   console.log('MongoDB connected');
  
// })
// .catch((err) => {
  //   console.error('MongoDB connection failed:', err.message);
  //   process.exit(1);
  // });
  // // app.listen(port, () => console.log(`HCM Lite API running on port ${port}`));
  
  

import dotenv from 'dotenv';
import{setServers} from "node:dns/promises"
setServers(["8.8.8.8", "1.1.1.1"])
dotenv.config();

import mongoose from 'mongoose';

const connectDB = async (uri) => {
  console.log(uri)
  const URI = uri;
  if (!URI) {
    console.log(uri)
    throw new Error('MONGODB_URI environment variable is missing');
  }

  try {
    await mongoose.connect(URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    throw error;
  }
};

export default connectDB;

import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import categoryRoute from './routes/categoryRoute.js';
import newsRoute from './routes/newsRoutes.js';
import authRoute from './routes/authRoute.js';
import logoRoute from './routes/logoRoute.js'
import bannerRoute from './routes/bannerRoute.js'
import os from 'os'


dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use('/uploads', express.static('uploads'));
app.use(cors({ origin: '*' }));
app.use(express.json({ limit : "10mb"})); 
app.use(express.urlencoded({extended:true,limit:'10mb'}))

app.use('/api/categories', categoryRoute);     //for handling categories
app.use('/api/news', newsRoute);               //for handling post
app.use('/api/auth',authRoute)                 //for handling authentication
app.use('/api/logo',logoRoute)                 //for handling logo
app.use('/api/banner',bannerRoute)             //for handling banners

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err.message));

const getNetworkAddress= () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running at: http://${getNetworkAddress()}:${PORT}`);
});
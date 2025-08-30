import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';

import connectDB from './db/index.js';
import { connectCloudinary } from './config/cloudinary.js';

import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';
import eventRouter from './routes/event.routes.js';
import paymentRoutes from './routes/paymentRoutes.js';
const app = express();
const port = process.env.PORT || 4000;

connectDB();
connectCloudinary();

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// CORS
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
];

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

// API Endpoints
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/events', eventRouter);
app.use('/api/payment', paymentRoutes); // <-- Add payment endpoints

app.listen(port, () => console.log(`Server started on PORT: ${port}`));

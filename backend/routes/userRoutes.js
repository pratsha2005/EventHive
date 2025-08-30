import express from "express";
import { getUserData, getAllEvents, registerForEvent, getMyBookings } from "../controllers/userController.js";
import userAuth from "../middlewares/userAuth.js";


const userRouter = express.Router();

userRouter.get("/data", userAuth, getUserData);
userRouter.get('/getAllEvents', userAuth, getAllEvents)
userRouter.post('/register/:eventId', userAuth, registerForEvent)
userRouter.get('/myBookings', userAuth, getMyBookings)

export default userRouter;
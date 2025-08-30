import express from "express";
import { getUserData, getAllEvents, registerForEvent } from "../controllers/userController.js";
import userAuth from "../middlewares/userAuth.js";


const userRouter = express.Router();

userRouter.get("/data", userAuth, getUserData);
userRouter.get('/getAllEvents', userAuth, getAllEvents)
userRouter.post('/register/:eventId', userAuth, registerForEvent)

export default userRouter;
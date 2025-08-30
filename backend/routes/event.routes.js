import { Router } from "express";
import {
  addEvent,
  editEvent,
  getAllEventsByEventManagerId,
  getEventById
} from "../controllers/events.controllers.js";
import upload from "../middlewares/multer.js"; 
import userAuth from "../middlewares/userAuth.js";

const router = Router();

router.post(
  "/add-event",
  upload.fields([
    { name: "banner", maxCount: 1 },
    { name: "gallery", maxCount: 10 }
  ]),
  addEvent
);

router.post(
  "/edit-event/:eventId",
  upload.fields([
    { name: "banner", maxCount: 1 },
    { name: "gallery", maxCount: 10 }
  ]),
  editEvent
);

router.get("/getAllEventByManagerId", userAuth, getAllEventsByEventManagerId);
router.get("/getEventById/:eventId", getEventById);

export default router;

import { Router } from "express";
import {
  addEvent,
  editEvent,
  exportAsCSV,
  getAllEventsByEventManagerId,
  getAttendeesByEventId,
  getEventById,
  deleteEvent
} from "../controllers/events.controllers.js";
import upload from "../middlewares/multer.js"; 
import userAuth from "../middlewares/userAuth.js";

const router = Router();

router.post('/deleteEvent/:eventId', deleteEvent)


router.post(
  "/add-event",
  upload.fields([
    { name: "banner", maxCount: 1 },
    { name: "gallery", maxCount: 10 }
  ]),
  userAuth,
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
router.get("/getEventById/:eventId",userAuth, getEventById);
router.get('/exportCSV/:eventId',userAuth, exportAsCSV)
router.get('/getAttendeesByEventId/:eventId',userAuth, getAttendeesByEventId );

export default router;

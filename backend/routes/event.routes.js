import {Router} from "express"
import {
    addEvent, editEvent,
    getAllEventsByEventManagerId,
    getEventById
} from '../controllers/events.controllers.js'

const router = Router()

router.route('/add-event').post(addEvent)
router.route('/edit-event/:eventId').post(editEvent)
router.route('/getAllEventByManagerId').get(verify, getAllEventsByEventManagerId)
router.route('/getEventById/:eventId').get(getEventById)


export default router
import express from "express";
import {
  createCheckoutSession,
  paymentSuccess,
//   paymentCancel,
} from "../controllers/paymentController.js";

import userAuth  from '../middlewares/userAuth.js'


const router = express.Router();

router.post("/checkout",userAuth, createCheckoutSession);
router.get("/payment-success", paymentSuccess);
// router.get("/payment-cancel", paymentCancel);

export default router;

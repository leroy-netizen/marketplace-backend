import { Router } from "express";
import { signin, signup } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";
import {
  forgotPasswordController,
  resetPasswordController,
} from "../controllers/auth.controller";

const router = Router();

router.post("/signup", signup);
//@ts-ignore
router.post("/signin", signin);
router.post("/forgot-password", forgotPasswordController);
router.post("/reset-password", resetPasswordController);

export default router;

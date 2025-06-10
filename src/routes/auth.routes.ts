import { Router } from "express";
import {
  refreshAccessToken,
  signin,
  signup,
} from "../controllers/auth.controller";
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
//@ts-ignore
router.post("/refresh", refreshAccessToken);

export default router;

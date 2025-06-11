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

export const authRoutes = Router();

authRoutes.post("/signup", signup);
//@ts-ignore
authRoutes.post("/signin", signin);
authRoutes.post("/forgot-password", forgotPasswordController);
authRoutes.post("/reset-password", resetPasswordController);
//@ts-ignore
authRoutes.post("/refresh", refreshAccessToken);

// export default router;

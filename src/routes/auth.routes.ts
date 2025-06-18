import { Router } from "express";
import {
  refreshAccessToken,
  signin,
  signup,
  updateUserRole,
} from "../controllers/auth.controller";
import { authRbac, authenticate } from "../middlewares/auth.middleware";
import {
  forgotPasswordController,
  resetPasswordController,
} from "../controllers/auth.controller";

export const authRoutes = Router();

authRoutes.post("/signup", signup);

authRoutes.post("/signin", signin);
authRoutes.post("/forgot-password", forgotPasswordController);
authRoutes.post("/reset-password", resetPasswordController);

//@ts-ignore
authRoutes.post("/refresh", refreshAccessToken);

authRoutes.patch(
  "/users/:id/role",
  authenticate,
  authRbac("admin"),
  updateUserRole
);

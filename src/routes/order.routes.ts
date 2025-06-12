import { Router } from "express";

export const orderRoutes = Router();
import { checkoutController } from "../controllers/order.controller";
import { authenticate } from "../middlewares/auth.middleware";
orderRoutes.post("/checkout", authenticate, checkoutController);

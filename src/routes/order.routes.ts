import { Router } from "express";

export const orderRoutes = Router();
import {
  checkoutController,
  getMyOrders,
  getSoldOrders,
  updateOrderItemStatus,
} from "../controllers/order.controller";
import { authenticate } from "../middlewares/auth.middleware";
orderRoutes.post("/checkout", authenticate, checkoutController);

const router = Router();

router.use(authenticate);

router.get("/my", authenticate, getMyOrders); // Buyer view
router.get("/sold", authenticate, getSoldOrders); // Seller view
router.patch("/:orderItemId/status", updateOrderItemStatus); // Fulfillment status update

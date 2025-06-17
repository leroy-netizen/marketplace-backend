import { Router } from "express";
import { authRbac, authenticate } from "../../middlewares/auth.middleware";
import {getAllOrders, getOrderDetails, updateOrderStatus} from "../../controllers/admin/orders.admin.controller"

export const adminRouter = Router();

adminRouter.get("/", authenticate, authRbac("admin"), getAllOrders);
adminRouter.get("/:orderId", authenticate, authRbac("admin"), getOrderDetails);
adminRouter.patch("/:orderId/status", authenticate, authRbac("admin"), updateOrderStatus);

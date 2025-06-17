import { Response } from "express";
import * as AdminOrderService from "../../services/admin/orders.admin.service";
import { AuthenticatedRequest } from "../../types";
import logger from "../../utils/logger";

export const getAllOrders = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const filters = req.query;
    logger.info("Admin fetching all orders", {
      adminId: req.user?.id,
      filters,
    });

    const orders = await AdminOrderService.getAllOrders(filters);

    logger.info("Admin orders fetched successfully", {
      adminId: req.user?.id,
      orderCount: orders.length,
    });

    res.json(orders);
    return;
  } catch (error: any) {
    logger.error("Error fetching admin orders", {
      adminId: req.user?.id,
      error: error.message,
      stack: error.stack,
    });

    res.status(500).json({ error: "An error occurred while fetching orders." });
  }
  return;
};

export const getOrderDetails = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { orderId } = req.params;
    logger.info("Admin fetching order details", {
      adminId: req.user?.id,
      orderId,
    });

    const order = await AdminOrderService.getOrderDetails(orderId);

    logger.info("Admin order details fetched successfully", {
      adminId: req.user?.id,
      orderId,
    });

    res.json(order);
    return;
  } catch (error: any) {
    logger.error("Error fetching order details", {
      adminId: req.user?.id,
      orderId: req.params.orderId,
      error: error.message,
      stack: error.stack,
    });

    res.status(error.message === "Order not found" ? 404 : 500).json({
      error: error.message || "An error occurred while fetching order details.",
    });
    return;
  }
};

export const updateOrderStatus = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { orderId } = req.params;
    const { newStatus } = req.body;

    logger.info("Admin updating order status", {
      adminId: req.user?.id,
      orderId,
      newStatus,
    });

    await AdminOrderService.updateOrderStatus(orderId, newStatus);

    logger.info("Order status updated successfully", {
      adminId: req.user?.id,
      orderId,
      newStatus,
    });

    res.json({ message: "Order status updated successfully." });
    return;
  } catch (error: any) {
    logger.error("Error updating order status", {
      adminId: req.user?.id,
      orderId: req.params.orderId,
      newStatus: req.body.newStatus,
      error: error.message,
      stack: error.stack,
    });

    res.status(error.message === "Order not found" ? 404 : 500).json({
      error: error.message || "An error occurred while updating order status.",
    });
    return;
  }
};

import { Response } from "express";
import * as AdminOrderService from "../../services/admin/orders.admin.service";
import { AuthenticatedRequest } from "../../types";

export const getAllOrders = async (
  req: AuthenticatedRequest,
  res: Response
) => {
    try {
        
      const filters = req.query;
      const orders = await AdminOrderService.getAllOrders(filters);
      res.json(orders);
      return;
  } catch (error) {
    res.status(500).json({ error: "An error occurred while fetching orders." });
    console.log("Error fetching orders:", error);
    // Optionally, you can log the error to a logging service or file
    return;
  }
};

export const getOrderDetails = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { orderId } = req.params;
  const order = await AdminOrderService.getOrderDetails(orderId);
  res.json(order);
  return;
};

export const updateOrderStatus = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { orderId } = req.params;
  const { newStatus } = req.body;
  console.log("Current user role >", req.user?.role);
  await AdminOrderService.updateOrderStatus(orderId, newStatus);
  res.json({ message: "Order status updated successfully." });
  return;
};

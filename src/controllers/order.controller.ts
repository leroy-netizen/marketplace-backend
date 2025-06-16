import { AuthenticatedRequest } from "../types";
import { Response } from "express";
import { createOrderFromCart } from "../services/order.service";
import * as OrderService from "../services/order.service";

export const checkoutController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const order = await createOrderFromCart(userId);
    res.status(201).json({
      message: "Order created successfully",
      data: order,
    });
  } catch (e: any) {
    res.status(400).json({ message: e.message });
    return;
  }
};

export const getMyOrders = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const orders = await OrderService.fetchBuyerOrders(userId);
  res.status(200).json({ orders });
  return;
};

export const getSoldOrders = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userId = req.user!.id;
  const orders = await OrderService.fetchSellerOrders(userId);
  res.status(200).json({ orders });
  return;
};

export const updateOrderItemStatus = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const sellerId = req.user!.id;
  const { orderItemId } = req.params;
  const { status } = req.body;

  if (!status) {
    res.status(400).json({ message: "Status is required" });
    return;
  }

  const updated = await OrderService.updateOrderItemStatus(
    orderItemId,
    status,
    sellerId
  );

  res.status(200).json({ orderItem: updated });
  return;
};

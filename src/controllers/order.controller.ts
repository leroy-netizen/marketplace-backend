import { AuthenticatedRequest } from "../types";
import { Response } from "express";
import { createOrderFromCart } from "../services/order.service";

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

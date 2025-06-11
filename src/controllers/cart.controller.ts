import { Response, Request } from "express";
import { AuthenticatedRequest } from "../types";
import {
  addOrUpdateCartItem,
  getUserCartItems,
  updateCartItemQuantity,
  deleteCartItem,
  clearUserCart,
} from "../services";

export const addToCart = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const userId = req.user!.id;
  const { productId, quantity } = req.body;

  if (!productId || typeof quantity !== "number") {
    res.status(400).json({
      message: " Invalid input: Product ID and quantity are required",
    });
    return;
  }

  try {
    const cartItem = await addOrUpdateCartItem(userId, productId, quantity);
    res.status(200).json(cartItem);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
    console.log("Error adding/updating cart item >>:", err);
    return;
  }
};

export const getCartItems = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const userId = req.user!.id;

  try {
    const items = await getUserCartItems(userId);
    res.status(200).json(items);
    return;
  } catch (err: any) {
    res.status(500).json({ message: err.message });
    return;
  }
};

export const updateCartItem = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const userId = req.user!.id;
  const cartItemId = req.params.id;
  const { quantity } = req.body;

  if (typeof quantity !== "number" || quantity < 1) {
    res.status(400).json({ message: "Quantity must be a positive number" });
    return;
  }

  try {
    const updated = await updateCartItemQuantity(userId, cartItemId, quantity);
    res.status(200).json(updated);
    return;
  } catch (err: any) {
    res.status(400).json({ message: err.message });
    return;
  }
};
export const removeCartItem = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const userId = req.user!.id;
  const cartItemId = req.params.id;

  try {
    await deleteCartItem(userId, cartItemId);
    res.status(204).send({ message: "Cart item removed successfully" });
    return;
  } catch (err: any) {
    res.status(400).json({ message: err.message });
    return;
  }
};
export const clearCart = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const userId = req.user!.id;

  try {
    await clearUserCart(userId);
    res.status(204).send({ message: "Cart cleared successfully" });
    return;
  } catch (err: any) {
    res.status(500).json({ message: err.message });
    return;
  }
};

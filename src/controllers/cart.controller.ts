import { Response, Request } from "express";
import { AuthenticatedRequest } from "../types";
import { addOrUpdateCartItem } from "../services";

export const getCartItems = async (req: Request, res: Response) => {};
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
  }
};
export const updateCartItem = async (req: Request, res: Response) => {};
export const deleteCartItem = async (req: Request, res: Response) => {};
export const clearCart = async (req: Request, res: Response) => {};

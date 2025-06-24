import express from "express";
import {
  getCartItems,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../controllers/cart.controller";
import { authenticate } from "../middlewares/auth.middleware";

export const cartRoutes = express.Router();
//@ts-ignore

cartRoutes.use(authenticate);

cartRoutes.get("/get-all-items", authenticate, getCartItems);
cartRoutes.post("/add-to", authenticate, addToCart);
cartRoutes.patch("/update/:itemId", authenticate, updateCartItem);
cartRoutes.delete("/remove/:itemId", authenticate, removeCartItem);
cartRoutes.delete("/clear", authenticate, clearCart);

import express from "express";
import {
  getCartItems,
  addToCart,
  updateCartItem,
  deleteCartItem,
  clearCart,
} from "../controllers/cart.controller";
import { authenticate } from "../middlewares/auth.middleware";

export const cartRoutes = express.Router();
//@ts-ignore

cartRoutes.use(authenticate);

cartRoutes.get("/get-all-items", getCartItems);
cartRoutes.post("/add-to", authenticate, addToCart);
cartRoutes.patch("/update/:itemId", updateCartItem);
cartRoutes.delete("/remove/:itemId", deleteCartItem);
cartRoutes.delete("/clear", clearCart);



import express from "express";
import {
  getCartItems,
  addToCart,
  updateCartItem,
  deleteCartItem,
  clearCart,
} from "../controllers/cart.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = express.Router();
//@ts-ignore

router.use(authenticate);

router.get("/", getCartItems);
router.post("/", addToCart);
router.patch("/:itemId", updateCartItem);
router.delete("/:itemId", deleteCartItem);
router.delete("/", clearCart);

export default router;

import { Router } from "express";
import {
  createProductController,
  deleteProductController,
  getProductsBySellerController,
  getSellerProductsController,
  updateProductController,
  getAllProductsController,
  suggestProductsController,
} from "../controllers/product.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/upload.middleware";

export const productRoutes = Router();

//seller create product
productRoutes.post(
  "/create-new",
  authenticate,
  upload.array("images", 5),
  createProductController
);
// get all products (publicly browsable)
productRoutes.get("/", getAllProductsController);
//get predictive suggestions for products
//@ts-ignore
productRoutes.get("/suggest", suggestProductsController);

// get seller products
//@ts-ignore
productRoutes.get("/seller", authenticate, getSellerProductsController);

// get seller products by id (public)

productRoutes.get("/seller/:sellerId", getProductsBySellerController);
//@ts-ignore
productRoutes.delete("/products/:id", authenticate, deleteProductController);
productRoutes.put(
  "/:id",
  //@ts-ignore
  authenticate,
  upload.array("images"),
  //@ts-ignore
  updateProductController
);

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

const router = Router();

//seller create product
router.post(
  "/create-new",
  //@ts-ignore
  authenticate,
  upload.array("images", 5),
  createProductController
);
// get all products (publicly browsable)
router.get("/", getAllProductsController);
//get predictive suggestions for products
//@ts-ignore
router.get("/suggest", suggestProductsController);

// get seller products
//@ts-ignore
router.get("/seller", authenticate, getSellerProductsController);

// get seller products by id (public)

router.get("/seller/:sellerId", getProductsBySellerController);
//@ts-ignore
router.delete("/products/:id", authenticate, deleteProductController);
router.put(
  "/:id",
  //@ts-ignore
  authenticate,
  upload.array("images"),
  updateProductController
);

export default router;

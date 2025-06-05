import { Response, Request } from "express";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductsBySeller,
  getSellerProducts,
  updateProduct,
} from "../services/product.service";

// import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { AuthenticatedRequest } from "../types";

export const createProductController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const files = req.files as Express.Multer.File[];
  const imagePaths = files.map((file) => file.path);
  try {
    const { title, description, price, category, images } = req.body;
    const user = req.user; // from auth middleware

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const product = await createProduct({
      title,
      description,
      price,
      category,
      images: imagePaths,
      sellerId: user.id,
    });

    return res.status(201).json({
      message: "Product created successfully",
      data: product,
    });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

export const getSellerProductsController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const sellerId = req.user!.id;

    const products = await getSellerProducts(sellerId);
    return res.status(200).json({
      message: "Seller products fetched successfully",
      data: products,
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAllProductsController = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    console.log({ page: page, limit: limit });

    const products = await getAllProducts(page, limit);
    res.status(200).json({ message: "All products", ...products });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
export const getProductsBySellerController = async (
  req: Request<{ sellerId: string }>,
  res: Response
) => {
  try {
    const { sellerId } = req.params;
    const products = await getProductsBySeller(sellerId);
    res.status(200).json({ message: "Seller products", ...products });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteProductController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const productId = req.params.id;
    const sellerId = req.user!.id;

    await deleteProduct(productId, sellerId);
    return res.status(200).json({ message: "Product deleted successfully" });
  } catch (err: any) {
    const status = err.message === "Unauthorized" ? 403 : 404;
    return res.status(status).json({ message: err.message });
  }
};

export const updateProductController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const sellerId = req.user!.id;
    const productId = req.params.id;
    console.log({ Request: req });

    const { title, description, price, category, imagesToKeep } = req.body;

    const keep = Array.isArray(imagesToKeep)
      ? imagesToKeep
      : imagesToKeep
        ? [imagesToKeep]
        : [];

    const files = req.files as Express.Multer.File[] | undefined;
    const newImages = files ? files.map((f) => `/uploads/${f.filename}`) : [];

    const updatedProduct = await updateProduct({
      title,
      description,
      price: price ? Number(price) : undefined,
      category,
      imagesToKeep: keep,
      newImages,
      sellerId,
      productId,
    });
    console.log("seller id from controller >", sellerId);

    return res
      .status(200)
      .json({ message: "Product updated", data: updatedProduct });
  } catch (err: any) {
    // console.log({ Request: req });
    const code = err.message === "Unauthorized" ? 403 : 404;
    return res.status(code).json({ message: err.message });
  }
};

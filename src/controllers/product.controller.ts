import { Response, Request } from "express";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getPredictiveSuggestions,
  getProductById,
  getProductsBySeller,
  getSellerProducts,
  updateProduct,
} from "../services/product.service";

import { AuthenticatedRequest } from "../types";

export const createProductController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const files = req.files as Express.Multer.File[];
  const imagePaths = files
    ? files.map((file) => `/uploads/${file.filename}`)
    : [];
  try {
    const { title, description, price, category, quantity, images } = req.body;
    const user = req.user; // from auth middleware

    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Validate required fields
    if (!title || !description || !price || !category) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    // Validate at least one image is provided
    if (!imagePaths || imagePaths.length === 0) {
      res.status(400).json({ message: "At least one image is required" });
      return;
    }

    const product = await createProduct({
      title,
      description,
      price: Number(price),
      category,
      quantity: quantity ? Number(quantity) : 0,
      images: imagePaths,
      sellerId: user.id,
    });

    res.status(201).json({
      message: "Product created successfully",
      data: product,
    });
    return;
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getSellerProductsController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const sellerId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const fuzzy = req.query.fuzzy === "true" || req.query.fuzzy === "true";
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrder = (req.query.sortOrder as string) || "desc";

    const result = await getSellerProducts(
      sellerId,
      page,
      limit,
      search,
      fuzzy,
      sortBy,
      sortOrder
    );
    return res.status(200).json({
      message: "Seller products fetched successfully",
      ...result,
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
export const getProductByIdController = async (req: Request, res: Response) => {
  try {
    const productId = req.params.id;
    const product = await getProductById(productId);
    if (!product) {
      res.status(400).json({ message: "Product not found" });
      return;
    }
    res
      .status(200)
      .json({ message: "Product fetched successfully", data: product });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
    return;
  }
};

export const getAllProductsController = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";

    const products = await getAllProducts(req.query);
    res.status(200).json({ message: "All products", ...products });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
export const suggestProductsController = async (
  req: Request,
  res: Response
) => {
  try {
    const suggestions = await getPredictiveSuggestions(req.query);
    return res.status(200).json({ suggestions });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};

export const getProductsBySellerController = async (
  req: Request<{ sellerId: string }>,
  res: Response
) => {
  try {
    const { sellerId } = req.params;
    const products = await getProductsBySeller(sellerId);
    res.status(200).json({ message: "Seller products", data: products });
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

    const { title, description, price, category, quantity, imagesToKeep } =
      req.body;

    const keep = Array.isArray(imagesToKeep)
      ? imagesToKeep
      : imagesToKeep
        ? [imagesToKeep]
        : [];

    const files = req.files as Express.Multer.File[] | undefined;
    const newImages = files ? files.map((f) => `/uploads/${f.filename}`) : [];

    // Validate that at least one image will remain after update
    const totalImages = keep.length + newImages.length;
    if (totalImages === 0) {
      res.status(400).json({ message: "At least one image is required" });
      return;
    }

    const updatedProduct = await updateProduct({
      title,
      description,
      price: price ? Number(price) : undefined,
      category,
      quantity: quantity ? Number(quantity) : undefined,
      imagesToKeep: keep,
      newImages,
      sellerId,
      productId,
    });

    return res
      .status(200)
      .json({ message: "Product updated", data: updatedProduct });
  } catch (err: any) {
    const code = err.message === "Unauthorized" ? 403 : 404;
    return res.status(code).json({ message: err.message });
  }
};

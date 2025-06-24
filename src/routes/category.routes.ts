import { Router } from "express";
import {
  createCategoryController,
  getAllCategoriesController,
  getCategoryByIdController,
  updateCategoryController,
  deleteCategoryController,
} from "../controllers/category.controller";
import { authenticate } from "../middlewares/auth.middleware";

export const categoryRoutes = Router();

// Public routes
categoryRoutes.get("/", getAllCategoriesController);
categoryRoutes.get("/:id", getCategoryByIdController);

// Admin-only routes
categoryRoutes.post("/", authenticate, createCategoryController);
categoryRoutes.put("/:id", authenticate, updateCategoryController);
categoryRoutes.delete("/:id", authenticate, deleteCategoryController);

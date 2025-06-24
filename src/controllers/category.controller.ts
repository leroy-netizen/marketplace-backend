import { Request, Response } from "express";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../services/category.service";
import { AuthenticatedRequest } from "../types";

export const createCategoryController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;

    if (!user || user.role !== "admin") {
      res.status(403).json({ message: "Admin access required" });
      return;
    }

    const { name, description, icon, sortOrder } = req.body;

    if (!name) {
      res.status(400).json({ message: "Category name is required" });
      return;
    }

    const category = await createCategory({
      name,
      description,
      icon,
      sortOrder,
    });

    res.status(201).json({
      message: "Category created successfully",
      data: category,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllCategoriesController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const includeInactive = req.query.includeInactive === "true";
    const categories = await getAllCategories(includeInactive);

    res.status(200).json({
      message: "Categories retrieved successfully",
      data: categories,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getCategoryByIdController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const category = await getCategoryById(id);

    res.status(200).json({
      message: "Category retrieved successfully",
      data: category,
    });
  } catch (error: any) {
    const statusCode = error.message === "Category not found" ? 404 : 500;
    res.status(statusCode).json({ message: error.message });
  }
};

export const updateCategoryController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;

    if (!user || user.role !== "admin") {
      res.status(403).json({ message: "Admin access required" });
      return;
    }

    const { id } = req.params;
    const { name, description, icon, isActive, sortOrder } = req.body;

    const updatedCategory = await updateCategory(id, {
      name,
      description,
      icon,
      isActive,
      sortOrder,
    });

    res.status(200).json({
      message: "Category updated successfully",
      data: updatedCategory,
    });
  } catch (error: any) {
    const statusCode = error.message === "Category not found" ? 404 : 400;
    res.status(statusCode).json({ message: error.message });
  }
};

export const deleteCategoryController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;

    if (!user || user.role !== "admin") {
      res.status(403).json({ message: "Admin access required" });
      return;
    }

    const { id } = req.params;
    const result = await deleteCategory(id);

    res.status(200).json(result);
  } catch (error: any) {
    const statusCode = error.message === "Category not found" ? 404 : 400;
    res.status(statusCode).json({ message: error.message });
  }
};

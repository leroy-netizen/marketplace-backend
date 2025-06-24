import { AppDataSource } from "../config/db.config";
import { Category } from "../entities/Category.entity";
import { redisClient } from "../config/redis.config";

const CATEGORY_CACHE_TTL = 3600; // 1 hour

interface CreateCategoryPayload {
  name: string;
  description?: string;
  icon?: string;
  sortOrder?: number;
}

interface UpdateCategoryPayload {
  name?: string;
  description?: string;
  icon?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export const createCategory = async (payload: CreateCategoryPayload) => {
  const categoryRepo = AppDataSource.getRepository(Category);

  // Check if category with same name already exists
  const existingCategory = await categoryRepo.findOne({
    where: { name: payload.name },
  });

  if (existingCategory) {
    throw new Error("Category with this name already exists");
  }

  const newCategory = categoryRepo.create({
    name: payload.name,
    description: payload.description,
    icon: payload.icon,
    sortOrder: payload.sortOrder || 0,
  });

  const savedCategory = await categoryRepo.save(newCategory);
  await invalidateCategoriesCache();
  return savedCategory;
};

export const getAllCategories = async (includeInactive = false) => {
  const cacheKey = `categories:${includeInactive ? 'all' : 'active'}`;
  const cachedCategories = await redisClient.get(cacheKey);

  if (cachedCategories) {
    return JSON.parse(cachedCategories);
  }

  const categoryRepo = AppDataSource.getRepository(Category);
  const whereCondition = includeInactive ? {} : { isActive: true };

  const categories = await categoryRepo.find({
    where: whereCondition,
    order: { sortOrder: "ASC", name: "ASC" },
  });

  await redisClient.setEx(cacheKey, CATEGORY_CACHE_TTL, JSON.stringify(categories));
  return categories;
};

export const getCategoryById = async (categoryId: string) => {
  const cachedCategory = await redisClient.get(`category:${categoryId}`);
  if (cachedCategory) {
    return JSON.parse(cachedCategory);
  }

  const categoryRepo = AppDataSource.getRepository(Category);
  const category = await categoryRepo.findOne({
    where: { id: categoryId },
    relations: ["products"],
  });

  if (!category) {
    throw new Error("Category not found");
  }

  await redisClient.setEx(
    `category:${categoryId}`,
    CATEGORY_CACHE_TTL,
    JSON.stringify(category)
  );
  return category;
};

export const updateCategory = async (
  categoryId: string,
  payload: UpdateCategoryPayload
) => {
  const categoryRepo = AppDataSource.getRepository(Category);

  const category = await categoryRepo.findOne({
    where: { id: categoryId },
  });

  if (!category) {
    throw new Error("Category not found");
  }

  // Check if name is being updated and if it conflicts with existing category
  if (payload.name && payload.name !== category.name) {
    const existingCategory = await categoryRepo.findOne({
      where: { name: payload.name },
    });

    if (existingCategory) {
      throw new Error("Category with this name already exists");
    }
  }

  Object.assign(category, payload);
  const updatedCategory = await categoryRepo.save(category);

  await invalidateCategoriesCache();
  await redisClient.del(`category:${categoryId}`);

  return updatedCategory;
};

export const deleteCategory = async (categoryId: string) => {
  const categoryRepo = AppDataSource.getRepository(Category);

  const category = await categoryRepo.findOne({
    where: { id: categoryId },
    relations: ["products"],
  });

  if (!category) {
    throw new Error("Category not found");
  }

  // Check if category has products
  if (category.products && category.products.length > 0) {
    throw new Error("Cannot delete category with existing products");
  }

  await categoryRepo.remove(category);
  await invalidateCategoriesCache();
  await redisClient.del(`category:${categoryId}`);

  return { message: "Category deleted successfully" };
};

const invalidateCategoriesCache = async () => {
  await redisClient.del("categories:active");
  await redisClient.del("categories:all");
};

import { resolve } from "path";
import { AppDataSource } from "../config/db.config";
import { Product } from "../entities/Product.entity";
import { User } from "../entities/User.entity";
import { Category } from "../entities/Category.entity";
import { unlinkSync } from "fs";
import { redisClient } from "../config/redis.config";
import Fuse from "fuse.js";

interface CreateProductPayload {
  title: string;
  description: string;
  price: number;
  category: string;
  quantity?: number;
  images: string[];
  sellerId: string;
}

export const createProduct = async (payload: CreateProductPayload) => {
  const userRepo = AppDataSource.getRepository(User);
  const productRepo = AppDataSource.getRepository(Product);
  const categoryRepo = AppDataSource.getRepository(Category);

  const seller = await userRepo.findOneBy({ id: payload.sellerId });
  if (!seller || seller.role !== "seller") {
    throw new Error("Only verified sellers can create products");
  }

  // Find the category by ID
  const category = await categoryRepo.findOneBy({ id: payload.category });
  if (!category) {
    throw new Error("Category not found");
  }

  const newProduct = productRepo.create({
    title: payload.title,
    description: payload.description,
    price: payload.price,
    category: category,
    quantity: payload.quantity || 0,
    images: payload.images,
    seller,
  });
  const savedProduct = await productRepo.save(newProduct);
  await invalidateSellerProductsCache(payload.sellerId);

  return savedProduct;
};

//for when a seller needs to view the products they have / also when a user just want to go to the specific seller listing
export const getSellerProducts = async (
  sellerId: string,
  page: number = 1,
  limit: number = 10,
  search?: string,
  fuzzy?: boolean,
  sortBy: string = "createdAt",
  sortOrder: string = "desc"
) => {
  const skip = (page - 1) * limit;
  const cacheKey = `seller:products:${sellerId}:page:${page}:limit:${limit}:search:${search || ""}:fuzzy:${fuzzy || false}:sort:${sortBy}:${sortOrder}`;

  // Skip cache for search queries to ensure fresh results
  if (!search) {
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
  }

  const productRepo = AppDataSource.getRepository(Product);
  const qb = productRepo
    .createQueryBuilder("product")
    .leftJoinAndSelect("product.seller", "seller")
    .leftJoinAndSelect("product.category", "category")
    .where("seller.id = :sellerId", { sellerId });

  // Apply search if provided
  if (search && !fuzzy) {
    qb.andWhere(
      "(LOWER(product.title) LIKE :search OR LOWER(product.description) LIKE :search)",
      { search: `%${search.toLowerCase()}%` }
    );
  }

  // Apply sorting
  const validSortFields = ["createdAt", "updatedAt", "title", "price"];
  const validSortOrders = ["asc", "desc"];

  const finalSortBy = validSortFields.includes(sortBy) ? sortBy : "createdAt";
  const finalSortOrder = validSortOrders.includes(sortOrder.toLowerCase())
    ? sortOrder.toUpperCase()
    : "DESC";

  qb.orderBy(`product.${finalSortBy}`, finalSortOrder as "ASC" | "DESC");

  // For non-fuzzy search or no search, use query builder
  if (!fuzzy || !search) {
    const [products, totalItems] = await qb
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(totalItems / limit);

    const result = {
      data: products || [],
      currentPage: page,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };

    // Cache non-search results
    if (!search) {
      await redisClient.setEx(
        cacheKey,
        PRODUCT_CACHE_TTL,
        JSON.stringify(result)
      );
    }

    return result;
  }

  // For fuzzy search, get all seller products and apply fuzzy matching
  const allProducts = await qb.getMany();

  // Apply fuzzy search
  const fuse = new Fuse(allProducts, {
    keys: ["title", "description", "category.name"],
    threshold: 0.3,
    distance: 200,
    minMatchCharLength: 2,
    includeScore: true,
  });

  const searchResults = fuse.search(search);
  let filteredResults = searchResults.map((result) => result.item);

  // Apply sorting to fuzzy search results
  filteredResults.sort((a, b) => {
    let aValue, bValue;

    switch (finalSortBy) {
      case "title":
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case "price":
        aValue = Number(a.price);
        bValue = Number(b.price);
        break;
      case "updatedAt":
        aValue = new Date(a.updatedAt).getTime();
        bValue = new Date(b.updatedAt).getTime();
        break;
      case "createdAt":
      default:
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        break;
    }

    if (finalSortOrder === "ASC") {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  // Apply pagination to filtered results
  const totalItems = filteredResults.length;
  const paginated = filteredResults.slice(skip, skip + limit);
  const totalPages = Math.ceil(totalItems / limit);

  return {
    data: paginated,
    currentPage: page,
    totalItems,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
};

// list all products by all sellers (@publicly browsable)

export const getAllProducts = async (query: any) => {
  const {
    page = 1,
    limit = 10,
    search,
    fuzzy,
    sortBy = "createdAt",
    sortOrder = "desc",
    ...filters
  } = query;

  const take = Number(limit);

  const productRepo = AppDataSource.getRepository(Product);
  const qb = productRepo
    .createQueryBuilder("product")
    .leftJoinAndSelect("product.seller", "seller")
    .leftJoinAndSelect("product.category", "category");

  // Search across title and description
  const { category, minPrice, maxPrice, startDate, endDate, title } = filters;

  // Convert fuzzy to boolean properly
  const useFuzzySearch = fuzzy === "true" || fuzzy === true;

  // Apply non-fuzzy search directly in the query builder if needed
  if (search && !useFuzzySearch) {
    qb.andWhere(
      "(LOWER(product.title) LIKE :search OR LOWER(product.description) LIKE :search)",
      { search: `%${search.toLowerCase()}%` }
    );
  }

  if (category) {
    qb.andWhere("category.id = :categoryId", { categoryId: category });
  }

  if (minPrice) {
    qb.andWhere("product.price >= :minPrice", { minPrice: Number(minPrice) });
  }

  if (maxPrice) {
    qb.andWhere("product.price <= :maxPrice", { maxPrice: Number(maxPrice) });
  }

  if (startDate) {
    qb.andWhere("product.createdAt >= :startDate", { startDate });
  }

  if (endDate) {
    qb.andWhere("product.createdAt <= :endDate", { endDate });
  }

  if (title) {
    qb.andWhere("LOWER(product.title) LIKE :title", {
      title: `%${title.toLowerCase()}%`,
    });
  }

  // Apply sorting
  const validSortFields = ["createdAt", "updatedAt", "title", "price"];
  const validSortOrders = ["asc", "desc"];

  const finalSortBy = validSortFields.includes(sortBy) ? sortBy : "createdAt";
  const finalSortOrder = validSortOrders.includes(sortOrder.toLowerCase())
    ? sortOrder.toUpperCase()
    : "DESC";

  qb.orderBy(`product.${finalSortBy}`, finalSortOrder as "ASC" | "DESC");

  // For non-fuzzy search, we can directly return the query results
  if (!useFuzzySearch || !search) {
    const [results, total] = await qb
      .skip((Number(page) - 1) * take)
      .take(take)
      .getManyAndCount();

    return {
      data: results,
      currentPage: Number(page),
      totalItems: total,
      totalPages: Math.ceil(total / take),
    };
  }

  // For fuzzy search, we need to get all results and filter them
  const allResults = await qb.getMany();

  // Apply fuzzy search
  const fuse = new Fuse(allResults, {
    keys: ["title", "description", "category.name"],
    threshold: 0.3,
    distance: 200,
    minMatchCharLength: 2,
    includeScore: true,
  });

  const searchResults = fuse.search(search);
  let filteredResults = searchResults.map((result) => result.item);

  // Apply sorting to fuzzy search results
  filteredResults.sort((a, b) => {
    let aValue, bValue;

    switch (finalSortBy) {
      case "title":
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case "price":
        aValue = Number(a.price);
        bValue = Number(b.price);
        break;
      case "updatedAt":
        aValue = new Date(a.updatedAt).getTime();
        bValue = new Date(b.updatedAt).getTime();
        break;
      case "createdAt":
      default:
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        break;
    }

    if (finalSortOrder === "ASC") {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  // Apply pagination to filtered results
  const total = filteredResults.length;
  const skip = (Number(page) - 1) * Number(limit);
  const paginated = filteredResults.slice(skip, skip + Number(limit));

  return {
    data: paginated,
    currentPage: Number(page),
    totalItems: total,
    totalPages: Math.ceil(total / Number(limit)),
  };
};
const PRODUCT_CACHE_TTL = 3600; // 1 hour

const invalidateProductCache = async (productId: string) => {
  await redisClient.del(`product:${productId}`);
};
const invalidateSellerProductsCache = async (sellerId: string) => {
  // Delete all paginated cache keys for this seller
  const keys = await redisClient.keys(`seller:products:${sellerId}:*`);
  if (keys.length > 0) {
    await Promise.all(keys.map((key) => redisClient.del(key)));
  }
  // Also delete the old cache key format for backward compatibility
  await redisClient.del(`seller:products:${sellerId}`);
};

//get product by id (publicly browsable)
export const getProductById = async (productId: string) => {
  const cachedProduct = await redisClient.get(`product:${productId}`);
  if (cachedProduct) {
    return JSON.parse(cachedProduct);
  }
  const productRepo = AppDataSource.getRepository(Product);
  const product = await productRepo.findOne({
    where: { id: productId },
    relations: ["seller", "category"],
  });
  if (!product) {
    throw new Error("Product not found");
  }
  // Cache the product
  await redisClient.setEx(
    `product:${productId}`,
    PRODUCT_CACHE_TTL,
    JSON.stringify(product)
  );
  return product;
};

//predictive search for products
export const getPredictiveSuggestions = async (query: any) => {
  const { query: searchTerm } = query;
  if (!searchTerm || typeof searchTerm !== "string") {
    throw new Error("Query is required");
  }

  const productRepo = AppDataSource.getRepository(Product);

  const suggestions = await productRepo
    .createQueryBuilder("product")
    .select("product.title")
    .where("LOWER(product.title) LIKE :search", {
      search: `${searchTerm.toLowerCase()}%`,
    })
    .limit(5)
    .getMany();

  return suggestions.map((p) => p.title);
};

//list products by seller id (public/ browsable)
export const getProductsBySeller = async (sellerId: string) => {
  const products = await AppDataSource.getRepository(Product).find({
    where: { seller: { id: sellerId } },
    relations: ["seller", "category"],
    order: { createdAt: "DESC" },
  });
  return products || [];
};

//delete product (seller)
export const deleteProduct = async (productId: string, sellerId: string) => {
  const productRepo = AppDataSource.getRepository(Product);
  const product = await productRepo.findOne({
    where: { id: productId },
    relations: ["seller", "category"],
  });

  if (!product) throw new Error("Product not found");

  if (product.seller.id !== sellerId) throw new Error("Unauthorized");

  await productRepo.remove(product);
  await invalidateProductCache(productId);
  await invalidateSellerProductsCache(sellerId);
  return true;
};

interface UpdateProductPayload {
  title?: string;
  description?: string;
  price?: number;
  category?: string;
  quantity?: number;
  imagesToKeep?: string[];
  newImages?: string[];
  sellerId: string;
  productId: string;
}

export const updateProduct = async ({
  title,
  description,
  price,
  category,
  quantity,
  imagesToKeep = [],
  newImages = [],
  sellerId,
  productId,
}: UpdateProductPayload) => {
  const productRepo = AppDataSource.getRepository(Product);
  const categoryRepo = AppDataSource.getRepository(Category);

  const product = await productRepo.findOne({
    where: { id: productId },
    relations: ["seller", "category"],
  });

  if (!product) {
    throw new Error("Product not found");
  }

  if (String(product.seller.id) !== String(sellerId)) {
    console.log("PRODUCT ID >", product.id);
    console.log("seller ID >", sellerId, product.seller.id);
    throw new Error("Unauthorized");
  }

  // Delete removed images
  const removedImages = product.images.filter(
    (img) => !imagesToKeep.includes(img)
  );
  removedImages.forEach((imgPath) => {
    try {
      const fullPath = resolve("public", imgPath);
      unlinkSync(fullPath); // Remove file from file system
    } catch (err) {
      console.warn("Failed to delete image:", imgPath);
    }
  });

  // Merge images
  const finalImages = [...imagesToKeep, ...newImages];

  // Handle category update if provided
  let categoryEntity = product.category;
  if (category) {
    // Check if category is different from current category
    const currentCategoryId = product.category?.id || null;
    if (category !== currentCategoryId) {
      const foundCategory = await categoryRepo.findOneBy({ id: category });
      if (!foundCategory) {
        throw new Error("Category not found");
      }
      categoryEntity = foundCategory;
    }
  }

  // Update fields explicitly (avoiding undefined values)
  if (title !== undefined) product.title = title;
  if (description !== undefined) product.description = description;
  if (price !== undefined) product.price = price;
  if (categoryEntity !== undefined) product.category = categoryEntity;
  if (quantity !== undefined) product.quantity = quantity;
  product.images = finalImages;

  const updatedProduct = await productRepo.save(product);
  await invalidateProductCache(productId);
  await invalidateSellerProductsCache(sellerId);

  return updatedProduct;
};

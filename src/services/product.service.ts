import { resolve } from "path";
import { AppDataSource } from "../config/db.config";
import { Product } from "../entities/Product.entity";
import { User } from "../entities/User.entity";
import { unlinkSync } from "fs";
import { redisClient } from "../config/redis.config";
import Fuse from "fuse.js";

interface CreateProductPayload {
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  sellerId: string;
}

export const createProduct = async (payload: CreateProductPayload) => {
  const userRepo = AppDataSource.getRepository(User);
  const productRepo = AppDataSource.getRepository(Product);

  const seller = await userRepo.findOneBy({ id: payload.sellerId });
  if (!seller || seller.role !== "seller") {
    throw new Error("Only verified sellers can create products");
  }

  const newProduct = productRepo.create({
    title: payload.title,
    description: payload.description,
    price: payload.price,
    category: payload.category,
    images: payload.images,
    seller,
  });
  const savedProduct = await productRepo.save(newProduct);
  await invalidateSellerProductsCache(payload.sellerId);

  return savedProduct;
};

//for when a seller needs to view the products they have / also when a user just want to go to the specific seller listing
export const getSellerProducts = async (sellerId: string) => {
  const cachedProducts = await redisClient.get(`seller:products:${sellerId}`);

  if (cachedProducts) {
    return JSON.parse(cachedProducts);
  }

  const productRepo = AppDataSource.getRepository(Product);
  const products = productRepo.find({
    where: { seller: { id: sellerId } },
    relations: ["seller"],
    order: { createdAt: "DESC" },
  });

  await redisClient.setEx(
    `seller:products:${sellerId}`,
    PRODUCT_CACHE_TTL,
    JSON.stringify(products)
  );
  return products;
};

// list all products by all sellers (@publicly browsable)

export const getAllProducts = async (query: any) => {
  const { page = 1, limit = 10, search, fuzzy, ...filters } = query;

  const take = Number(limit);

  const productRepo = AppDataSource.getRepository(Product);
  const qb = productRepo
    .createQueryBuilder("product")
    .leftJoinAndSelect("product.seller", "seller");

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
    qb.andWhere("product.category = :category", { category });
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
    keys: ["title", "description", "category"],
    threshold: 0.3,
    distance: 200,
    minMatchCharLength: 2,
    includeScore: true,
  });

  const searchResults = fuse.search(search);
  const filteredResults = searchResults.map((result) => result.item);

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
  await redisClient.del(`product${productId}`);
};
const invalidateSellerProductsCache = async (sellerId: string) => {
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
    relations: ["seller"],
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
  return AppDataSource.getRepository(Product).find({
    where: { seller: { id: sellerId } },
    relations: ["seller"],
    order: { createdAt: "DESC" },
  });
};

//delete product (seller)
export const deleteProduct = async (productId: string, sellerId: string) => {
  const productRepo = AppDataSource.getRepository(Product);
  const product = await productRepo.findOne({
    where: { id: productId },
    relations: ["seller"],
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
  imagesToKeep = [],
  newImages = [],
  sellerId,
  productId,
}: UpdateProductPayload) => {
  const productRepo = AppDataSource.getRepository(Product);

  const product = await productRepo.findOne({
    where: { id: productId },
    relations: ["seller"],
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

  // Update fields
  Object.assign(product, {
    title,
    description,
    price,
    category,
    images: finalImages,
  });
  const updatedProduct = await productRepo.save(product);
  await invalidateProductCache(productId);

  return updatedProduct;
};

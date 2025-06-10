import { resolve } from "path";
import { AppDataSource } from "../config/db.config";
import { Product } from "../entities/Product.entity";
import { User } from "../entities/User.entity";
import { unlinkSync } from "fs";
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

  return await productRepo.save(newProduct);
};

//for when a seller needs to view the products they have / also when a user just want to go to the specific seller listing
export const getSellerProducts = async (sellerId: string) => {
  const productRepo = AppDataSource.getRepository(Product);
  const products = productRepo.find({
    where: { seller: { id: sellerId } },
    relations: ["seller"],
    order: { createdAt: "DESC" },
  });
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
  if (search && !fuzzy) {
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

  const allResults = await qb.getMany();
  let filteredResults = allResults;

  if (fuzzy && search) {
    const fuse = new Fuse(allResults, {
      keys: ["title", "description", "category"],
      threshold: 0.3, // lower threshold for fuzzier matching
      distance: 200, // how far in the text to allow a match
      minMatchCharLength: 2, // avoids ignoring short strings
      includeScore: true,
    });
    const results = fuse.search(search);
    filteredResults = results.map((result) => result.item);
  } else if (search) {
    // Standard search fallback (optional)
    filteredResults = allResults.filter(
      (product) =>
        product.title.toLowerCase().includes(search.toLowerCase()) ||
        product.description.toLowerCase().includes(search.toLowerCase())
    );
  }

  const total = filteredResults.length;
  const skip = (Number(page) - 1) * Number(limit);
  const paginated = filteredResults.slice(skip, skip + Number(limit));

  return {
    data: paginated,
    currentPage: Number(page),
    totalItems: total,
    totalPages: Math.ceil(total / limit),
  };
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

  return await productRepo.save(product);
};

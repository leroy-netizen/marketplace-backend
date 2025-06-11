import { AppDataSource } from "../config/db.config";
import { CartItem, Product, User } from "../entities";
import { redisClient } from "../config/redis.config";

const CART_CACHE_TTL = 1800; //30 minutes

export const getUserCartItems = async (userId: string) => {
  const cachedCart = await redisClient.get(`cart:${userId}`);
  if (cachedCart) {
    return JSON.parse(cachedCart);
  }
  const cartRepo = AppDataSource.getRepository(CartItem);

  const cartItems = cartRepo.find({
    where: { user: { id: userId } },
    relations: ["product", "user"],
  });

  await redisClient.setEx(
    `cart:${userId}`,
    CART_CACHE_TTL,
    JSON.stringify(cartItems)
  );
  return cartItems;
};
export const addOrUpdateCartItem = async (
  userId: string,
  productId: string,
  quantity: number
) => {
  const cartRepo = AppDataSource.getRepository(CartItem);
  const productRepo = AppDataSource.getRepository(Product);

  // check if product exists
  const productExists = await productRepo.findOne({
    where: { id: productId },
    relations: ["seller"],
  });
  if (!productExists) {
    throw new Error("Product not found");
  }

  //prevent user from adding their own product to cart
  if (productExists.seller.id === userId) {
    throw new Error("You cannot add your own product to the cart");
  }
  //Find existing cart item
  const existingCartItem = await cartRepo.findOne({
    where: { user: { id: userId }, product: { id: productId } },
    relations: ["user", "product"],
  });
  if (existingCartItem) {
    // Update quantity if item already exists in cart
    existingCartItem.quantity += quantity;
    return await cartRepo.save(existingCartItem);
  }
  // Create new cart item if it doesn't exist
  const newCartItem = cartRepo.create({
    user: { id: userId } as User,
    product: { id: productId } as Product,
    quantity,
  });
  return await cartRepo.save(newCartItem);
};

export const updateCartItemQuantity = async (
  userId: string,
  cartItemId: string,
  quantity: number
) => {
  const repo = AppDataSource.getRepository(CartItem);
  const item = await repo.findOne({
    where: { id: cartItemId },
    relations: ["user"],
  });

  if (!item || item.user.id !== userId) {
    throw new Error("Cart item not found or unauthorized");
  }

  item.quantity = quantity;
  return await repo.save(item);
};
export const deleteCartItem = async (userId: string, cartItemId: string) => {
  const repo = AppDataSource.getRepository(CartItem);
  const item = await repo.findOne({
    where: { id: cartItemId },
    relations: ["user"],
  });

  if (!item || item.user.id !== userId) {
    throw new Error("Cart item not found or unauthorized");
  }

  await repo.remove(item);
};
export const clearUserCart = async (userId: string) => {
  const repo = AppDataSource.getRepository(CartItem);
  const items = await repo.find({
    where: { user: { id: userId } },
  });

  await repo.remove(items);

  await redisClient.del(`cartL${userId}`);
};

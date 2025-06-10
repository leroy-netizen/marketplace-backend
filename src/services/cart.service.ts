import { AppDataSource } from "../config/db.config";
import { CartItem, Product, User } from "../entities";

export const getCartItemsService = async (userId: string) => {};
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

export const updateCartItemService = async (
  userId: string,
  itemId: string,
  quantity: number
) => {};
export const deleteCartItemService = async (
  userId: string,
  itemId: string
) => {};
export const clearCartService = async (userId: string) => {};

import { CartItem, OrderItem, User, Order, Product } from "../entities";
import { AppDataSource } from "../config/db.config";

export const createOrderFromCart = async (userId: string) => {
  const userRepo = AppDataSource.getRepository(User);
  const orderRepo = AppDataSource.getRepository(Order);
  const cartRepo = AppDataSource.getRepository(CartItem);
  const orderItemRepo = AppDataSource.getRepository(OrderItem);
  const productRepo = AppDataSource.getRepository(Product);
  const user = await userRepo.findOne({ where: { id: userId } });

  if (!user) {
    throw new Error("User not found");
  }
  const cartItems = await cartRepo.find({
    where: { user: { id: userId } },
    relations: ["product"],
  });
  if (cartItems.length === 0) {
    throw new Error("Cart is empty");
  }

  const order = new Order();
  order.buyer = user;
  order.total = 0;
  order.status = "pending";

  const orderItems: OrderItem[] = [];
  let total = 0;
  for (const cartItem of cartItems) {
    const product = cartItem.product;

    // check stock
    if (product.quantity < cartItem.quantity) {
      throw new Error(
        `Product "${product.title}" is out of stock or exceeds quantity available`
      );
    }

    const orderItem = new OrderItem();
    orderItem.product = product;
    orderItem.quantity = cartItem.quantity;
    orderItem.unitPrice = product.price;
    orderItem.totalPrice = product.price * cartItem.quantity;
    orderItem.order = order;

    total += orderItem.totalPrice;
    orderItems.push(orderItem);

    //Deduct quantity from stock
    product.quantity -= cartItem.quantity;
    await productRepo.save(product);
  }

  order.total = total;
  await orderRepo.save(order);
  await orderItemRepo.save(orderItems);

  // Clear the cart
  await cartRepo.delete({ user: { id: userId } });

  console.log(
    `Order created for user ID: ${userId} with total: ${order.total}`
  );

  return order;
};

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

export const fetchBuyerOrders = async (buyerId: string) => {
  return await AppDataSource.getRepository(Order).find({
    where: { buyer: { id: buyerId } },
    relations: ["orderItems", "orderItems.product"],
    order: { createdAt: "DESC" },
  });
};

export const fetchSellerOrders = async (sellerId: string) => {
  return await AppDataSource.getRepository(OrderItem)
    .createQueryBuilder("orderItem")
    .leftJoinAndSelect("orderItem.order", "order")
    .leftJoinAndSelect("order.buyer", "buyer")
    .leftJoinAndSelect("orderItem.product", "product")
    .where("product.sellerId = :sellerId", { sellerId })
    .orderBy("order.createdAt", "DESC")
    .getMany();
};

export const updateOrderItemStatus = async (
  orderItemId: string,
  newStatus: "SHIPPED" | "DELIVERED" | "CANCELLED",
  sellerId: string
) => {
  const repo = AppDataSource.getRepository(OrderItem);

  const orderItem = await repo.findOne({
    where: { id: orderItemId },
    relations: ["product"],
  });

  if (!orderItem) throw new Error("Order item not found");

  if (orderItem.product.seller.id !== sellerId)
    throw new Error("Unauthorized seller");

  const allowedTransitions = {
    PENDING: ["SHIPPED", "CANCELLED"],
    SHIPPED: ["DELIVERED", "CANCELLED"],
    DELIVERED: ["CANCELLED"],
  };

  const currentStatus = orderItem.status;
  if (!allowedTransitions[currentStatus].includes(newStatus)) {
    throw new Error(
      `Invalid status transition: ${currentStatus} -> ${newStatus}`
    );
  }
  //@ts-ignore
  orderItem.status = newStatus;
  return await repo.save(orderItem);
};

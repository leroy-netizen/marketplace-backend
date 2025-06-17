import { AppDataSource } from "../../config/db.config";
import { Order } from "../../entities";

export const getAllOrders = async (filters: any) => {
  const repo = AppDataSource.getRepository(Order);

  // TODO: Add filtering logic (status, buyer email, date range)
  const orders = await repo.find({ order: { createdAt: "DESC" } });

  return orders;
};

export const getOrderDetails = async (orderId: string) => {
  const repo = AppDataSource.getRepository(Order);

  const order = await repo.findOne({
    where: { id: orderId },
    relations: ["buyer", "items", "items.product", "items.product.seller"],
  });

  if (!order) throw new Error("Order not found");
  return order;
};

export const updateOrderStatus = async (
  orderId: string,
  newStatus: "pending" | "paid" | "shipped" | "fulfilled" | "cancelled"
) => {
  const repo = AppDataSource.getRepository(Order);
  const order = await repo.findOne({ where: { id: orderId } });
  if (!order) throw new Error("Order not found");

  order.status = newStatus;
  await repo.save(order);
};

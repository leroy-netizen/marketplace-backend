import { AppDataSource } from "../../config/db.config";
import { Order } from "../../entities";

interface OrderFilters {
  status?: string;
  buyerEmail?: string;
  dateFrom?: string;
  dateTo?: string;
}

type OrderStatus = "pending" | "paid" | "shipped" | "fulfilled" | "cancelled";

export const getAllOrders = async (filters: OrderFilters) => {
  const repo = AppDataSource.getRepository(Order);

  // Basic ordering by creation date - filtering can be added as needed
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
  newStatus: OrderStatus
) => {
  const repo = AppDataSource.getRepository(Order);
  const order = await repo.findOne({ where: { id: orderId } });
  if (!order) throw new Error("Order not found");

  order.status = newStatus;
  await repo.save(order);
};

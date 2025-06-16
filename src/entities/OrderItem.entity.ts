import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from "typeorm";
import { Product } from "./index";
import { Order } from "./index";

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: "CASCADE" })
  order!: Order;

  @ManyToOne(() => Product, { eager: true })
  product!: Product;

  @Column({ type: "int" })
  quantity!: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  priceAtOrder!: number;
  @Column("decimal", { precision: 10, scale: 2 })
  unitPrice!: number;
  @Column({
    type: "enum",
    enum: ["PENDING", "SHIPPED", "DELIVERED"],
    default: "PENDING",
  })
  status!: "PENDING" | "SHIPPED" | "DELIVERED";

  @Column("decimal", { precision: 10, scale: 2 })
  totalPrice!: number;
}

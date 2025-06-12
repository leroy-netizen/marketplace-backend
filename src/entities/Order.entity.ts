import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./index";
import { OrderItem } from "./index";

export type OrderStatus =
  | "pending"
  | "paid"
  | "shipped"
  | "fulfilled"
  | "cancelled";

@Entity()
export class Order {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => User, (user) => user.orders, { eager: true })
  buyer!: User;

  @OneToMany(() => OrderItem, (item) => item.order, {
    cascade: true,
    eager: true,
  })
  items!: OrderItem[];

  @Column({
    type: "enum",
    enum: ["pending", "paid", "shipped", "fulfilled", "cancelled"],
    default: "pending",
  })
  status!: OrderStatus;
  @Column("decimal", { precision: 10, scale: 2 })
  total!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

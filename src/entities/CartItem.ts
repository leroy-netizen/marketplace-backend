import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
} from "typeorm";
import { User } from "./User";
import { Product } from "./Product";

@Entity()
export class CartItem {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => User, (user) => user.cartItems, { onDelete: "CASCADE" })
  user!: User;

  @ManyToOne(() => Product, { eager: true, onDelete: "CASCADE" })
  product!: Product;

  @Column({ type: "int", default: 1 })
  quantity!: number;

  @CreateDateColumn()
  createdAt!: Date;
}

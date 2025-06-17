import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  UpdateDateColumn,
} from "typeorm";
import { IsEmail, Length } from "class-validator";
import { Product } from "./Product.entity";
import { RefreshToken } from "./RefreshToken.entity";
import { CartItem } from "./CartItem.entity";
import { Order } from ".";

export type UserRole = "buyer" | "seller" | "admin";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  @Length(2)
  name!: string;

  @Column({ unique: true })
  @IsEmail()
  email!: string;

  @Column()
  password!: string;

  @Column({ type: "varchar", default: "buyer" })
  role!: UserRole;

  @Column({ default: false })
  isVerified!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
  @UpdateDateColumn()
  updatedAt!: Date;
  @OneToMany(() => CartItem, (cartItem) => cartItem.user, { eager: false })
  cartItems!: CartItem[];

  @OneToMany(() => Product, (product) => product.seller, { eager: false })
  products!: Product[];
  @OneToMany(() => RefreshToken, (token) => token.user, {
    cascade: true,
  })
  @OneToMany(() => Order, (order) => order.buyer)
  orders!: Order[];

  refreshTokens!: RefreshToken[];
}

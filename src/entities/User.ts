import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from "typeorm";
import { IsEmail, Length } from "class-validator";
import { Product } from "./Product";
import { RefreshToken } from "./RefreshToken";
import { CartItem } from "./CartItem";

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
  @OneToMany(() => CartItem, (cartItem) => cartItem.user, { eager: false })
  cartItems!: CartItem[];

  @OneToMany(() => Product, (product) => product.seller, { eager: false })
  products!: Product[];
  @OneToMany(() => RefreshToken, (token) => token.user, {
    cascade: true,
  })
  refreshTokens!: RefreshToken[];
}

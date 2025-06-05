import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from "typeorm";
import { IsEmail, Length } from "class-validator";
import { Product } from "./Product";

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

  @OneToMany(() => Product, (product) => product.seller, { eager: false })
  products!: Product[];
}

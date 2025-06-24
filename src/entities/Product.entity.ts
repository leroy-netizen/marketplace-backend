import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from "typeorm";
import { User } from "./User.entity";
import { Category } from "./Category.entity";

@Entity()
export class Product {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  title!: string;

  @Column()
  description!: string;

  @Column("decimal", { precision: 10, scale: 2 })
  price!: number;

  @ManyToOne(() => Category, (category) => category.products, { eager: true })
  category!: Category;

  @Column({ type: "int", default: 0 })
  quantity!: number;

  @Column("simple-array", { nullable: true })
  images!: string[]; // store as comma-separated string in DB

  @ManyToOne(() => User, (user) => user.products)
  seller!: User;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

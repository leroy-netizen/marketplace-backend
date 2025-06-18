import { DataSource } from "typeorm";
import dotenv from "dotenv";
import path from "path";
import { User, Product, RefreshToken, CartItem, Order, OrderItem, Conversation, Message } from "../entities";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  host: process.env.DB_HOST || "localhost",
  port: +(process.env.DB_PORT || 5432),
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "marketplace",
  migrations: [path.join(__dirname, "../migration/*{.ts,.js}")],
  synchronize: process.env.RUNNING_ENV === "dev",
  logging: true,
  entities: [User, Product, RefreshToken, CartItem, Order, OrderItem, Conversation, Message],
  // Alternatively, you can use the glob pattern:
  // entities: [path.join(__dirname, "../entities/*.entity.ts")],
});

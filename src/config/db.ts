import { DataSource } from "typeorm";
import { User } from "../entities/User";

import dotenv from "dotenv";
import { Product } from "../entities/Product";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  host: process.env.DB_HOST,
  port: +(process.env.DB_PORT || 5432),
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "marketplace",
  synchronize: process.env.RUNNING_ENV === "dev",
  logging: true,
  entities: [User, Product],
});

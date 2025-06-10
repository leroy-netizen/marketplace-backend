import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { AppDataSource } from "./config/db.config";
import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/products.routes";
import path from "path";
import { swaggerUi, swaggerSpec } from "./config/swagger.config";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

//auth routes
app.use("/api/auth", authRoutes);

//product routes
app.use("/api/products", productRoutes);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

const PORT = process.env.PORT || 5000;

AppDataSource.initialize()
  .then(() => {
    console.log("Database connected");
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("DB connection error:", err);
  });

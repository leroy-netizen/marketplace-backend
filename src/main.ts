import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { AppDataSource } from "./config/db.config";
import path from "path";
import { swaggerUi, swaggerSpec } from "./config/swagger.config";
import {
  authRoutes,
  productRoutes,
  cartRoutes,
  adminRouter as orderAdminRoutes,
  conversationRoutes,
} from "./routes";
import { orderRoutes } from "./routes/order.routes";
import logger from "./utils/logger";
import {
  logRequest,
  logError,
  logUnhandledRejection,
  logUncaughtException,
} from "./middlewares/logger.middleware";
import { errorHandler } from "./middlewares/error.middleware";
import { messageRoutes } from "./routes/messages.routes";

process.on("unhandledRejection", logUnhandledRejection);
process.on("uncaughtException", logUncaughtException);

dotenv.config();

const app = express();
app.use(cors({ origin: "*" }));

app.use(cors());
app.use(express.json());
app.use(logRequest);

// API routes
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/products", productRoutes);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use("/api/orders", orderRoutes);
app.use("/api/admin/orders", orderAdminRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);

app.use(logError);
//@ts-ignore
app.use(errorHandler());

const PORT = process.env.PORT || 5000;

AppDataSource.initialize()
  .then(() => {
    logger.info("Database connected successfully");
    app.listen(PORT, () => {
      logger.info(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    logger.error("Database connection failed", {
      error: err.message,
      stack: err.stack,
    });
  });

export default app;

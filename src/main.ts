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
} from "./routes";
import { orderRoutes } from "./routes/order.routes";
import logger from "./utils/logger";
import { logRequest, logError, logUnhandledRejection, logUncaughtException } from "./middlewares/logger.middleware";
import fs from 'fs';
import { Request, Response } from "express";

// Register global error handlers
process.on('unhandledRejection', logUnhandledRejection);
process.on('uncaughtException', logUncaughtException);

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

// Serve logs UI in development
if (process.env.NODE_ENV !== 'production') {
  app.use('/logs-viewer', express.static(path.join(__dirname, '../logs-ui')));
  app.get('/api/logs', (req, res) => {
    const logsDir = path.join(process.cwd(), 'logs');
    const logFiles = fs.readdirSync(logsDir)
      .filter(file => file.endsWith('.log'))
      .map(file => ({
        name: file,
        path: `/api/logs/${file}`,
        date: fs.statSync(path.join(logsDir, file)).mtime
      }))
      .sort((a, b) => b.date.getTime() - a.date.getTime());
    
    res.json(logFiles);
  });
  //@ts-ignore
  app.get('/api/logs/:filename', (req: Request, res: Response) => {
    const filename = req.params.filename;
    const filePath = path.join(process.cwd(), 'logs', filename);
    
    if (!fs.existsSync(filePath) || !filename.endsWith('.log')) {
      return res.status(404).json({ error: 'Log file not found' });
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n')
      .filter(line => line.trim())
      .map(line => {
        try {
          return JSON.parse(line);
        } catch (e) {
          return { message: line };
        }
      });
    
    res.json(lines);
  });
}

// Error handling middleware (must be after all routes)
app.use(logError);

const PORT = process.env.PORT || 5000;

AppDataSource.initialize()
  .then(() => {
    logger.info("Database connected successfully");
    app.listen(PORT, () => {
      logger.info(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    logger.error("Database connection failed", { error: err.message, stack: err.stack });
  });

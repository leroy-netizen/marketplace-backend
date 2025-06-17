import jwt from "jsonwebtoken";
import logger from "./logger";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refreshSecret";

export const signAccessToken = (id: string, role: string) => {
  logger.debug("Signing access token", { userId: id, userRole: role });
  return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: "45m" });
};

export const signRefreshToken = (userId: string) => {
  logger.debug("Signing refresh token", { userId });
  return jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: "7d" });
};

export const verifyToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    logger.debug("Token verified successfully", { decoded });
    return decoded;
  } catch (error) {
    logger.error("Token verification failed", {
      error: error instanceof Error ? error.message : "Unknown error"
    });
    throw error;
  }
};

export const verifyRefreshToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET);
    logger.debug("Refresh token verified successfully", { decoded });
    return decoded;
  } catch (error) {
    logger.error("Refresh token verification failed", {
      error: error instanceof Error ? error.message : "Unknown error"
    });
    throw error;
  }
};

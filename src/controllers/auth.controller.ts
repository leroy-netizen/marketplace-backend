import { Request, Response } from "express";
import { verifyRefreshToken } from "../utils/jwt";
import { RefreshToken, User } from "../entities";
import {
  forgotPasswordService,
  registerUser,
  resetPasswordService,
  userLogin,
} from "../services/auth.service";
import { AppDataSource } from "../config/db.config";
import { signAccessToken } from "../utils/jwt";
import { AuthenticatedRequest } from "../types";
import logger from "../utils/logger";

export const signup = async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;
  try {
    const user = await registerUser(name, email, password, role);
    res.status(201).json({
      message: "Registration done successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        userVerified: user.isVerified,

        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const signin = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const data = await userLogin(email, password);
    res.status(200).json(data);
    return;
  } catch (error: any) {
    res.status(400).json({ message: error.message });
    return;
  }
};

export const refreshAccessToken = async (
  req: Request,
  res: Response
): Promise<Response<any, Record<string, any>>> => {
  const refreshToken = req.body.refreshToken;

  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token required" });
  }

  try {
    const payload = verifyRefreshToken(refreshToken) as {
      userId: string;
    };

    const repo = AppDataSource.getRepository(RefreshToken);
    const tokenInDb = await repo.findOne({
      where: {
        token: refreshToken,
        user: { id: payload.userId },
      },
      relations: ["user"],
    });

    if (!tokenInDb) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const newAccessToken = signAccessToken(
      tokenInDb.user.id,
      tokenInDb.user.role
    );

    return res.status(200).json({ accessToken: newAccessToken });
  } catch (err) {
    res.status(403).json({ message: "Invalid or expired token" });
    logger.error("Error refreshing access token", {
      error: err instanceof Error ? err.message : "Unknown error",
    });
    // @ts-ignore
    return;
  }
};
export const forgotPasswordController = async (req: Request, res: Response) => {
  const { email } = req.body;
  try {
    await forgotPasswordService(email);
    res.status(200).json({ message: `OTP sent to ${email}` });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const resetPasswordController = async (req: Request, res: Response) => {
  const { email, otp, newPassword } = req.body;
  try {
    await resetPasswordService(email, otp, newPassword);
    res.status(200).json({ message: "Password has been successfully reset" });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};


const allowedRoles = ["admin", "seller", "buyer"];

export const updateUserRole = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!allowedRoles.includes(role)) {
    res.status(400).json({ message: "Invalid role provided" });
    return;
  }

  const repo = AppDataSource.getRepository(User);
  const user = await repo.findOneBy({ id });

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  user.role = role;
  await repo.save(user);

  res.status(200).json({ message: `User role updated to ${role}` });
  return;
};

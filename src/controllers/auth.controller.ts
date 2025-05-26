import { Request, Response, RequestHandler } from "express";
import {
  forgotPasswordService,
  registerUser,
  resetPasswordService,
  userLogin,
} from "../services/auth.service";

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
    return res.status(200).json(data);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
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

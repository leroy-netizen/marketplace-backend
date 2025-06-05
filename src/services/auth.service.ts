import { AppDataSource } from "../config/db";
import { redisClient } from "../config/redis";
import { User } from "../entities/User";
import { signAccessToken, signRefreshToken } from "../utils/jwt";
import bcrypt from "bcrypt";
import { sendOTPEmail } from "../utils/mailer";
import { canRequestOTP, deleteOTP, getOTP, setOTP } from "../utils/otp";

export const registerUser = async (
  name: string,
  email: string,
  password: string,
  role: "buyer" | "seller" | "admin" = "buyer"
) => {
  const userRepo = AppDataSource.getRepository(User);
  const hashedPassword = await bcrypt.hash(password, 10);
  const normalizedEmail = email.trim().toLowerCase();
  const userExists = await userRepo.findOneBy({ email: normalizedEmail });

  if (userExists) {
    throw new Error("User with provided email already exists");
  }
  const newUser = userRepo.create({
    name,
    email: normalizedEmail,
    password: hashedPassword,
    role,
  });
  return await userRepo.save(newUser);
};

export const userLogin = async (email: string, password: string) => {
  const userRepo = AppDataSource.getRepository(User);
  const normalizedEmail = email.trim().toLowerCase();
  const userFound = await userRepo.findOne({
    where: { email: normalizedEmail },
  });

  if (!userFound) {
    throw new Error("User not found");
  }

  const isPasswordValid = await bcrypt.compare(password, userFound.password);

  if (!isPasswordValid) {
    throw new Error("Invalid credentials");
  }

  console.log("userFound >>:", userFound);

  const accessToken = signAccessToken(userFound.id, userFound.role);
  const refreshToken = signRefreshToken(userFound.id);

  return {
    accessToken,
    refreshToken,
    user: {
      id: userFound.id,
      name: userFound.name,
      email: userFound.email,
      role: userFound.role,
    },
  };
};

export const forgotPasswordService = async (email: string) => {
  const userRepo = AppDataSource.getRepository(User);
  const user = await userRepo.findOneBy({ email });
  if (!user) throw new Error("User not found");
  const canRequest = await canRequestOTP(email);
  if (!canRequest) throw new Error("Too many OTP requests. Try again later.");

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await setOTP(email, otp);
  await sendOTPEmail(email, otp);
};

export const resetPasswordService = async (
  email: string,
  otp: string,
  newPassword: string
) => {
  const storedOtp = await getOTP(email);
  if (!storedOtp || storedOtp !== otp) {
    throw new Error("Invalid or expired OTP");
  }

  const userRepo = AppDataSource.getRepository(User);
  const user = await userRepo.findOneBy({ email });
  if (!user) throw new Error("User not found");

  user.password = await bcrypt.hash(newPassword, 10);
  await userRepo.save(user);
  await deleteOTP(email);
};

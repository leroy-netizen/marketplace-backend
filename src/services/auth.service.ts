import { AppDataSource } from "../config/db";
import { User } from "../entities/User";
import { signAccessToken, signRefreshToken } from "../utils/jwt";
import bcrypt from "bcrypt";

export const registerUser = async (
  name: string,
  email: string,
  password: string,
  role: "buyer" | "seller" | "admin" = "buyer"
) => {
  const userRepo = AppDataSource.getRepository(User);
  console.log("user repsitoryo >", userRepo);
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
  console.log("user found >", userFound);
  console.log("Email >", email, normalizedEmail);
  const allUsers = await userRepo.find();
  console.log("All users>", allUsers);

  if (!userFound) {
    throw new Error("User not found");
  }

  const isPasswordValid = await bcrypt.compare(password, userFound.password);

  if (!isPasswordValid) {
    throw new Error("Invalid credentials");
  }

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

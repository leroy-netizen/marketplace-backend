import { redisClient } from "../config/redis";

export const setOTP = async (email: string, otp: string) => {
  await redisClient.setEx(`otp:${email}`, 300, otp); // 5 mins
};

export const getOTP = async (email: string) => {
  return await redisClient.get(`otp:${email}`);
};

export const deleteOTP = async (email: string) => {
  return await redisClient.del(`otp:${email}`);
};

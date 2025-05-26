import { redisClient } from "../config/redis";

const OTP_EXPIRY_SECONDS = 300;
const OTP_RATE_LIMIT = 5;
const RATE_LIMIT_WINDOW = 600; // 10 minutes

export const setOTP = async (email: string, otp: string) => {
  await redisClient.setEx(`otp:${email}`, 300, otp); // 5 mins
};

export const getOTP = async (email: string) => {
  return await redisClient.get(`otp:${email}`);
};

export const deleteOTP = async (email: string) => {
  return await redisClient.del(`otp:${email}`);
};

export const canRequestOTP = async (email: string): Promise<boolean> => {
  const key = `otp-req:${email}`;
  const attempts = await redisClient.get(key);

  if (!attempts) {
    await redisClient.setEx(key, RATE_LIMIT_WINDOW, "1");
    return true;
  }

  if (parseInt(attempts) >= OTP_RATE_LIMIT) return false;

  await redisClient.incr(key);
  return true;
};
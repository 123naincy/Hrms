import jwt from "jsonwebtoken";
import { env } from "../config/env";

export const generateToken = (id: string, role: string) => {
  return jwt.sign(
    {
      id,
      role,
    },
    env.JWT_SECRET || "default_secret_key",
    {
      expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    }
  );
};
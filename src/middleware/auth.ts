import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { APP_JWT_KEY } from "../app";

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
      res.status(401).json({ error: "No token provided" });
      return;
    }

    // Using synchronous jwt.verify so that we can catch errors easily
    const decoded = jwt.verify(token, APP_JWT_KEY);
    req.body.tokenPayload = decoded;
    next();
  } catch (error) {
     res.status(403).json({ error: "Invalid token" });
  }
}

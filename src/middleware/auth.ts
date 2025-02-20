import { NextFunction,Request,Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { APP_JWT_KEY } from "../app";


export function authenticateToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) { 
        res.status(401).json({ error: "No token provided" });
        return;
    }
  
    jwt.verify(token, APP_JWT_KEY, (err, decoded) => {
      if (err) { 
        res.status(403).json({ error: "Invalid token" });
        return;
    }
      
      // Attach the decoded token to the request body for later use
      req.body.tokenPayload = decoded;
      next();
    });
  }
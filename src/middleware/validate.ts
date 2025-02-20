// src/middleware/validate.ts
import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export const validateBody = (schema: ZodSchema<any>) => (req: Request, res: Response, next: NextFunction) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    // Map each issue into a string with the path and error message, then join them into one string
    const errorString = result.error.issues
      .map(issue => `${issue.path.join('.') || 'root'}: ${issue.message}`)
      .join('; ');
    res.status(400).json({
      error: `Validation error: ${errorString}`
    });
    return;
  }
  
  // Overwrite req.body with the parsed data for safety
  req.body = result.data;
  next();
};

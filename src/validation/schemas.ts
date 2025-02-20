// src/validation/schemas.ts
import { z } from "zod";

export const joinSchema = z.object({
  gameId: z.string().min(8, { message: "gameId is required" }),
});

export const moveSchema = z.object({
  position: z.number().int().min(0, { message: "Position must be at least 0" }).max(8, { message: "Position must be at most 8" }),
});

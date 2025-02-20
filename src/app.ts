// src/server.ts
import express from "express";
import gameRoutes from './routes/game'
import { globalErrorHandler } from "./middleware/error-handler";
import { notFoundHandler } from "./middleware/not-found";
const app = express();

export const APP_JWT_KEY = process.env.APP_JWT_KEY || "APP_JWT_KEY";

app.use(express.json());

app.use("/game", gameRoutes);

app.use(notFoundHandler);

app.use(globalErrorHandler);

export default app;
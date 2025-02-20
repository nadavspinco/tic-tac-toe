// src/models/Game.ts
import mongoose, { Schema, Document } from "mongoose";
import { Game } from "../interface/game";

export interface IGame extends Game, Document {}

const GameSchema: Schema = new Schema({
  gameId: { type: String, required: true, unique: true },
  board: { type: [String], default: Array(9).fill("") },
  currentPlayer: { type: String, enum: ["X", "O"], required: true },
  winner: { type: String, enum: ["X", "O", "Draw", null], default: null },
  moves: { type: Number, default: 0 },
  players: {
    X: { type: String, required: true },
    O: { type: String, default: null },
  },
}, {
  optimisticConcurrency: true //enable optimisticConcurrency to avoid race condition on board updates.
});

export default mongoose.model<IGame>("Game", GameSchema);
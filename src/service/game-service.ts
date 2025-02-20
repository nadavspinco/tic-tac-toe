// src/services/gameService.ts
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { BoardPosition } from "../interface/game";
import { APP_JWT_KEY } from "../app";
import { GameWasntFound } from "../errors/game-wasnt-found";
import { NotYourTurn } from "../errors/not-your-turn";
import { GameEnded } from "../errors/game-ended";
import { PostionAlreadyTaken } from "../errors/position-already-taken";
import GameModel, { IGame } from "../models/game";

const MAX_MOVES = 9
// Helper function to check for a winner
const checkWinner = (board: string[]): "X" | "O" | null => {
  const winningCombos: number[][] = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (const combo of winningCombos) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a] as "X" | "O";
    }
  }
  return null;
};

// Create a new game with the initiating player as "X"
export const initiateGame = async () => {
  const gameId = crypto.randomBytes(4).toString("hex");
  const playerId = crypto.randomBytes(4).toString("hex");

  // Sign a JWT for the initiating player
  const token = jwt.sign({ gameId, playerId, role: "X" }, APP_JWT_KEY, { expiresIn: "1h" });

  const newGameData: Partial<IGame> = {
    gameId,
    board: Array(9).fill(""),
    currentPlayer: "X",
    winner: null,
    moves: 0,
    players: { X: playerId },
  };

  const newGame = new GameModel(newGameData);
  await newGame.save();

  return { gameId, token };
};

// Allow a second player to join an existing game as "O"
export const joinGame = async (gameId: string) => {
  const game = await GameModel.findOne({ gameId });
  if (!game) {
    throw new GameWasntFound();
  }
  if (game.players.O) {
    throw new Error("Game already has two players");
  }
  const playerId = crypto.randomBytes(4).toString("hex");
  game.players.O = playerId;
  await game.save();

  const token = jwt.sign({ gameId, playerId, role: "O" }, APP_JWT_KEY, { expiresIn: "1h" });
  return { token };
};

// Retrieve the current state of a game
export const getGameState = async (gameId: string): Promise<IGame> => {
  const game = await GameModel.findOne({ gameId });
  if (!game) {
    throw new GameWasntFound();
  }
  return game;
};

// Make a move in the game
export const makeMove = async (
  gameId: string,
  role: "X" | "O",
  position: BoardPosition
): Promise<IGame> => {
  const game = await GameModel.findOne({ gameId });
  if (!game) {
    throw new GameWasntFound();
  }
  if (game.winner) {
    throw new GameEnded();
  }
  if (game.currentPlayer !== role) {
    throw new NotYourTurn();
  }
  if (game.board[position] !== "") {
    throw new PostionAlreadyTaken();
  }

  // Record the move
  game.board[position] = role;
  game.moves++;

  // Check for a winner
  const win = checkWinner(game.board);
  if (win) {
    game.winner = win;
  } else if (game.moves === MAX_MOVES) {
    game.winner = "Draw";
  } else {
    game.currentPlayer = game.currentPlayer === "X" ? "O" : "X";
  }
  await game.save();
  return game;
};

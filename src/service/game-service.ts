// src/services/gameService.ts
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { BoardPosition, Game } from "../interface/game";
import { APP_JWT_KEY } from "../app";
import { GameWasntFound } from "../errors/game-wasnt-found";
import { NotYourTurn } from "../errors/not-your-turn";
import { GameEnded } from "../errors/game-ended";
import { PostionAlreadyTaken } from "../errors/position-already-taken";

// In-memory storage for games
const games: { [gameId: string]: Game } = {};

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
export const initiateGame = () => {
  const gameId = crypto.randomBytes(4).toString("hex");
  const playerId = crypto.randomBytes(4).toString("hex");

  // Sign a JWT for the initiating player
  const token = jwt.sign({ gameId, playerId, role: "X" }, APP_JWT_KEY, { expiresIn: "1h" });

  const newGame: Game = {
    gameId,
    board: Array(9).fill(""),
    currentPlayer: "X",
    winner: null,
    moves: 0,
    players: { X: playerId },
  };

  games[gameId] = newGame;

  return { gameId, token };
};

// Allow a second player to join an existing game as "O"
export const joinGame = (gameId: string) => {
  const game = games[gameId];
  if (!game) {
    throw new GameWasntFound();
  }
  if (game.players.O) {
    throw new Error("Game already has two players");
  }
  const playerId = crypto.randomBytes(4).toString("hex");
  game.players.O = playerId;

  const token = jwt.sign({ gameId, playerId, role: "O" }, APP_JWT_KEY, { expiresIn: "1h" });
  return { token };
};

// Retrieve the current state of a game
export const getGameState = (gameId: string): Game => {
  const game = games[gameId];
  if (!game) {
    throw new Error("Game not found");
  }
  return game;
};

// Make a move in the game
export const makeMove = (gameId: string, role: "X" | "O", position: BoardPosition): Game => {
  const game = games[gameId];
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
    throw new PostionAlreadyTaken()
  }

  // Record the move
  game.board[position] = role;
  game.moves++;

  // Check for a winner
  const win = checkWinner(game.board);
  if (win) {
    game.winner = win;
  } else if (game.moves === 9) {
    game.winner = "Draw";
  } else {
    game.currentPlayer = game.currentPlayer === "X" ? "O" : "X";
  }

  return game;
};


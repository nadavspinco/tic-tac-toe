export interface Game {
    gameId: string;
    board: string[];
    currentPlayer: "X" | "O";
    winner: "X" | "O" | "Draw" | null;
    moves: number;
    players: {
      X: string;
      O?: string;
    };
  }


export interface GameTokenPayload {
    gameId: string;
    playerId: string;
    role: "X" | "O";
}

export type BoardPosition = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

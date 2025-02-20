// src/routes/gameRoutes.ts
import { Router, Request, Response, NextFunction } from "express";
import { joinSchema, moveSchema } from "../validation/schemas";
import { validateBody } from "../middleware/validate";
import {
  initiateGame,
  joinGame,
  getGameState,
  makeMove,
} from "../service/game-service";
import { authenticateToken } from "../middleware/auth";
import { GameTokenPayload } from "../interface/game";

const router = Router();

router.post("/initiate", (req: Request, res: Response) => {
  try {
    const { gameId, token } = initiateGame();
    res.json({ gameId, token });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /game/join
router.post("/join", validateBody(joinSchema), (req: Request, res: Response) => {
  const { gameId } = req.body;
  const { token } = joinGame(gameId);
  res.json({ token });
});

// GET /game/state
router.get("/state",  authenticateToken,(req: Request, res: Response) => {
  const tokenPayload = req.body.tokenPayload as GameTokenPayload;
  const { gameId } = tokenPayload;
  const game = getGameState(gameId);
  res.json(game);
});

// POST /game/move
router.post(
  "/move",
  validateBody(moveSchema),
  authenticateToken,
  (req: Request, res: Response) => {
    const { position, tokenPayload } = req.body;
    const payload = tokenPayload as GameTokenPayload;
    const { gameId, role } = payload;
    const game = makeMove(gameId, role, position);
    res.json(game);
  }
);


export default router;

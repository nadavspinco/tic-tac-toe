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

router.post("/initiate", async (req: Request, res: Response) => {
    const { gameId, token } = await initiateGame();
    res.json({ gameId, token });
});

// POST /game/join
router.post("/join", validateBody(joinSchema), async (req: Request, res: Response) => {
  const { gameId } = req.body;
  const { token } = await joinGame(gameId);
  res.json({ token });
});

// GET /game/state
router.get("/state",  authenticateToken,async (req: Request, res: Response) => {
  const tokenPayload = req.body.tokenPayload as GameTokenPayload;
  const { gameId } = tokenPayload;
  const game = await getGameState(gameId);
  res.json(game);
});

// POST /game/move
router.post(
  "/move",
  validateBody(moveSchema),
  authenticateToken,
  async (req: Request, res: Response) => {
    const { position, tokenPayload } = req.body;
    const payload = tokenPayload as GameTokenPayload;
    const { gameId, role } = payload;
    const game = await makeMove(gameId, role, position);
    res.json(game);
  }
);


export default router;

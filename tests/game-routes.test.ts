import request from "supertest";
import app from "../src/app";
import { connect, clearDatabase, closeDatabase } from "./setup-mongo";

// Helper functions to simplify test scenarios
const createNewGame = async () => {
  const res = await request(app).post("/game/initiate").send();
  return { gameId: res.body.gameId, tokenX: res.body.token };
};

const joinGame = async (gameId: string) => {
  const res = await request(app).post("/game/join").send({ gameId });
  return res.body.token;
};

const makeMove = async (token: string, position: number) => {
  return await request(app)
    .post("/game/move")
    .set("Authorization", `Bearer ${token}`)
    .send({ position });
};

const getStatus = async (token: string) => {
  return await request(app)
    .get("/game/state")
    .set("Authorization", `Bearer ${token}`);
};

describe("Independent Game Routes", () => {
  let tokenX: string;
  let tokenO: string;
  let gameId: string;

  beforeAll(async () => {
    await connect();
  });

  beforeEach(async () => {
    // Optionally, you can clear the database between tests to ensure isolation.
    await clearDatabase();
    const game = await createNewGame();
    gameId = game.gameId;
    tokenX = game.tokenX;
    tokenO = await joinGame(gameId);
  });

  afterAll(async () => {
    await closeDatabase();
  });

  it("should create a new game and allow a second player to join", async () => {
    expect(gameId).toBeDefined();
    expect(tokenX).toBeDefined();
    expect(tokenO).toBeDefined();
  });

  it("should return an error for an invalid move position (out of range)", async () => {
    const res = await makeMove(tokenX, 9);
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Validation error: position:/);
  });

  it("should return an error when moving to an already taken position", async () => {
    const res1 = await makeMove(tokenX, 0);
    expect(res1.status).toBe(200);
    expect(res1.body.board[0]).toBe("X");

    const res2 = await makeMove(tokenO, 0);
    expect(res2.status).toBe(400);
    expect(res2.body).toHaveProperty("error", "Position already taken");
  });

  it("should correctly handle a game winning scenario", async () => {
    let res = await makeMove(tokenX, 0);
    expect(res.status).toBe(200);

    res = await makeMove(tokenO, 3);
    expect(res.status).toBe(200);

    res = await makeMove(tokenX, 1);
    expect(res.status).toBe(200);

    res = await makeMove(tokenO, 4);
    expect(res.status).toBe(200);

    res = await makeMove(tokenX, 2);
    expect(res.status).toBe(200);

    const statusRes = await getStatus(tokenX);
    expect(statusRes.status).toBe(200);
    expect(statusRes.body).toHaveProperty("winner", "X");
  });

  it("should not allow a move after the game is already ended", async () => {
    let res = await makeMove(tokenX, 0);
    expect(res.status).toBe(200);

    res = await makeMove(tokenO, 3);
    expect(res.status).toBe(200);

    res = await makeMove(tokenX, 1);
    expect(res.status).toBe(200);

    res = await makeMove(tokenO, 4);
    expect(res.status).toBe(200);

    res = await makeMove(tokenX, 2);
    expect(res.status).toBe(200);

    const postWinRes = await makeMove(tokenO, 5);
    expect(postWinRes.status).toBe(400);
    expect(postWinRes.body).toHaveProperty("error", "Game has already ended");
  });

  it("should return an error when it's not your turn", async () => {
    // At game creation, player X starts the game.
    // Attempt to make a move using player O's token while it's not their turn.
    const res = await makeMove(tokenO, 1);
    expect(res.status).toBe(400);
    // Adjust the expected error message to match what NotYourTurn error produces.
    expect(res.body).toHaveProperty("error", "Not your turn");
  });
});

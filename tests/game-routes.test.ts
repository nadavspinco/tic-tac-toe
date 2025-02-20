import request from 'supertest';
import app from '../src/app';

// Helper functions to simplify test scenarios
const createNewGame = async () => {
  const res = await request(app).post('/game/initiate').send();
  return { gameId: res.body.gameId, tokenX: res.body.token };
};

const joinGame = async (gameId: string) => {
  const res = await request(app).post('/game/join').send({ gameId });
  return res.body.token;
};

const makeMove = async (token: string, position: number) => {
  return await request(app)
    .post('/game/move')
    .set('Authorization', `Bearer ${token}`)
    .send({ position });
};

const getStatus = async (token: string) => {
  return await request(app)
    .get('/game/state')
    .set('Authorization', `Bearer ${token}`);
};

describe('Independent Game Routes', () => {
  let tokenX: string;
  let tokenO: string;
  let gameId: string;

  // Create a new game and join it before each scenario
  beforeEach(async () => {
    const game = await createNewGame();
    gameId = game.gameId;
    tokenX = game.tokenX;
    tokenO = await joinGame(gameId);
  });

  it('should create a new game and allow a second player to join', async () => {
    // This test verifies that both tokens and gameId are defined.
    expect(gameId).toBeDefined();
    expect(tokenX).toBeDefined();
    expect(tokenO).toBeDefined();
  });


  it('should return an error for an invalid move position (out of range)', async () => {
    // Player X tries to move at position 9 (invalid, as allowed positions are 0-8)
    const res = await makeMove(tokenX, 9);
    expect(res.status).toBe(400);
  });

  it('should return an error when moving to an already taken position', async () => {
    // Player X makes a valid move at position 0
    const res1 = await makeMove(tokenX, 0);
    expect(res1.status).toBe(200);
    expect(res1.body.board[0]).toBe("X");

    // Now it's player O's turn; O attempts to move at the same position 0
    const res2 = await makeMove(tokenO, 0);
    expect(res2.status).toBe(400);
    expect(res2.body).toHaveProperty('error', 'Position Already taken');
  });

  it('should correctly handle a game winning scenario', async () => {
    // Simulate moves for a win with winning combination [0, 1, 2] for player X:
    // Sequence: X:0, O:3, X:1, O:4, X:2 should win the game for X.
    const move1 = await makeMove(tokenX, 0);
    expect(move1.status).toBe(200);
    
    const move2 = await makeMove(tokenO, 3);
    expect(move2.status).toBe(200);
    
    const move3 = await makeMove(tokenX, 1);
    expect(move3.status).toBe(200);
    
    const move4 = await makeMove(tokenO, 4);
    expect(move4.status).toBe(200);
    
    const move5 = await makeMove(tokenX, 2);
    expect(move5.status).toBe(200);
    
    // Retrieve status to verify that the winner is set to "X"
    const statusRes = await getStatus(tokenX);
    expect(statusRes.status).toBe(200);
    expect(statusRes.body).toHaveProperty('winner', 'X');
  });

  it('should not allow a move after the game is already ended', async () => {
    // Simulate a win scenario for player X.
    let res = await makeMove(tokenX, 0); // X
    expect(res.status).toBe(200);
    
    res = await makeMove(tokenO, 3); // O
    expect(res.status).toBe(200);
    
    res = await makeMove(tokenX, 1); // X
    expect(res.status).toBe(200);
    
    res = await makeMove(tokenO, 4); // O
    expect(res.status).toBe(200);
    
    res = await makeMove(tokenX, 2); // X wins
    expect(res.status).toBe(200);
    
    // Now that the game is won, any further move should be rejected.
    const postWinRes = await makeMove(tokenO, 5);
    expect(postWinRes.status).toBe(400);
    expect(postWinRes.body).toHaveProperty('error', 'Game has already ended');
  });
});

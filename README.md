# Tic Tac Toe API

A simple Tic Tac Toe game API built with Node.js, Express, TypeScript, and MongoDB (using Mongoose). This API allows two players to play Tic Tac Toe by making HTTP requests (using Postman or any HTTP client). The game state is persisted in MongoDB, and JWT authentication is used to identify players.

## Entities and Flow

### Entities

- **Game:**  
  The main entity is a Tic Tac Toe game which includes:
  - **gameId:** A unique identifier for each game.
  - **board:** An array of 9 strings representing the 3x3 grid.
  - **currentPlayer:** Indicates whose turn it is (`"X"` or `"O"`).
  - **winner:** The winner of the game (`"X"`, `"O"`, `"Draw"`, or `null` if the game is ongoing).
  - **moves:** A counter for the number of moves played.
  - **players:** An object mapping roles `"X"` and `"O"` to their unique player IDs.

- **JWT Payload:**  
  Each player receives a JWT when they join or initiate a game. The payload contains:
  - `gameId`
  - `playerId`
  - `role` (either `"X"` or `"O"`)

### Basic Flow

1. **Game Initiation:**  
   Player X initiates a new game by calling `POST /game/initiate`. A new game document is created in MongoDB, and the initiating player receives a JWT token.

2. **Joining a Game:**  
   A second player (Player O) joins an existing game via `POST /game/join` (providing the `gameId`), and receives a JWT token for role `"O"`.

3. **Making Moves:**  
   Players make moves by calling `POST /game/move` with the move's position. The server checks:
   - That the move is in range (positions 0–8)
   - That the chosen cell is empty
   - That it is the correct player's turn  
> **Note:** This API leverages Mongoose's `optimisticConcurrency` option to prevent concurrent updates to the board. With optimistic concurrency enabled, each game document maintains a version key (`__v`) that is incremented with every successful update. If two moves are attempted almost simultaneously, the version mismatch will cause one of the updates to be rejected, ensuring that only one update is applied successfully. This mechanism protects the integrity of the game state and prevents conflicting moves.

4. **Win Condition Check:**  
   After each move, a helper function checks for a win by examining predefined winning combinations (rows, columns, diagonals). If a winning combination is detected, the game document is updated with the winner. If all moves are exhausted without a winner, the game is marked as a draw.

5. **Retrieving Game State:**  
   Clients can fetch the current game state using `GET /game/state` by including their JWT token. This allows the server to identify which game to return.

## Win Condition Check

The win condition is determined by iterating through an array of winning combinations:

```typescript
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
```

## Installation and Setup

1.**Clone the repository**


2.**Install dependencies:**
   ```bash
   npm install
   ```
 
3.**Run Tests (using mongodb memory server):**
   ```bash
   npm test
   ```

4.**Create .env file**
   ```bash
	APP_JWT_KEY=your_secret_key_here
	PORT=3000
	MONGO_URI=mongodb://localhost:27017/tic-tac-toe
   ```

5.**Run the project**
   ```bash
   npm start
   ```
# API Endpoints

Below are the available endpoints for the Tic Tac Toe API, including the HTTP method, URL, request headers, and expected request/response payloads.

## 1. Initiate Game (Player X)
- **Method:** `POST`  
- **URL:** `/game/initiate`  
- **Body:** _(empty)_  
- **Response Example:_
  ```json
  {
    "gameId": "unique_game_id",
    "token": "jwt_token_for_player_X"
  }
  ```

## 2. Join Game (Player O) 
- **Method:** `POST`
- **URL:** `/game/join`
- **Request Body (JSON):**
  ```json
  {
    "gameId": "unique_game_id"
  } 
  ```
- **Response Body (JSON):**
  ```json
  {
    "token": "jwt_token_for_player_O"
  }
  ```
## 3. Make Moves
- **Method:** `POST`
- **URL:** `/game/move`
- **Headers:**
  - `authorization: Bearer <jwt_token>`
- **Request Body (JSON):**
  ```json
  {
    "position": 0
  }
  ```
- **Request Body (JSON):**
	```json
	{
	  "gameId": "unique_game_id",
	  "board": ["X", "", "", "", "", "", "", "", ""],
	  "currentPlayer": "O",
	  "winner": null,
	  "moves": 1,
	  "players": {
		"X": "player_id_for_X",
		"O": "player_id_for_O"
	  }
	}
	```
## 4. Check Game Status
- **Method:** `GET`
- **URL:** `/game/state`
- **Headers:**
  - `authorization: Bearer <jwt_token>`
- **Request Body (JSON): _(empty)_ 
- **Request Body (JSON):**
	```json
	{
	  "gameId": "unique_game_id",
	  "board": ["X", "", "", "", "", "", "", "", ""],
	  "currentPlayer": "O",
	  "winner": null,
	  "moves": 1,
	  "players": {
		"X": "player_id_for_X",
		"O": "player_id_for_O"
	  }
	}
	```
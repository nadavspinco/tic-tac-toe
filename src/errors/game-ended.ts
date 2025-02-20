import { GameError } from "./game-error";

export class GameEnded extends GameError {
    message ='Game has already ended'
    status = 400
}
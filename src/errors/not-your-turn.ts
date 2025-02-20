import { GameError } from "./game-error";

export class NotYourTurn extends GameError {
    message ='Not your turn'
    status = 400
}
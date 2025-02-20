import { GameError } from "./game-error";

export class GameWasntFound extends GameError {
    message ='Game wasnt found'
    status = 404
}
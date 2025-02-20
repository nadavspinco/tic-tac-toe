import { GameError } from "./game-error";

export class PostionAlreadyTaken extends GameError {
    message ='Position already taken'
    status = 400
}
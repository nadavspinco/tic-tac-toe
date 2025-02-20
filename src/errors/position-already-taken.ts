import { GameError } from "./game-error";

export class PostionAlreadyTaken extends GameError {
    message ='Position Already taken'
    status = 400
}
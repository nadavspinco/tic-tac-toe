export abstract class GameError extends Error {
    abstract message: string
    abstract status: number
} 
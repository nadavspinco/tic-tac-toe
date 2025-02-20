import {Request,Response, NextFunction } from "express";
import { GameError } from "../errors/game-error";

export function globalErrorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    if(err instanceof GameError){
        res.status(err.status).json({
            error: err.message
        });
    }
    else {
        console.error(err.stack);  // Log error details for debugging
        const status = err.status || 500;
        res.status(status).json({
            error:"Internal Server Error" // don't show internal error messages to the user in terms of security
        });
    } 
  }
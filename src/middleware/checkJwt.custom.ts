import jwt from "jsonwebtoken";
import { config as dotenv } from "dotenv";
import { Request, Response, NextFunction } from "express";

import InvalidInputException from "../exceptions/701_invalidInput.exception";
import InvalidTokenException from "../exceptions/703_invalidToken.exception";

dotenv();

async function checkJwt(req: Request, res: Response, next: NextFunction) {

  const token = req.header("x-auth-token");

  if (!token) {
    const exception = new InvalidInputException();
    return res.send(exception.getResponse)
  }

  try {
    const jwtSecretKey: jwt.Secret = process.env.JWT_SECRET_KEY || "S0M3WH3R3";
    const payload                  = jwt.verify(token, jwtSecretKey);
    // res.locals.jwtPayload          = payload;
    // console.log(payload);
    req.app.locals.credential      = payload;
    
    next();
  } catch (error) {
    const exception = new InvalidTokenException();

    res.send(exception.getResponse);
  }

}

export default checkJwt;
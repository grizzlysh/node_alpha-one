import jwt from "jsonwebtoken";
import { config as dotenv } from "dotenv";
import { Request, Response, NextFunction } from "express";
import AuthWrongTokenException from "../exceptions/authTokenWrong.exception";
import AuthTokenInvalidException from "../exceptions/authTokenInvalid.exception";

dotenv();

async function checkJwt(req: Request, res: Response, next: NextFunction) {

  const token = req.header("x-auth-token");

  if (!token) {
    const { status, message } = new AuthWrongTokenException();
    return res.status(status).send(message);
  }

  try {
    const jwtSecretKey: jwt.Secret = process.env.JWT_SECRET_KEY || "S0M3WH3R3";
    const payload                  = jwt.verify(token, jwtSecretKey);
    // res.locals.jwtPayload          = payload;
    console.log(payload);
    req.app.locals.credential      = payload;
    
    next();
  } catch (error) {
    const { status, message } = new AuthTokenInvalidException();

    res.status(status).send(message);
  }

}

export default checkJwt;
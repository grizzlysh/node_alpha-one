import jwt from "jsonwebtoken";
import { config as dotenv } from "dotenv";
import { Request, Response, NextFunction } from "express";

import InvalidInputException from "../exceptions/701_invalidInput.exception";
import InvalidTokenException from "../exceptions/703_invalidToken.exception";

dotenv();

async function checkJwt(req: Request, res: Response, next: NextFunction) {
  
  const authString  = req.headers.authorization
  const tokenString = authString?.split(" ")
  
  // if (!authString) {
  //   const exception = new InvalidInputException();
  //   return res.send(exception.getResponse)
  // }

  if (tokenString?.length != 2){
    const exception = new InvalidInputException();
    return res.send(exception.getResponse)
  }
  
  const accessToken = tokenString[1]

  try {
    const jwtSecretKey: jwt.Secret = process.env.JWT_SECRET_KEY || "S0M3WH3R3";
    const payload                  = jwt.verify(accessToken, jwtSecretKey);
    console.log(req);
    console.log("wiiuuu)");
    console.log(payload);
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
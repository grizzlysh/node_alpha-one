import jwt from "jsonwebtoken";
import { config as dotenv } from "dotenv";
import { Request, Response, NextFunction } from "express";
import { PrismaClient, Prisma } from "@prisma/client";

import InvalidInputException from "../exceptions/701_invalidInput.exception";
import InvalidTokenException from "../exceptions/703_invalidToken.exception";
import UserNotFoundException from "../exceptions/705_userNotFound.exception";
import InvalidPermissionException from "../exceptions/702_invalidPermission.exception";


const prisma = new PrismaClient({
  log: ['query'],
});

dotenv();

async function checkJwt(req: Request, res: Response, next: NextFunction) {
  
  const authHeader  = req.headers.authorization
  const userHeader  = req.header("user");
  const tokenString = authHeader?.split(" ")
  
  if (tokenString?.length != 2) {
    const exception = new InvalidInputException();
    return res.status(400).send(exception.getResponse)
  }

  const accessToken = tokenString[1];

  try {
    const jwtSecretKey: jwt.Secret = process.env.JWT_SECRET_KEY || "S0M3WH3R3";
    const payload                  = jwt.verify(accessToken, jwtSecretKey);
    // res.locals.jwtPayload          = payload;
    // console.log(payload);
    req.app.locals.credential      = payload;
    next();
  } catch (error) {
    const exception = new InvalidTokenException();
    res.status(401).send(exception.getResponse);
  }

}

export default checkJwt;
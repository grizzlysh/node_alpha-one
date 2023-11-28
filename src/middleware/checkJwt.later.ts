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
  // const test = {
  //   user_id: '28afa9f0-a884-4596-b5ba-04041314298d',
  //   role_id: '99afa9f0-a884-4596-b5ba-04041314298c',
  //   menu   : 'menu-user'
  // }

  // console.log(test);
  // console.log(JSON.stringify(test));
  
  // if (!authString) {
  //   const exception = new InvalidInputException();
  //   return res.send(exception.getResponse)
  // }

  if ( (tokenString?.length != 2) || (!userHeader) ) {
    const exception = new InvalidInputException();
    return res.status(400).send(exception.getResponse)
  }

  const accessToken = tokenString[1];
  const accessReq   = JSON.parse(userHeader);

  const checkUser = await prisma.users.findFirst({
    where: {
      AND: [
        {uid: accessReq.user_id,},
        {deleted_at: null,},
      ],
    },
    include: {
      role: {
        select: {
          id: true,
          uid: true,
          name: true,
        }
      }
    }
  });
  
  console.log(accessReq);
  console.log("user;");
  console.log(checkUser);

  if (!checkUser) {
    const exception = new UserNotFoundException();
    return res.send(exception.getResponse);
  }
  
  let  permit                             = {};
  if   (req.method == "POST") permit      = { write_permit: true };
  else if (req.method == "GET") permit    = { read_permit: true };
  else if (req.method == "PUT") permit    = { modify_permit: true };
  else if (req.method == "DELETE") permit = { delete_permit: true };

  console.log(permit);
  const checkPermission = await prisma.permission_role.findFirst({
    where: {
      AND: {
        permissions: {
          name: accessReq.menu_id
        },
        role_id      : checkUser.role_id,
        ...permit
      }
    }
  });   

  console.log("permission;");
  console.log(checkPermission);

  if (!checkPermission) {
    const exception = new InvalidPermissionException();
    return res.send(exception.getResponse);
  }

  try {
    const jwtSecretKey: jwt.Secret = process.env.JWT_SECRET_KEY || "S0M3WH3R3";
    const payload                  = jwt.verify(accessToken, jwtSecretKey);
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
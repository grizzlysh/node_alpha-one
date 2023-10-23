import Joi from 'joi';
import jwt, { JwtPayload, VerifyCallback, VerifyErrors } from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { Request, Response } from "express";
import { PrismaClient } from '@prisma/client';
import { config as dotenv } from 'dotenv';

import UserOnline from '../entity/userOnline.entity';
import InputInvalidException from '../exceptions/700_InputInvalid.exception';
import AuthCredentialWrongException from '../exceptions/authCredentialWrong.exception';
import BasicErrorException from '../exceptions/basicError.exception';
import AuthTokenWrongException from '../exceptions/authTokenWrong.exception';


dotenv();
const prisma = new PrismaClient();

type responseLogin = {
  user        : UserOnline,
  refreshToken: string
  accessToken : string,
}

export async function signInHandler(req: Request, res: Response): Promise<Response> {

  try {
    
    const schema = Joi.object({
      username: Joi.string().min(3).max(30).required().messages({
        // 'string.base' : `"username" should be a type of 'text'`,
        'string.empty': `"username" cannot be an empty field`,
        'string.min'  : `"username" should have a minimum length of {#limit}`,
        'any.required': `"username" is a required field`
      }),
      password: Joi.string().min(6).max(200).required().messages({
        // 'string.base' : `"username" should be a type of 'text'`,
        'string.empty': `"password" cannot be an empty field`,
        'string.min'  : `"password" should have a minimum length of {#limit}`,
        'any.required': `"password" is a required field`
      }),
    });

    const { error } = schema.validate(req.body);
  
    if (error) {
      const { status, message } = new InputInvalidException(error.message);
      return res.status(status).send(message);
    }
    
    const { username, password } = req.body;
  
    const checkUser = await prisma.users.findUnique({
      where: {
        username: username,
      },
    })

    if (!checkUser) {
      const { status, message } = new AuthCredentialWrongException();
      return res.status(status).send(message);
    }
  
    const validPassword = await bcryptjs.compare(password, checkUser.password);
    
    if (!validPassword){
      const { status, message } = new AuthCredentialWrongException();
      return res.status(status).send(message);
    }
  
    let userOnline: UserOnline = {
      uid     : checkUser.uid,
      username: checkUser.username,
      name    : checkUser.name,
      sex     : checkUser.sex,
      email   : checkUser.email,
    }
    
    const jwtSecretKey: jwt.Secret  = process.env.JWT_SECRET_KEY || 'S0M3WH3R3';
    const jwtRefreshKey: jwt.Secret = process.env.JWT_REFRESH_KEY || 'S0M3WH3R3';
    const accessToken               = jwt.sign(userOnline, jwtSecretKey, { expiresIn: '5m' });
    const refreshToken              = jwt.sign(userOnline, jwtRefreshKey, { expiresIn: '7m' });
  
    res.cookie('refresh_token', refreshToken, { 
      // httpOnly: true,
      // sameSite: 'None',
      // secure  : true,
      maxAge  : 24 * 60 * 60 * 1000,
      // maxAge: 10000,
      // useCredentials: true
    });

    let responseData: responseLogin = {
      user        : userOnline,
      accessToken : accessToken,
      refreshToken: refreshToken
    }
  
    return res.send(responseData);

  } catch (error) {
    
    const { status, message } = new BasicErrorException();
    return res.status(status).send(message);

  }
}

export async function refreshTokenHandler(req: Request, res: Response) {

  try {
    
    if (req.body.refreshToken) {

      const refreshToken = req.body.refreshToken;

      const jwtSecretKey: jwt.Secret  = process.env.TODO_APP_JWT_SECRET_KEY || 'S0M3WH3R3';
      const jwtRefreshKey: jwt.Secret = process.env.TODO_APP_JWT_REFRESH_KEY || 'S0M3WH3R3';

      jwt.verify(refreshToken, jwtRefreshKey, (err: VerifyErrors | null, payload: any) => {
        if (err) {
          return res.status(402).send({ message: err.message });
        }
        else {
          let userOnline: UserOnline = {
            uid     : payload.uid,
            username: payload.username,
            name    : payload.name,
            sex     : payload.sex,
            email   : payload.email,
          }
  
          const accessToken = jwt.sign(userOnline, jwtSecretKey, { expiresIn: '1m' });
          return res.send(accessToken);
        }
      })
    }
    else{
      const { status, message } = new AuthTokenWrongException();
      return res.status(status).send(message);
    }


  } catch (error) {
    
    const { status, message } = new BasicErrorException();
    return res.status(status).send(message);

  }

}

export async function signUpHandler(req: Request, res: Response) {
  
  try {
    const schema = Joi.object({
      username: Joi.string().min(3).max(30).required(),
      name    : Joi.string().min(3).max(30).required(),
      sex     : Joi.string().min(1).max(1).required(),
      email   : Joi.string().min(3).max(200).required().email(),
      password: Joi.string().min(6).max(200).required(),
    });

    const { error } = schema.validate(req.body);

    if (error) {
      const { status, message } = new AuthCredentialWrongException();
      return res.status(status).send(error.message);
    }

    const { username, name, sex, email, password } = req.body;

    const checkUser = await prisma.users.findUnique({
      where: {
        username: username,
      },
    })

    if (checkUser) {
      const { status, message } = new AuthCredentialWrongException();
      return res.status(status).send("User already exists...");
    }

    const salt            = await bcryptjs.genSalt(10);
    const encryptPassword = await bcryptjs.hash(password, salt);
    
    try {
      let user = await prisma.users.create({
        data: {
          // uid       : 'asdasdasdad',
          username  : username,
          name      : name,
          sex       : sex,
          email     : email,
          password  : encryptPassword,
          created_at: new Date('2022-01-21 10:00:00'),
          updated_at: new Date('2022-01-21 10:00:00'),
          // updated_at: '2022-01-21 10:00:00',
          created_by: 1,
          updated_by: 1,
          role_user : {
            create : {
              roles: {
                connect: {
                  id: 1
                }
              }
            }
          }
        },
      });
      

      res.send(user);

    } catch (e: any) {
      
      if (e.code === 'P2002') {
        console.log(
          'There is a unique constraint violation, a new user cannot be created with this email'
        )
      }
      // throw e;
      console.log(e.code);
      let { status, message } = new BasicErrorException();
      return res.status(status).send(e.message);
    }

  } catch (error) {
    let { status, message } = new BasicErrorException();
    return res.status(status).send(message);
  }

}
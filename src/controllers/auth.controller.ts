import Joi, { ref } from 'joi';
import jwt, { JwtPayload, VerifyCallback, VerifyErrors } from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { Request, Response, response } from "express";
import { PrismaClient, Prisma } from '@prisma/client';
import { config as dotenv } from 'dotenv';
import moment from 'moment';

import UserOnline from '../entity/userOnline.entity';
import SuccessException from '../exceptions/200_success.exception';
import InvalidInputException from '../exceptions/701_invalidInput.exception';
import UserNotFoundException from '../exceptions/705_userNotFound.exception';
import InvalidTokenException from '../exceptions/703_invalidToken.exception';
import BasicErrorException from '../exceptions/700_basicError.exception';
import UserAlreadyExistException from '../exceptions/704_userAlreadyExist.exception';
import ResponseLogin from '../interfaces/auth/responseLogin.interface';
import ResponseRegister from '../interfaces/auth/responseRegister.interface';
import RequestLogin from '../interfaces/auth/requestLogin.interface';
import RequestRegister from '../interfaces/auth/requestRegister.interface';

dotenv();
const prisma = new PrismaClient({
  log: ['query'],
});

export async function loginHandler(req: RequestLogin, res: Response): Promise<Response> {
  try {
    
    const schema = Joi.object({
      username: Joi.string().min(6).max(30).required().messages({
        // 'string.base': `"a" should be a type of 'text'`,
        'string.empty': `Username cannot be an empty field`,
        // 'string.min': `Username should have a minimum length of 6`,
        'any.required': `Username is a required field`
      }),
      password: Joi.string().min(6).max(200).required().messages({
        // 'string.base': `"a" should be a type of 'text'`,
        'string.empty': `Password cannot be an empty field`,
        // 'string.min': `Password should have a minimum length of 6`,
        'any.required': `Password is a required field`
      }),
    });

    const { error } = schema.validate(req.body);
  
    if (error) {
      const exception = new InvalidInputException(error.message);
      return res.send(exception.getResponse)
    }
    
    const { username, password } = req.body;
    
    const checkUser = await prisma.users.findUnique({
      where: {
        username: username,
      },
    })
    if (!checkUser) {
      const exception = new UserNotFoundException();
      return res.send(exception.getResponse)
    }
  
    const validPassword = await bcryptjs.compare(password, checkUser.password);
    
    if (!validPassword){
      const exception = new InvalidInputException("Wrong Password");
      return res.send(exception.getResponse)
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
    const accessToken               = jwt.sign(userOnline, jwtSecretKey, { expiresIn: '90m' });
    const refreshToken              = jwt.sign(userOnline, jwtRefreshKey, { expiresIn: '100m' });
  
    res.cookie('refresh_token', refreshToken, { 
      // httpOnly: true,
      // sameSite: 'None',
      // secure  : true,
      maxAge  : 24 * 60 * 60 * 1000,
      // maxAge: 10000,
      // useCredentials: true
    });

    const loginData: ResponseLogin = {
      user        : userOnline,
      accessToken : accessToken,
      refreshToken: refreshToken
    }
    const responseData = new SuccessException("Login Success", loginData)
    return res.send(responseData.getResponse);

  } catch (e: any) {
    const exception = new BasicErrorException(e.message);
    return res.send(exception.getResponse)
  }
}

export async function refreshTokenHandler(req: Request, res: Response): Promise<Response> {

  try {
    
    if (req.body.refreshToken) {

      const refreshToken = req.body.refreshToken;

      const jwtSecretKey: jwt.Secret  = process.env.TODO_APP_JWT_SECRET_KEY || 'S0M3WH3R3';
      const jwtRefreshKey: jwt.Secret = process.env.TODO_APP_JWT_REFRESH_KEY || 'S0M3WH3R3';

      jwt.verify(refreshToken, jwtRefreshKey, (err: VerifyErrors | null, payload: any) => {
        if (err) {
          const exception = new InvalidTokenException(err.message)
          return res.status(402).send(exception.getResponse)
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
          
          const refreshData: ResponseLogin = {
            user        : userOnline,
            accessToken : accessToken,
            refreshToken: ""
          }
          
          const responseData = new SuccessException("Refresh Success", refreshData)
          return res.send(responseData.getResponse);
        }
      })
      const exception = new BasicErrorException();
      return res.send(exception.getResponse)
    }
    else{
      const exception = new InvalidTokenException();
      return res.send(exception.getResponse)
    }
  } catch (e: any) {
    const exception = new BasicErrorException(e.message);
    return res.send(exception.getResponse)
  }

}

export async function registerHandler(req: RequestRegister, res: Response): Promise<Response> {
  
  try {
    const schema = Joi.object({
      username: Joi.string().min(6).max(30).required().messages({
        // 'string.base': `"a" should be a type of 'text'`,
        'string.empty': `Username cannot be an empty field`,
        'string.min': `Username should have a minimum length of 6`,
        'any.required': `Username is a required field`
      }),
      name    : Joi.string().min(3).max(30).required().messages({
        // 'string.base': `"a" should be a type of 'text'`,
        'string.empty': `Name cannot be an empty field`,
        'string.min': `Name should have a minimum length of 6`,
        'any.required': `Name is a required field`
      }),
      sex     : Joi.string().min(1).max(1).required().messages({
        // 'string.base': `"a" should be a type of 'text'`,
        'string.empty': `Sex cannot be an empty field`,
        // 'string.min': `Sex should have a minimum length of 6`,
        'any.required': `Sex is a required field`
      }),
      email   : Joi.string().min(3).max(200).required().email().messages({
        // 'string.base': `"a" should be a type of 'text'`,
        'string.empty': `Email cannot be an empty field`,
        // 'string.min': `Email should have a minimum length of 6`,
        'string.email': `Email is not valid format`,
        'any.required': `Email is a required field`
      }),
      password: Joi.string().min(6).max(200).required().messages({
        // 'string.base': `"a" should be a type of 'text'`,
        'string.empty': `Password cannot be an empty field`,
        'string.min': `Password should have a minimum length of 6`,
        'any.required': `Password is a required field`
      }),
    });

    const { error } = schema.validate(req.body);

    if (error) {
      const exception = new InvalidInputException(error.message);
      return res.send(exception.getResponse)
    }

    const { username, name, sex, email, password } = req.body;

    const checkUser = await prisma.users.findUnique({
      where: {
        username: username,
      },
    })

    if (checkUser) {
      const exception = new UserAlreadyExistException();
      return res.send(exception.getResponse)
    }

    const salt            = await bcryptjs.genSalt(10);
    const encryptPassword = await bcryptjs.hash(password, salt);
    
    try {
      let user = await prisma.users.create({
        data: {
          username  : username,
          name      : name,
          sex       : sex,
          email     : email,
          password  : encryptPassword,
          created_at: moment().format().toString(),
          updated_at: moment().format().toString(),
          createdby: {
            connect: {
              id: 1
            }
          },
          updatedby: {
            connect: {
              id: 1
            }
          },
          role      : {
            connect :{
              id: 1
            }
          }
        },
      });
      
      let userOnline: UserOnline = {
        uid     : user.uid,
        username: user.username,
        name    : user.name,
        sex     : user.sex,
        email   : user.email,
      }

      const registerData: ResponseRegister = {
        user: userOnline,
      }

      const responseData = new SuccessException("Register Success", registerData)
      return res.send(responseData.getResponse);

    } catch (err: any) {
      let message: string = "";
      if (err instanceof Prisma.PrismaClientKnownRequestError){
        if (err.code === 'P2002') {
          console.log("There is a unique constraint violation, a new user cannot be created with this email")
          message = "There is a unique constraint violation, a new user cannot be created with this email"
        }
        else{
          // throw e;
          console.log(err.code);
          message = err.message;
        }
      }
      // let errorMessage = message == null ? e.message : message;
      let exception= new BasicErrorException(message);
      return res.send(exception.getResponse)
    }

  } catch (e: any) {
    let exception= new BasicErrorException(e.message);
    return res.send(exception.getResponse)
  }

}
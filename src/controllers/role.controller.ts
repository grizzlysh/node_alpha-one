import Joi from 'joi';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { Request, Response } from "express";
import { PrismaClient } from '@prisma/client';

import AuthCredentialWrongException from '../exceptions/authCredentialWrong.exception';
import User from '../entity/user.entity';
import BasicErrorException from '../exceptions/basicError.exception';
import { getPagination } from '../utils/pagination.util';


const prisma = new PrismaClient();

export async function createUser(req: Request, res: Response) {
  
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
      res.status(status).send(e.message);
    }

  } catch (error) {
    let { status, message } = new BasicErrorException();
    res.status(status).send(message);
  }

}

export async function getUser(req: Request, res: Response) {
  try {
    
    const { page, size, title } = req.query;
    const condition             = title ? title : null;
    const { limit, offset }     = getPagination(page, size);

    const userList = await prisma.users.findMany({
      skip: offset,
      take: limit,
      // where: {
      //   email: {
      //     contains: 'Prisma',
      //   },
      // },
      orderBy: {
        username: 'desc',
      },
    });

    res.json(userList);

  } catch (error) {
    let { status, message } = new BasicErrorException();
    res.status(status).send(message);
  }
}

export async function getUserById(req: Request, res: Response) {
  try {
    
    // let user: Partial<User> | any = 'ok';
    // await User.findOne({ email: req.body.email });

    const { uid } = req.query;

    const user = await prisma.users.findUnique({
      where: {
        // uid: uid,
        username: uid?.toString()
      },
    })

    res.json(user);

  } catch (error) {
    let { status, message } = new BasicErrorException();
    res.status(status).send(message);
  }
}

export async function editUser(req: Request, res: Response) {
  try {
    
    // let user: Partial<User> | any = 'ok';
    // await User.findOne({ email: req.body.email });

    const { uid } = req.query;

    const user = await prisma.users.update({
      where: {
        uid: uid?.toString()
      },
      data: req.body,
    });

    res.json(user);

  } catch (error) {
    let { status, message } = new BasicErrorException();
    res.status(status).send(message);
  }
}

export async function deleteUser(req: Request, res: Response) {
  try {
    
    // let user: Partial<User> | any = 'ok';
    // await User.findOne({ email: req.body.email });

    const { uid } = req.query;

    const user = await prisma.users.delete({
      where: {
        uid: uid?.toString()
      },
    })

    res.json(user);

  } catch (error) {
    let { status, message } = new BasicErrorException();
    res.status(status).send(message);
  }
}
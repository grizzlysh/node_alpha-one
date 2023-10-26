import moment from 'moment';
import jwt from 'jsonwebtoken';
import Joi, { not } from 'joi';
import bcryptjs from 'bcryptjs';
import { Request, Response } from "express";
import { PrismaClient, Prisma } from '@prisma/client';

import { getPagination } from '../utils/pagination.util';
import SuccessException from '../exceptions/200_success.exception';
import BasicErrorException from '../exceptions/700_basicError.exception';
import InvalidInputException from '../exceptions/701_invalidInput.exception';
import UserNotFoundException from '../exceptions/705_userNotFound.exception';
import RoleNotFoundException from '../exceptions/707_roleNotFound.exception';
import UserAlreadyExistException from '../exceptions/704_userAlreadyExist.exception';

import RequestGetUser from '../interfaces/user/requestGetUser.interface';
import RequestEditUser from '../interfaces/user/requestEditUser.interface';   
import ResponseGetUser from '../interfaces/user/responseGetUser.interface';
import RequestCreateUser from '../interfaces/user/requestCreateUser.interface';
import RequestDeleteUser from '../interfaces/user/requestDeleteUser.interface';
import RequestGetUserByID from '../interfaces/user/requestGetUserByID.interface';
import ResponseGetUserByID from '../interfaces/user/responseGetUserByID.interface';

const prisma = new PrismaClient({
  log: ['query'],
});

export async function createUser(req: RequestCreateUser, res: Response): Promise<Response> {
  
  try {
    const schema = Joi.object({
      username: Joi.string().min(6).max(30).required().messages({
        // 'string.base': `"a" should be a type of 'text'`,
        'string.empty': `Username cannot be an empty field`,
        'string.min': `Username should have a minimum length of 6`,
        'any.required': `Username is a required field`
      }),
      name    : Joi.string().min(1).max(30).required().messages({
        // 'string.base': `"a" should be a type of 'text'`,
        'string.empty': `Name cannot be an empty field`,
        'string.min': `Name should have a minimum length of 1`,
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
      role_uid: Joi.string().required().messages({
        // 'string.base': `"a" should be a type of 'text'`,
        'string.empty': `Role cannot be an empty field`,
        // 'string.min': `Password should have a minimum length of 6`,
        'any.required': `Role is a required field`
      }),
      current_user_uid: Joi.string().min(36).max(36),
    });

    const { error } = schema.validate(req.body);

    if (error) {
      const exception = new InvalidInputException(error.message);
      return res.send(exception.getResponse);
    }

    const inputData        = req.body;
    const username         = inputData.username.trim();
    const name             = inputData.name.trim();
    const sex              = inputData.sex.trim();
    const email            = inputData.email.trim();
    const password         = inputData.password.trim();
    const current_user_uid = inputData.current_user_uid.trim();
    const role_uid         = inputData.role_uid.trim();

    const checkUser = await prisma.users.findFirst({
      where: {
        AND: [
          {username: username,},
          {deleted_at: null,},
        ]
      },
    })

    if (checkUser) {
      const exception = new UserAlreadyExistException("Username Already Exist");
      return res.send(exception.getResponse);
    }

    const checkEmail = await prisma.users.findFirst({
      where: {
        AND: [
          {email: email,},
          {deleted_at: null,},
        ]
      },
    })

    if (checkEmail) {
      const exception = new UserAlreadyExistException("Email Already Exist");
      return res.send(exception.getResponse);
    }
    
    const roleUser =  await prisma.roles.findFirst({
      where: {
        AND: [
          {uid: role_uid,},
          {deleted_at: null,},
        ]
      },
    })

    if (!roleUser) {
      const exception = new RoleNotFoundException();
      return res.send(exception.getResponse)
    }
    
    const currentUser = await prisma.users.findFirst({
      where: {
        AND: [
          {uid: current_user_uid,},
          {deleted_at: null,},
        ]
      },
    })

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
          createdby : {
            connect: {
              id: currentUser?.id
            }
          },
          updatedby : {
            connect: {
              id: currentUser?.id
            }
          },
          role: {
            connect : {
              id: roleUser.id
            }
          }
        },
      });
      
      const responseData = new SuccessException("User created successfully")

      return res.send(responseData)

    } catch (err: any) {
      let message: string = "";
      if (err instanceof Prisma.PrismaClientKnownRequestError){
        if (err.code === 'P2002') {
          console.log("There is a unique constraint violation, a new user cannot be created with this email")
          message = "There is a unique constraint violation, a new user cannot be created with this email"
        }
        else{
          // throw e;
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

export async function getUser(req: RequestGetUser, res: Response): Promise<Response> {
  try {
    const { page, size, cond } = req.query;
    const condition            = cond ? cond : undefined;
    const { limit, offset }    = getPagination(page, size);

    const userList = await prisma.users.findMany({
      skip: offset,
      take: limit,
      where: {
        AND:[
          {deleted_at: null,},
          {
            OR: [
              {email: {contains: condition}},
              {username: {contains: condition}},
              {name: {contains: condition}},
            ]
          }
          // {...( condition ? {OR: [
          //   {email     : {contains: condition},},
          //   {username  : {contains: condition},},
          //   {name      : {contains: condition},},
          // ]} : {} )}
        ]
      },
      orderBy: {
        name: 'asc',
      },
      select: {
        uid              : true,
        username         : true,
        name             : true,
        sex              : true,
        email            : true,
        email_verified_at: true,
        role: {
          select: {
            uid : true,
            name: true,
          }
        },
        created_at       : true,
        updated_at       : true,
        deleted_at       : true,
        createdby        : {
          select: {
            name: true
          }
        },
        updatedby: {
          select: {
            name: true
          }
        },
        deletedby: {
          select: {
            name: true
          }
        },
      }
    });
    
    const getUserData: ResponseGetUser = {
      data: userList
    }
    
    const responseData = new SuccessException("User Data received", getUserData)

    return res.send(responseData)

  } catch (e: any) {
    let exception= new BasicErrorException(e.message);
    return res.send(exception.getResponse)
  }
}

export async function getUserById(req: RequestGetUserByID, res: Response): Promise<Response> {
  try {
    
    // let user: Partial<User> | any = 'ok';
    // await User.findOne({ email: req.body.email });
    const { user_uid } = req.params;

    const user = await prisma.users.findFirst({
      where: {
        AND: [
          {uid: user_uid,},
          {deleted_at: null,},
        ]
      },
      select: {
        uid              : true,
        username         : true,
        name             : true,
        sex              : true,
        email            : true,
        email_verified_at: true,
        role: {
          select: {
            name: true,
          }
        },
        created_at       : true,
        updated_at       : true,
        deleted_at       : true,
        createdby        : {
          select: {
            name: true
          }
        },
        updatedby: {
          select: {
            name: true
          }
        },
        deletedby: {
          select: {
            name: true
          }
        },
      }
    })

    if (!user) {
      const exception = new UserNotFoundException();
      return res.send(exception.getResponse);
    }

    const getUserData: ResponseGetUserByID = {
      data: user
    }
    
    const responseData = new SuccessException("User Data received", getUserData)

    return res.send(responseData)

  } catch (e: any) {
    let exception= new BasicErrorException(e.message);
    return res.send(exception.getResponse)
  }
}

export async function editUser(req: RequestEditUser, res: Response): Promise<Response> {
  try {
    const { user_uid } = req.params;
    const inputData    = req.body;

    const schema = Joi.object({
      username: Joi.string().min(6).max(30).messages({
        'string.empty': `Username cannot be an empty field`,
        'string.min': `Username should have a minimum length of 6`,
        'any.required': `Username is a required field`
      }),
      name    : Joi.string().min(1).max(30).required().messages({
        'string.empty': `Name cannot be an empty field`,
        'string.min': `Name should have a minimum length of 1`,
        'any.required': `Name is a required field`
      }),
      sex     : Joi.string().min(1).max(1).required().messages({
        'string.empty': `Sex cannot be an empty field`,
        'any.required': `Sex is a required field`
      }),
      email   : Joi.string().min(3).max(200).required().email().messages({
        'string.empty': `Email cannot be an empty field`,
        'string.email': `Email is not valid format`,
        'any.required': `Email is a required field`
      }),
      password: Joi.string().min(6).max(200).required().messages({
        'string.empty': `Password cannot be an empty field`,
        'string.min': `Password should have a minimum length of 6`,
        'any.required': `Password is a required field`
      }),
      role_uid: Joi.string().required().messages({
        'string.empty': `Role cannot be an empty field`,
        'any.required': `Role is a required field`
      }),
      current_user_uid: Joi.string().min(36).max(36),
    });

    const { error } = schema.validate(req.body);

    if (error) {
      const exception = new InvalidInputException(error.message);
      return res.send(exception.getResponse);
    }

    const editUser     = {
      username        : inputData.username.trim(),
      name            : inputData.name.trim(),
      sex             : inputData.sex.trim(),
      email           : inputData.email.trim(),
      password        : inputData.password.trim(),
      current_user_uid: inputData.current_user_uid.trim(),
      role_uid        : inputData.role_uid.trim(),
    }
    let isEmailUpdated = false;
    
    const checkUser = await prisma.users.findFirst({
      where: {
        AND: [
          {uid: user_uid,},
          {deleted_at: null,},
        ]
      },
      select: {
        id               : true,
        uid              : true,
        username         : true,
        name             : true,
        sex              : true,
        email            : true,
        password         : true,
        email_verified_at: true,
        role : {
          select : {
            uid : true
          }
        }
      }
    })

    if(checkUser?.username != editUser.username) {
      const checkUsername = await prisma.users.findFirst({
        where: {
          AND: [
            {username: editUser.username,},
            {deleted_at: null,},
          ]
        },
      })

      if (checkUsername) {
        const exception = new UserAlreadyExistException("Username Already Exist");
        return res.send(exception.getResponse);
      }
    }

    if(checkUser?.email != editUser.email) {
      const checkEmail = await prisma.users.findFirst({
        where: {
          AND: [
            {email: editUser.email,},
            {deleted_at: null,},
          ]
        },
      })

      if (checkEmail) {
        const exception = new UserAlreadyExistException("Email Already Exist");
        return res.send(exception.getResponse);
      }

      isEmailUpdated = true;
    }
    
    const roleUser =  await prisma.roles.findFirst({
      where: {
        AND: [
          {uid: editUser.role_uid,},
          {deleted_at: null,},
        ]
      },
    })

    if (!roleUser) {
      const exception = new RoleNotFoundException();
      return res.send(exception.getResponse)
    }
    
    const currentUser = await prisma.users.findFirst({
      where: {
        AND: [
          {uid: editUser.current_user_uid,},
          {deleted_at: null,},
        ]
      },
    })

    const salt            = await bcryptjs.genSalt(10);
    const encryptPassword = await bcryptjs.hash(editUser.password, salt);

    try {
      const updateUser = await prisma.users.update({
        where: {
          uid: user_uid
        },
        data: {
          username         : editUser.username,
          name             : editUser.name,
          sex              : editUser.sex,
          email            : editUser.email,
          password         : encryptPassword,
          email_verified_at: isEmailUpdated ? null : checkUser?.email_verified_at,
          updated_at       : moment().format().toString(),
          updatedby        : {
            connect : {
              id: currentUser?.id
            }
          },
          ...( (checkUser?.role.uid != editUser.role_uid) ? {
            role: {
              connect: {
                id: roleUser.id
              }
            }
          } : {} )
        },
        select: {
          uid              : true,
          username         : true,
          name             : true,
          sex              : true,
          email            : true,
          email_verified_at: true,
          role: {
            select: {
              name: true,
            }
          },
          created_at       : true,
          updated_at       : true,
          deleted_at       : true,
          createdby        : {
            select: {
              name: true
            }
          },
          updatedby: {
            select: {
              name: true
            }
          },
          deletedby: {
            select: {
              name: true
            }
          },
        }
      });

      const responseData = new SuccessException("User edited successfully", updateUser)

      return res.send(responseData)

    } catch (err: any) {
      let message: string = "";
      if (err instanceof Prisma.PrismaClientKnownRequestError){
        if (err.code === 'P2002') {
          console.log("There is a unique constraint violation, a new user cannot be created with this email")
          message = "There is a unique constraint violation, a new user cannot be created with this email"
        }
        else{
          // throw e;
          message = err.message;
        }
      }
      // let errorMessage = message == null ? e.message : message;
      let exception= new BasicErrorException(message);
      return res.send(exception.getResponse)
    }

    // const roleUpdate = await prisma.role_user.update({
    //   where: {
    //     user_id_role_id: {
    //       user_id : checkUser?.id || 1,
    //       role_id: checkUser?.role_user[0].roles.id || 1
    //     }
    //   },
    //   data: {
    //     role_id: roleUser.id
    //   }
    // })

  } catch (e: any) {
    let exception= new BasicErrorException(e.message);
    return res.send(exception.getResponse)
  }
}

export async function deleteUser(req: RequestDeleteUser, res: Response): Promise<Response> {
  try {
    
    const { user_uid }     = req.params;
    const inputData        = req.body;
    const current_user_uid = inputData.current_user_uid.trim()

    // const user = await prisma.users.delete({
    //   where: {
    //     uid: uid?.toString()
    //   },
    // })

    const checkUser = await prisma.users.findFirst({
      where: {
        AND: [
          {uid: user_uid,},
          {deleted_at: null,},
        ]
      },
    })

    if (!checkUser) {
      const exception = new UserNotFoundException();
      return res.send(exception.getResponse);
    }

    const currentUser = await prisma.users.findFirst({
      where: {
        AND: [
          {uid: current_user_uid,},
          {deleted_at: null,},
        ]
      },
    })

    try {
      const user = await prisma.users.update({
        where: {
          uid: user_uid
        },
        data: {
          updated_at: moment().format().toString(),
          deleted_at: moment().format().toString(),
          updatedby: {
            connect: {
              id: currentUser?.id
            }
          },
          deletedby: {
            connect: {
              id: currentUser?.id
            }
          }
        }
      });
      
      const responseData = new SuccessException("User deleted successfully")

      return res.send(responseData)

    } catch (err: any) {
      let exception= new BasicErrorException(err.message);
      return res.send(exception.getResponse)
    }
    // const verifyUser = await prisma.roles.findFirst({
    //   where: {
    //     id : currentUser?.role_id
    //   },
    //   select: {
    //     users :{
    //       select: {
    //         username: true,
    //       },
    //       where: {
    //         deleted_at: null
    //       }
    //     }
    //   }
    // });

  } catch (e: any) {
    let exception= new BasicErrorException(e.message);
    return res.send(exception.getResponse)
  }
}
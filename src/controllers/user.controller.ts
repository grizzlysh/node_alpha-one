import Joi from 'joi';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { Request, Response } from "express";
import { PrismaClient, Prisma } from '@prisma/client';
import moment from 'moment';

import { getPagination } from '../utils/pagination.util';
import InvalidInputException from '../exceptions/701_invalidInput.exception';
import UserAlreadyExistException from '../exceptions/704_userAlreadyExist.exception';
import BasicErrorException from '../exceptions/700_basicError.exception';
import RequestCreateUser from '../interfaces/user/requestCreateUser.interface';
import SuccessException from '../exceptions/200_success.exception';
import RequestGetUser from '../interfaces/user/requestGetUser.interface';
import ResponseGetUser from '../interfaces/user/responseGetUser.interface';
import UserNotFoundException from '../exceptions/705_userNotFound.exception';
import RoleNotFoundException from '../exceptions/706_roleNotFound.exception';
import RequestGetUserByID from '../interfaces/user/requestGetUserByID.interface';
import ResponseGetUserByID from '../interfaces/user/responseGetUserByID.interface';
import RequestEditUser from '../interfaces/user/requestEditUser.interface';

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

    const { username, name, sex, email, password, current_user_uid, role_uid } = req.body;

    const checkUser = await prisma.users.findUnique({
      where: {
        username: username,
      },
    })

    if (checkUser) {
      const exception = new UserAlreadyExistException("Username Already Exist");
      return res.send(exception.getResponse);
    }

    const checkEmail = await prisma.users.findUnique({
      where: {
        email: email,
      },
    })

    if (checkEmail) {
      const exception = new UserAlreadyExistException("Email Already Exist");
      return res.send(exception.getResponse);
    }
    
    const roleUser =  await prisma.roles.findUnique({
      where: {
        uid: role_uid,
      },
    })

    if (!roleUser) {
      const exception = new RoleNotFoundException();
      return res.send(exception.getResponse)
    }
    
    const currentUser = await prisma.users.findUnique({
      where: {
        uid: current_user_uid,
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
        ...( condition ? {OR: [
          {email     : {contains: condition},},
          {username  : {contains: condition},},
          {name      : {contains: condition},},
        ]} : {} )
      },
      orderBy: {
        username: 'asc',
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
    const { username } = req.params;

    const user = await prisma.users.findUnique({
      where: {
        // uid: uid,
        username: username
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
    
    // let user: Partial<User> | any = 'ok';
    // await User.findOne({ email: req.body.email });

    const { username }  = req.params;
    const editUser      = req.body;
    let   email_updated = false;

    const schema = Joi.object({
      username: Joi.string().min(6).max(30).messages({
        'string.empty': `Username cannot be an empty field`,
        'string.min': `Username should have a minimum length of 6`,
        'any.required': `Username is a required field`
      }),
      name    : Joi.string().min(3).max(30).required().messages({
        'string.empty': `Name cannot be an empty field`,
        'string.min': `Name should have a minimum length of 6`,
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
    
    const checkUser = await prisma.users.findUnique({
      where: {
        username: username,
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
          OR : {
            username: editUser.username
          },
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
          OR : {
            email: editUser.email
          },
        },
      })

      if (checkEmail) {
        const exception = new UserAlreadyExistException("Email Already Exist");
        return res.send(exception.getResponse);
      }

      email_updated = true;
    }
    
    const roleUser =  await prisma.roles.findUnique({
      where: {
        uid: editUser.role_uid,
      },
    })

    if (!roleUser) {
      const exception = new RoleNotFoundException();
      return res.send(exception.getResponse)
    }
    
    const currentUser = await prisma.users.findUnique({
      where: {
        uid: editUser.current_user_uid,
      },
    })

    const salt            = await bcryptjs.genSalt(10);
    const encryptPassword = await bcryptjs.hash(editUser.password, salt);

    const updateUser = await prisma.users.update({
      where: {
        id: checkUser?.id
      },
      data: {
        username         : editUser.username,
        name             : editUser.name,
        sex              : editUser.sex,
        email            : editUser.email,
        password         : encryptPassword,
        email_verified_at: email_updated ? null : checkUser?.email_verified_at,
        updated_at       : moment().format().toString(),
        updatedby        : {
          update: {
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
    });

    if(checkUser?.role.uid != editUser.role_uid) {
      const updateRole = await prisma.roles.update({
        where: {
          uid : checkUser?.role.uid
        },
        data: {
          users :{
            disconnect:{
              id: checkUser?.id,
            },
          },
        }
      })
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

    const responseData = new SuccessException("User edited successfully")

    return res.send(responseData)

  } catch (e: any) {
    let exception= new BasicErrorException(e.message);
    return res.send(exception.getResponse)
  }
}

export async function deleteUser(req: Request, res: Response) {
  try {
    
    // let user: Partial<User> | any = 'ok';
    // await User.findOne({ email: req.body.email });

    console.log(req);
    console.log(req.param);
    console.log(req.body);
    const { username } = req.params;
    const { current_user_uid } = req.body;

    // const user = await prisma.users.delete({
    //   where: {
    //     uid: uid?.toString()
    //   },
    // })
    const currentUser = await prisma.users.findUnique({
      where: {
        uid: current_user_uid,
      },
    })

    const user = await prisma.users.update({
      where: {
        username: username
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

    res.json(user);

  } catch (e: any) {
    let exception= new BasicErrorException(e.message);
    return res.send(exception.getResponse)
  }
}
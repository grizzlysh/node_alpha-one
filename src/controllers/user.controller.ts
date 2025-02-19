import moment from 'moment-timezone';
import jwt from 'jsonwebtoken';
import Joi, { not } from 'joi';
import bcryptjs from 'bcryptjs';
import { Request, Response } from "express";
import { PrismaClient, Prisma } from '@prisma/client';

import Menu from '../constants/menus.constant';
import { getPagination, getPagingData } from '../utils/pagination.util';

import SuccessException from '../exceptions/200_success.exception';
import BasicErrorException from '../exceptions/700_basicError.exception';
import InvalidInputException from '../exceptions/701_invalidInput.exception';
import UserNotFoundException from '../exceptions/705_userNotFound.exception';
import RoleNotFoundException from '../exceptions/707_roleNotFound.exception';
import UserAlreadyExistException from '../exceptions/704_userAlreadyExist.exception';
import InvalidPermissionException from '../exceptions/702_invalidPermission.exception';

import RequestGetUser from '../interfaces/user/requestGetUser.interface';
import RequestEditUser from '../interfaces/user/requestEditUser.interface';   
import ResponseGetUser from '../interfaces/user/responseGetUser.interface';
import RequestCreateUser from '../interfaces/user/requestCreateUser.interface';
import RequestDeleteUser from '../interfaces/user/requestDeleteUser.interface';
import RequestGetUserByID from '../interfaces/user/requestGetUserByID.interface';
import ResponseGetUserByID from '../interfaces/user/responseGetUserByID.interface';
import RequestResetPassword from '../interfaces/user/requestResetPassword.interface';

const prisma = new PrismaClient({
  log: ['query'],
});

export async function createUser(req: RequestCreateUser, res: Response): Promise<Response> {
  
  try {
    const schema = Joi.object({
      username: Joi.string().min(6).max(30).required().messages({
        // 'string.base': `"a" should be a type of 'text'`,
        'string.empty': `Username cannot be an empty field`,
        'string.min'  : `Username should have a minimum length of 6`,
        'any.required': `Username is a required field`
      }),
      name    : Joi.string().min(1).max(30).required().messages({
        // 'string.base': `"a" should be a type of 'text'`,
        'string.empty': `Name cannot be an empty field`,
        'string.min'  : `Name should have a minimum length of 1`,
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
      return res.status(400).send(exception.getResponse);
    }

    const inputData = {
      username        : req.body.username.trim().toLowerCase(),
      name            : req.body.name.trim().toLowerCase(),
      sex             : req.body.sex,
      email           : req.body.email.trim(),
      password        : req.body.password.trim(),
      role_uid        : req.body.role_uid,
      current_user_uid: req.body.current_user_uid,
    }

    const currentUser = await prisma.users.findFirst({
      where: {
        AND: [
          {uid: inputData.current_user_uid,},
          {deleted_at: null,},
        ],
        role: {
          permission_role: {
            some: {
              write_permit: true,
              permissions : {
                name: Menu.USER,
              }
            }
          }
        },
      },
      include: {
        role: {
          select:{
            name: true,
            permission_role: {
              select: {
                modify_permit: true,
                read_permit  : true,
                write_permit : true,
                permissions : {
                  select: {
                    uid: true,
                    name: true,
                    // name: "permission",
                  }
                },
              }
            }
          }
        }
      },
    })

    if (!currentUser) {
      const exception = new InvalidPermissionException();
      return res.status(400).send(exception.getResponse);
    }

    const checkUser = await prisma.users.findFirst({
      where: {
        AND: [
          {username: inputData.username,},
          {deleted_at: null}
        ]
      },
    })
    
    if (checkUser) {
      const exception = new UserAlreadyExistException("Username already exist");
      return res.status(400).send(exception.getResponse);
    }

    const checkEmail = await prisma.users.findFirst({
      where: {
        AND: [
          {email: inputData.email,},
          {deleted_at: null,},
        ]
      },
    })

    if (checkEmail) {
      const exception = new UserAlreadyExistException("Email already exist");
      return res.status(400).send(exception.getResponse);
    }
    
    const roleUser =  await prisma.roles.findFirst({
      where: {
        AND: [
          {uid: inputData.role_uid,},
          {deleted_at: null,},
        ]
      },
    })

    if (!roleUser) {
      const exception = new RoleNotFoundException();
      return res.status(400).send(exception.getResponse)
    }
    
    const salt            = await bcryptjs.genSalt(10);
    const encryptPassword = await bcryptjs.hash(inputData.password, salt);
    
    try {
      let user = await prisma.users.create({
        data: {
          username  : inputData.username,
          name      : inputData.name,
          sex       : inputData.sex,
          email     : inputData.email,
          password  : encryptPassword,
          created_at: moment().tz('Asia/Jakarta').format(),
          updated_at: moment().tz('Asia/Jakarta').format(),
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

      return res.send(responseData.getResponse)

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
      return res.status(400).send(exception.getResponse)
    }

  } catch (e: any) {
    let exception= new BasicErrorException(e.message);
    return res.status(400).send(exception.getResponse)
  }

}

export async function getUser(req: RequestGetUser, res: Response): Promise<Response> {
  try {
    const { page, size, cond, sort, field } = req.query;
    const condition                         = cond ? cond : undefined;
    const sortBy                            = sort ? sort : 'asc';
    const fieldBy                           = field ? field : 'id';
    const { limit, offset }                 = getPagination(page, size);

    const query: Prisma.usersFindManyArgs = {
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
        [fieldBy]: sortBy,
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
            uid         : true,
            name        : true,
            display_name: true,
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
    }

    const [userList, userCount] = await prisma.$transaction([
      prisma.users.findMany(query),
      prisma.users.count({ where: query.where}),
    ])
    
    const userData                     = getPagingData(userList, userCount, page, limit);
    const getUserData: ResponseGetUser = {
      data        : userData.data,
      total_data  : userData.totalData,
      current_page: userData.currentPage,
      total_pages : userData.totalPages
    }
    
    const responseData = new SuccessException("User data received", getUserData)

    return res.send(responseData.getResponse)

  } catch (e: any) {
    let exception= new BasicErrorException(e.message);
    return res.status(400).send(exception.getResponse)
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
            uid         : true,
            name        : true,
            display_name: true,
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
      return res.status(400).send(exception.getResponse);
    }

    const getUserData: ResponseGetUserByID = {
      data: user
    }
    
    const responseData = new SuccessException("User data received", getUserData)

    return res.send(responseData.getResponse)

  } catch (e: any) {
    let exception= new BasicErrorException(e.message);
    return res.status(400).send(exception.getResponse)
  }
}

export async function editUser(req: RequestEditUser, res: Response): Promise<Response> {
  try {
    const { user_uid } = req.params;

    const schema = Joi.object({
      username: Joi.string().min(6).max(30).messages({
        'string.empty': `Username cannot be an empty field`,
        'string.min'  : `Username should have a minimum length of 6`,
        'any.required': `Username is a required field`
      }),
      name    : Joi.string().min(1).max(30).required().messages({
        'string.empty': `Name cannot be an empty field`,
        'string.min'  : `Name should have a minimum length of 1`,
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
      password: Joi.string().allow('').optional(),
      // password: Joi.string().min(6).max(200).required().messages({
      //   'string.empty': `Password cannot be an empty field`,
      //   'string.min'  : `Password should have a minimum length of 6`,
      //   'any.required': `Password is a required field`
      // }),
      role_uid: Joi.string().required().messages({
        'string.empty': `Role cannot be an empty field`,
        'any.required': `Role is a required field`
      }),
      current_user_uid: Joi.string().min(36).max(36),
    });

    const { error } = schema.validate(req.body);

    if (error) {
      const exception = new InvalidInputException(error.message);
      return res.status(400).send(exception.getResponse);
    }

    const editData     = {
      username        : req.body.username.trim().toLowerCase(),
      name            : req.body.name.trim().toLowerCase(),
      sex             : req.body.sex,
      email           : req.body.email.trim(),
      password        : req.body.password.trim(),
      current_user_uid: req.body.current_user_uid,
      role_uid        : req.body.role_uid,
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

    if(checkUser?.username != editData.username) {
      const checkUsername = await prisma.users.findFirst({
        where: {
          AND: [
            {username: editData.username,},
            {deleted_at: null,},
          ]
        },
      })

      if (checkUsername) {
        const exception = new UserAlreadyExistException("Username already exist");
        return res.status(400).send(exception.getResponse);
      }
    }

    if(checkUser?.email != editData.email) {
      const checkEmail = await prisma.users.findFirst({
        where: {
          AND: [
            {email: editData.email,},
            {deleted_at: null,},
          ]
        },
      })

      if (checkEmail) {
        const exception = new UserAlreadyExistException("Email already exist");
        return res.status(400).send(exception.getResponse);
      }

      isEmailUpdated = true;
    }
    
    const roleUser =  await prisma.roles.findFirst({
      where: {
        AND: [
          {uid: editData.role_uid,},
          {deleted_at: null,},
        ]
      },
    })

    if (!roleUser) {
      const exception = new RoleNotFoundException();
      return res.status(400).send(exception.getResponse)
    }
    
    const currentUser = await prisma.users.findFirst({
      where: {
        AND: [
          {uid: editData.current_user_uid,},
          {deleted_at: null,},
        ]
      },
    })
    const salt            = await bcryptjs.genSalt(10);
    let   encryptPassword;

    if (editData.password != '') {
      encryptPassword = await bcryptjs.hash(editData.password, salt);
    }
    else {
      encryptPassword = checkUser?.password
    }

    try {
      const updateUser = await prisma.users.update({
        where: {
          uid: user_uid
        },
        data: {
          username         : editData.username,
          name             : editData.name,
          sex              : editData.sex,
          email            : editData.email,
          password         : encryptPassword,
          email_verified_at: isEmailUpdated ? null : checkUser?.email_verified_at,
          updated_at       : moment().tz('Asia/Jakarta').format(),
          updatedby        : {
            connect : {
              id: currentUser?.id
            }
          },
          ...( (checkUser?.role.uid != editData.role_uid) ? {
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
              uid         : true,
              name        : true,
              display_name: true,
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

      return res.send(responseData.getResponse)

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
      return res.status(400).send(exception.getResponse)
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
    return res.status(400).send(exception.getResponse)
  }
}

export async function resetPassword(req: RequestResetPassword, res: Response): Promise<Response> {
  try {
    const { user_uid } = req.params;

    const schema = Joi.object({
      password: Joi.string().min(6).max(200).required().messages({
        'string.empty': `Password cannot be an empty field`,
        'string.min'  : `Password should have a minimum length of 6`,
        'any.required': `Password is a required field`
      }),
      repassword: Joi.string().min(6).max(200).required().messages({
        'string.empty': `RePassword cannot be an empty field`,
        'string.min'  : `RePassword should have a minimum length of 6`,
        'any.required': `RePassword is a required field`
      }),
      current_user_uid: Joi.string().min(36).max(36),
    });

    const { error } = schema.validate(req.body);

    const resetData = {
      password        : req.body.password.trim(),
      repassword      : req.body.repassword.trim(),
      current_user_uid: req.body.current_user_uid,
    }

    if (error) {
      const exception = new InvalidInputException(error.message);
      return res.status(400).send(exception.getResponse);
    }

    if(resetData.password != resetData.repassword) {
      const exception = new InvalidInputException("Confirm password is not the same as password");
      return res.status(400).send(exception.getResponse);
    }
    
    const currentUser = await prisma.users.findFirst({
      where: {
        AND: [
          {uid: resetData.current_user_uid,},
          {deleted_at: null,},
        ]
      },
    })

    const salt            = await bcryptjs.genSalt(10);
    const encryptPassword = await bcryptjs.hash(resetData.password, salt);

    try {
      const updateUser = await prisma.users.update({
        where: {
          uid: user_uid
        },
        data: {
          password  : encryptPassword,
          updated_at: moment().tz('Asia/Jakarta').format(),
          updatedby : {
            connect : {
              id: currentUser?.id
            }
          },
        },
        select: {
          uid              : true,
          username         : true,
          name             : true,
          sex              : true,
          email            : true,
          email_verified_at: true,
          role             : {
            select: {
              uid         : true,
              name        : true,
              display_name: true,
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

      const responseData = new SuccessException("Password reset successfully", updateUser)

      return res.send(responseData.getResponse)

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
      console.log(err.message);
      let exception= new BasicErrorException(message);
      return res.status(400).send(exception.getResponse)
    }

  } catch (e: any) {
    console.log("oke",e.message);
    let exception= new BasicErrorException(e.message);
    return res.status(400).send(exception.getResponse)
  }
}


export async function deleteUser(req: RequestDeleteUser, res: Response): Promise<Response> {
  try {
    
    const { user_uid } = req.params;
    const deleteData   = req.body;

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
      return res.status(400).send(exception.getResponse);
    }

    const currentUser = await prisma.users.findFirst({
      where: {
        AND: [
          {uid: deleteData.current_user_uid,},
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
          updated_at: moment().tz('Asia/Jakarta').format(),
          deleted_at: moment().tz('Asia/Jakarta').format(),
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

      return res.send(responseData.getResponse)

    } catch (err: any) {
      let exception= new BasicErrorException(err.message);
      return res.status(400).send(exception.getResponse)
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
    return res.status(400).send(exception.getResponse)
  }
}
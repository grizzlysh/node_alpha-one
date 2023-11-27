import moment from 'moment';
import Joi, { not } from 'joi';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { Response } from "express";
import { PrismaClient, Prisma } from '@prisma/client';

import { getPagination } from '../utils/pagination.util';
import SuccessException from '../exceptions/200_success.exception';
import BasicErrorException from '../exceptions/700_basicError.exception';
import InvalidInputException from '../exceptions/701_invalidInput.exception';
import PermissionNotFoundException from '../exceptions/709_permissionNotFound.exception ';
import PermissionAlreadyExistException from '../exceptions/708_permissionAlreadyExist.exception';

import RequestGetPermission from '../interfaces/permission/requestGetPermission.interface';
import ResponseGetPermission from '../interfaces/permission/responseGetPermission.interface';
import RequestEditPermission from '../interfaces/permission/requestEditPermission.interface';
import RequestDeletePermission from '../interfaces/permission/requestDeletePermission.interface';
import RequestCreatePermission from '../interfaces/permission/requestCreatePermission.interface';
import RequestGetPermissionByID from '../interfaces/permission/requestGetPermissionByID.interface';
import ResponseGetPermissionByID from '../interfaces/permission/responseGetPermissionByID.interface';

const prisma = new PrismaClient({
  log: ['query'],
});

export async function createPermission(req: RequestCreatePermission, res: Response): Promise<Response> {
  
  try {
    const schema = Joi.object({
      display_name    : Joi.string().min(4).max(30).required().messages({
        // 'string.base': `"a" should be a type of 'text'`,
        'string.empty': `Display Name cannot be an empty field`,
        'string.min': `Display Name should have a minimum length of 4`,
        'any.required': `Display Name is a required field`
      }),
      description     : Joi.string().max(100).messages({
        // 'string.base': `"a" should be a type of 'text'`,
        'string.empty': `Sex cannot be an empty field`,
        // 'string.min': `Sex should have a minimum length of 6`,
        'any.required': `Sex is a required field`
      }),
      current_user_uid: Joi.string().min(36).max(36),
    });

    const { error } = schema.validate(req.body);

    if (error) {
      const exception = new InvalidInputException(error.message);
      return res.status(400).send(exception.getResponse);
    }

    const inputData        = req.body;
    const display_name     = inputData.display_name.trim();
    const description      = inputData.description.trim();
    const current_user_uid = inputData.current_user_uid.trim();
    let   nameFormat       = display_name.replace(/\s+/g, '-');

    const checkPermission = await prisma.permissions.findFirst({
      where: {
        AND: [
          {display_name: display_name,},
          {deleted_at: null,},
        ]
      },
    })

    if (checkPermission) {
      const exception = new PermissionAlreadyExistException("Permission Name Already Exist");
      return res.status(400).send(exception.getResponse);
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
      let permission = await prisma.permissions.create({
        data: {
          name        : nameFormat,
          display_name: display_name,
          description : description,
          created_at  : moment().format().toString(),
          updated_at  : moment().format().toString(),
          createdby   : {
            connect: {
              id: currentUser?.id
            }
          },
          updatedby : {
            connect: {
              id: currentUser?.id
            }
          },
        },
      });
      
      const responseData = new SuccessException("Permission created successfully")

      return res.send(responseData)

    } catch (err: any) {
      let exception= new BasicErrorException(err.message);
      return res.status(400).send(exception.getResponse)
    }

  } catch (e: any) {
    let exception= new BasicErrorException(e.message);
    return res.status(400).send(exception.getResponse)
  }

}

export async function getPermission(req: RequestGetPermission, res: Response): Promise<Response> {
  try {
    const { page, size, cond } = req.query;
    const condition            = cond ? cond : undefined;
    const { limit, offset }    = getPagination(page, size);

    const permissionList = await prisma.permissions.findMany({
      skip: offset,
      take: limit,
      where: {
        AND:[
          {deleted_at: null,},
          {name: {
            contains: condition
          }}
          // {...( condition ? { name: {contains: condition?.toString()} } : {} )}
        ]
      },
      orderBy: {
        name: 'asc',
      },
      select: {
        uid         : true,
        name        : true,
        display_name: true,
        description : true,
        created_at  : true,
        updated_at  : true,
        deleted_at  : true,
        createdby   : {
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
    
    const getPermissionData: ResponseGetPermission = {
      data: permissionList
    }
    
    const responseData = new SuccessException("Permission Data received", getPermissionData)

    return res.send(responseData)

  } catch (e: any) {
    let exception= new BasicErrorException(e.message);
    return res.status(400).send(exception.getResponse)
  }
}

export async function getPermissionById(req: RequestGetPermissionByID, res: Response): Promise<Response> {
  try {

    const { permission_uid }   = req.params;

    const permission = await prisma.permissions.findFirst({
      where: {
        AND: [
          {uid: permission_uid,},
          {deleted_at: null,},
        ]
      },
      select: {
        uid         : true,
        name        : true,
        display_name: true,
        description : true,
        created_at  : true,
        updated_at  : true,
        deleted_at  : true,
        createdby   : {
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
    console.log(permission);

    if (!permission) {
      const exception = new PermissionNotFoundException();
      return res.status(400).send(exception.getResponse);
    }

    const getPermissionData: ResponseGetPermissionByID = {
      data: permission
    }
    
    const responseData = new SuccessException("Permission Data received", getPermissionData)

    return res.send(responseData)

  } catch (e: any) {
    let exception= new BasicErrorException(e.message);
    return res.status(400).send(exception.getResponse)
  }
}

export async function editPermission(req: RequestEditPermission, res: Response): Promise<Response> {
  try {

    const { permission_uid } = req.params;
    const inputData          = req.body;

    const schema = Joi.object({
      display_name    : Joi.string().min(4).max(30).required().messages({
        // 'string.base': `"a" should be a type of 'text'`,
        'string.empty': `Display Name cannot be an empty field`,
        'string.min': `Display Name should have a minimum length of 4`,
        'any.required': `Display Name is a required field`
      }),
      description     : Joi.string().max(100).messages({
        // 'string.base': `"a" should be a type of 'text'`,
        'string.empty': `Description cannot be an empty field`,
        // 'string.min': `Description should have a minimum length of 6`,
        'any.required': `Description is a required field`
      }),
      current_user_uid: Joi.string().min(36).max(36),
    });

    const { error } = schema.validate(req.body);

    if (error) {
      const exception = new InvalidInputException(error.message);
      return res.status(400).send(exception.getResponse);
    }
    
    const editPermission     = {
      display_name    : inputData.display_name.trim(),
      description     : inputData.description.trim(),
      current_user_uid: inputData.current_user_uid.trim(),
    }
    let nameFormat = editPermission.display_name.replace(/\s+/g, '-');
    
    const checkPermission = await prisma.permissions.findFirst({
      where: {
        AND: [
          {uid: permission_uid},
          {deleted_at: null,},
        ]
      },
      select: {
        uid         : true,
        name        : true,
        display_name: true,
        description : true,
      }
    })

    if(checkPermission?.display_name != editPermission.display_name) {
      const checkDisplayName = await prisma.permissions.findFirst({
        where: {
          AND: [
            {display_name: editPermission.display_name,},
            {deleted_at: null,},
          ]
        },
      })

      if (checkDisplayName) {
        const exception = new PermissionAlreadyExistException("Display Name Already Exist");
        return res.status(400).send(exception.getResponse);
      }
    }

    const currentUser = await prisma.users.findFirst({
      where: {
        AND: [
          {uid: editPermission.current_user_uid,},
          {deleted_at: null,},
        ]
      },
    })

    try {
      const updatePermission = await prisma.permissions.update({
        where: {
          uid: permission_uid
        },
        data: {
          name             : nameFormat,
          display_name     : editPermission.display_name,
          description      : editPermission.description,
          updated_at       : moment().format().toString(),
          updatedby        : {
            connect : {
              id: currentUser?.id
            }
          },
        },
        select: {
          uid         : true,
          name        : true,
          display_name: true,
          description : true,
          created_at  : true,
          updated_at  : true,
          deleted_at  : true,
          createdby   : {
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

      const responseData = new SuccessException("Permission edited successfully", updatePermission)

      return res.send(responseData)

    } catch (err: any) {
      let exception= new BasicErrorException(err.message);
      return res.status(400).send(exception.getResponse)
    }

  } catch (e: any) {
    let exception= new BasicErrorException(e.message);
    return res.status(400).send(exception.getResponse)
  }
}

export async function deletePermission(req: RequestDeletePermission, res: Response): Promise<Response> {
  try {
    
    const { permission_uid } = req.params;
    const inputData          = req.body;
    const current_user_uid   = inputData.current_user_uid.trim()
    
    const checkPermission = await prisma.permissions.findFirst({
      where: {
        AND: [
          {uid: permission_uid},
          {deleted_at: null,},
        ]
      }
    })

    if (!checkPermission) {
      const exception = new PermissionNotFoundException();
      return res.status(400).send(exception.getResponse);
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
      const permission = await prisma.permissions.update({
        where: {
          uid: permission_uid
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
      
      const responseData = new SuccessException("Permission deleted successfully")

      return res.send(responseData)

    } catch (err: any) {
      let exception= new BasicErrorException(err.message);
      return res.status(400).send(exception.getResponse)
    }
  } catch (e: any) {
    let exception= new BasicErrorException(e.message);
    return res.status(400).send(exception.getResponse)
  }
}
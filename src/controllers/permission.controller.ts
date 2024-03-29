import moment from 'moment-timezone';
import Joi, { not } from 'joi';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { Response } from "express";
import { PrismaClient, Prisma } from '@prisma/client';

import { getPagination, getPagingData } from '../utils/pagination.util';
import SuccessException from '../exceptions/200_success.exception';
import BasicErrorException from '../exceptions/700_basicError.exception';
import InvalidInputException from '../exceptions/701_invalidInput.exception';
import PermissionNotFoundException from '../exceptions/709_permissionNotFound.exception';
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
      display_name: Joi.string().min(4).max(30).required().messages({
        // 'string.base': `"a" should be a type of 'text'`,
        'string.empty': `Display Name cannot be an empty field`,
        'string.min'  : `Display Name should have a minimum length of 4`,
        'any.required': `Display Name is a required field`
      }),
      description: Joi.string().max(191).allow('').optional(),
      current_user_uid: Joi.string().min(36).max(36).required().messages({
        'any.required': `Please try again`
      }),
    });

    const { error } = schema.validate(req.body);

    if (error) {
      const exception = new InvalidInputException(error.message);
      return res.status(400).send(exception.getResponse);
    }

    const inputData = {
      display_name    : req.body.display_name.trim().toLowerCase(),
      description     : req.body.description.trim(),
      current_user_uid: req.body.current_user_uid,
    } 
    
    let nameFormat       = inputData.display_name.replace(/\s+/g, '-');

    const checkPermission = await prisma.permissions.findFirst({
      where: {
        AND: [
          {display_name: inputData.display_name,},
          {deleted_at: null,},
        ]
      },
    })

    if (checkPermission) {
      const exception = new PermissionAlreadyExistException("Permission name already exist");
      return res.status(400).send(exception.getResponse);
    }

    const currentUser = await prisma.users.findFirst({
      where: {
        AND: [
          {uid: inputData.current_user_uid,},
          {deleted_at: null,},
        ]
      },
    })

    try {
      let permission = await prisma.permissions.create({
        data: {
          name        : nameFormat,
          display_name: inputData.display_name,
          description : inputData.description,
          created_at  : moment().tz('Asia/Jakarta').format().toString(),
          updated_at  : moment().tz('Asia/Jakarta').format().toString(),
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

      return res.send(responseData.getResponse)

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
    const { page, size, cond, sort, field } = req.query;
    const condition                         = cond ? cond : undefined;
    const sortBy                            = sort ? sort : 'asc';
    const fieldBy                           = field ? field : 'id';
    const { limit, offset }                 = getPagination(page, size);

    const query: Prisma.permissionsFindManyArgs = {
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
        [fieldBy]: sortBy,
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
    }

    const [permissionList, permissionCount] = await prisma.$transaction([
      prisma.permissions.findMany(query),
      prisma.permissions.count({ where: query.where}),
    ])
    
    const permissionData                           = getPagingData(permissionList, permissionCount, page, limit);
    const getPermissionData: ResponseGetPermission = {
      data        : permissionData.data,
      total_data  : permissionData.totalData,
      current_page: permissionData.currentPage,
      total_pages : permissionData.totalPages
    }
    
    const responseData = new SuccessException("Permission data received", getPermissionData)

    return res.send(responseData.getResponse)

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

    if (!permission) {
      const exception = new PermissionNotFoundException();
      return res.status(400).send(exception.getResponse);
    }

    const getPermissionData: ResponseGetPermissionByID = {
      data: permission
    }
    
    const responseData = new SuccessException("Permission data received", getPermissionData)

    return res.send(responseData.getResponse)

  } catch (e: any) {
    let exception= new BasicErrorException(e.message);
    return res.status(400).send(exception.getResponse)
  }
}

export async function editPermission(req: RequestEditPermission, res: Response): Promise<Response> {
  try {

    const { permission_uid } = req.params;

    const schema = Joi.object({
      display_name    : Joi.string().min(4).max(30).required().messages({
        // 'string.base': `"a" should be a type of 'text'`,
        'string.empty': `Display Name cannot be an empty field`,
        'string.min': `Display Name should have a minimum length of 4`,
        'any.required': `Display Name is a required field`
      }),
      description     : Joi.string().max(191).allow('').optional(),
      current_user_uid: Joi.string().min(36).max(36).required().messages({
        'any.required': `Please try again`
      }),
    });

    const { error } = schema.validate(req.body);

    if (error) {
      const exception = new InvalidInputException(error.message);
      return res.status(400).send(exception.getResponse);
    }
    
    const editData = {
      display_name    : req.body.display_name.trim().toLowerCase(),
      description     : req.body.description.trim(),
      current_user_uid: req.body.current_user_uid,
    }
    let nameFormat = editData.display_name.replace(/\s+/g, '-');
    
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

    if(checkPermission?.display_name != editData.display_name) {
      const checkDisplayName = await prisma.permissions.findFirst({
        where: {
          AND: [
            {display_name: editData.display_name,},
            {deleted_at: null,},
          ]
        },
      })

      if (checkDisplayName) {
        const exception = new PermissionAlreadyExistException("Permission name already exist");
        return res.status(400).send(exception.getResponse);
      }
    }

    const currentUser = await prisma.users.findFirst({
      where: {
        AND: [
          {uid: editData.current_user_uid,},
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
          display_name     : editData.display_name,
          description      : editData.description,
          updated_at       : moment().tz('Asia/Jakarta').format().toString(),
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

      return res.send(responseData.getResponse)

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
    const deleteData         = req.body;
    
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
          {uid: deleteData.current_user_uid,},
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
          updated_at: moment().tz('Asia/Jakarta').format().toString(),
          deleted_at: moment().tz('Asia/Jakarta').format().toString(),
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

      return res.send(responseData.getResponse)

    } catch (err: any) {
      let exception= new BasicErrorException(err.message);
      return res.status(400).send(exception.getResponse)
    }
  } catch (e: any) {
    let exception= new BasicErrorException(e.message);
    return res.status(400).send(exception.getResponse)
  }
}
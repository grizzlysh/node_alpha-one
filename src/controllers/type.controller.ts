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
import TypeNotFoundException from '../exceptions/713_typeNotFound.exception';
import TypeAlreadyExistException from '../exceptions/712_typeAlreadyExist.exception';

import RequestGetType from '../interfaces/type/requestGetType.interface';
import ResponseGetType from '../interfaces/type/responseGetType.interface';
import RequestEditType from '../interfaces/type/requestEditType.interface';
import RequestDeleteType from '../interfaces/type/requestDeleteType.interface';
import RequestCreateType from '../interfaces/type/requestCreateType.interface';
import RequestGetTypeByID from '../interfaces/type/requestGetTypeByID.interface';
import ResponseGetTypeByID from '../interfaces/type/responseGetTypeByID.interface';

const prisma = new PrismaClient({
  log: ['query'],
});

export async function createType(req: RequestCreateType, res: Response): Promise<Response> {
  
  try {
    const schema = Joi.object({
      name: Joi.string().min(1).max(60).required().messages({
        // 'string.base': `"a" should be a type of 'text'`,
        'string.empty': `Name cannot be an empty field`,
        'string.min'  : `Name should have a minimum length of 1`,
        'any.required': `Name is a required field`
      }),
      current_user_uid: Joi.string().min(36).max(36).required().messages({
        'any.required': `Please try again`
      }),
    });

    const { error } = schema.validate(req.body);

    if (error) {
      const exception = new InvalidInputException(error.message);
      return res.status(400).send(exception.getResponse);
    }

    const inputData        = req.body;
    const name             = inputData.name.trim().toLowerCase();
    const current_user_uid = inputData.current_user_uid.trim();

    const checkType = await prisma.types.findFirst({
      where: {
        AND: [
          {name: name,},
          {deleted_at: null,},
        ]
      },
    })

    if (checkType) {
      const exception = new TypeAlreadyExistException("Type Name Already Exist");
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
      let type = await prisma.types.create({
        data: {
          name        : name,
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
      
      const responseData = new SuccessException("Type created successfully")

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

export async function getType(req: RequestGetType, res: Response): Promise<Response> {
  try {
    const { page, size, cond, sort, field } = req.query;
    const condition                         = cond ? cond : undefined;
    const sortBy                            = sort ? sort : 'asc';
    const fieldBy                           = field ? field : 'id';
    const { limit, offset }                 = getPagination(page, size);

    const query: Prisma.typesFindManyArgs = {
      skip: offset,
      take: limit,
      where: {
        AND:[
          {deleted_at: null,},
          {name: {
            contains: condition
          }}
        ]
      },
      orderBy: {
        [fieldBy]: sortBy,
      },
      select: {
        uid         : true,
        name        : true,
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

    const [typeList, typeCount] = await prisma.$transaction([
      prisma.types.findMany(query),
      prisma.types.count({ where: query.where}),
    ])
    
    const typeData                     = getPagingData(typeList, typeCount, page, limit);
    const getTypeData: ResponseGetType = {
      data        : typeData.data,
      total_data  : typeData.totalData,
      current_page: typeData.currentPage,
      total_pages : typeData.totalPages
    }
    
    const responseData = new SuccessException("Type Data received", getTypeData)

    return res.send(responseData.getResponse)

  } catch (e: any) {
    let exception= new BasicErrorException(e.message);
    return res.status(400).send(exception.getResponse)
  }
}

export async function getTypeById(req: RequestGetTypeByID, res: Response): Promise<Response> {
  try {

    const { type_uid }   = req.params;

    const type = await prisma.types.findFirst({
      where: {
        AND: [
          {uid: type_uid,},
          {deleted_at: null,},
        ]
      },
      select: {
        uid         : true,
        name        : true,
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

    if (!type) {
      const exception = new TypeNotFoundException();
      return res.status(400).send(exception.getResponse);
    }

    const getTypeData: ResponseGetTypeByID = {
      data: type
    }
    
    const responseData = new SuccessException("Type Data received", getTypeData)

    return res.send(responseData.getResponse)

  } catch (e: any) {
    let exception= new BasicErrorException(e.message);
    return res.status(400).send(exception.getResponse)
  }
}

export async function editType(req: RequestEditType, res: Response): Promise<Response> {
  try {

    const { type_uid } = req.params;
    const inputData    = req.body;

    const schema = Joi.object({
      name: Joi.string().min(1).max(60).required().messages({
        // 'string.base': `"a" should be a type of 'text'`,
        'string.empty': `Name cannot be an empty field`,
        'string.min'  : `Name should have a minimum length of 1`,
        'any.required': `Name is a required field`
      }),
      current_user_uid: Joi.string().min(36).max(36).required().messages({
        'any.required': `Please try again`
      }),
    });

    const { error } = schema.validate(req.body);

    if (error) {
      const exception = new InvalidInputException(error.message);
      return res.status(400).send(exception.getResponse);
    }
    
    const editType     = {
      name            : inputData.name.trim().toLowerCase(),
      current_user_uid: inputData.current_user_uid.trim(),
    }
    
    const checkType = await prisma.types.findFirst({
      where: {
        AND: [
          {uid: type_uid},
          {deleted_at: null,},
        ]
      },
      select: {
        uid         : true,
        name        : true,
      }
    })

    if(checkType?.name != editType.name) {
      const checkName = await prisma.types.findFirst({
        where: {
          AND: [
            {name: editType.name,},
            {deleted_at: null,},
          ]
        },
      })

      if (checkName) {
        const exception = new TypeAlreadyExistException("Name Already Exist");
        return res.status(400).send(exception.getResponse);
      }
    }

    const currentUser = await prisma.users.findFirst({
      where: {
        AND: [
          {uid: editType.current_user_uid,},
          {deleted_at: null,},
        ]
      },
    })

    try {
      const updateType = await prisma.types.update({
        where: {
          uid: type_uid
        },
        data: {
          name             : editType.name,
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

      const responseData = new SuccessException("Type edited successfully", updateType)

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

export async function deleteType(req: RequestDeleteType, res: Response): Promise<Response> {
  try {
    
    const { type_uid }     = req.params;
    const inputData        = req.body;
    const current_user_uid = inputData.current_user_uid.trim()
    
    const checkType = await prisma.types.findFirst({
      where: {
        AND: [
          {uid: type_uid},
          {deleted_at: null,},
        ]
      }
    })

    if (!checkType) {
      const exception = new TypeNotFoundException();
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
      const type = await prisma.types.update({
        where: {
          uid: type_uid
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
      
      const responseData = new SuccessException("Type deleted successfully")

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
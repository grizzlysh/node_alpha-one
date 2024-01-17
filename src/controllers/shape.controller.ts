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
import ShapeNotFoundException from '../exceptions/711_shapeNotFound.exception';
import ShapeAlreadyExistException from '../exceptions/710_shapeAlreadyExist.exception';

import RequestGetShape from '../interfaces/shape/requestGetShape.interface';
import ResponseGetShape from '../interfaces/shape/responseGetShape.interface';
import RequestEditShape from '../interfaces/shape/requestEditShape.interface';
import RequestDeleteShape from '../interfaces/shape/requestDeleteShape.interface';
import RequestCreateShape from '../interfaces/shape/requestCreateShape.interface';
import RequestGetShapeByID from '../interfaces/shape/requestGetShapeByID.interface';
import ResponseGetShapeByID from '../interfaces/shape/responseGetShapeByID.interface';

const prisma = new PrismaClient({
  log: ['query'],
});

export async function createShape(req: RequestCreateShape, res: Response): Promise<Response> {
  
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

    const checkShape = await prisma.shapes.findFirst({
      where: {
        AND: [
          {name: name,},
          {deleted_at: null,},
        ]
      },
    })

    if (checkShape) {
      const exception = new ShapeAlreadyExistException("Shape Name Already Exist");
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
      let shape = await prisma.shapes.create({
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
      
      const responseData = new SuccessException("Shape created successfully")

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

export async function getShape(req: RequestGetShape, res: Response): Promise<Response> {
  try {
    const { page, size, cond, sort, field } = req.query;
    const condition                         = cond ? cond : undefined;
    const sortBy                            = sort ? sort : 'asc';
    const fieldBy                           = field ? field : 'id';
    const { limit, offset }                 = getPagination(page, size);

    const query: Prisma.shapesFindManyArgs = {
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

    const [shapeList, shapeCount] = await prisma.$transaction([
      prisma.shapes.findMany(query),
      prisma.shapes.count({ where: query.where}),
    ])
    
    const shapeData                      = getPagingData(shapeList, shapeCount, page, limit);
    const getShapeData: ResponseGetShape = {
      data        : shapeData.data,
      total_data  : shapeData.totalData,
      current_page: shapeData.currentPage,
      total_pages : shapeData.totalPages
    }
    
    const responseData = new SuccessException("Shape Data received", getShapeData)

    return res.send(responseData.getResponse)

  } catch (e: any) {
    let exception= new BasicErrorException(e.message);
    return res.status(400).send(exception.getResponse)
  }
}

export async function getShapeById(req: RequestGetShapeByID, res: Response): Promise<Response> {
  try {

    const { shape_uid }   = req.params;

    const shape = await prisma.shapes.findFirst({
      where: {
        AND: [
          {uid: shape_uid,},
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

    if (!shape) {
      const exception = new ShapeNotFoundException();
      return res.status(400).send(exception.getResponse);
    }

    const getShapeData: ResponseGetShapeByID = {
      data: shape
    }
    
    const responseData = new SuccessException("Shape Data received", getShapeData)

    return res.send(responseData.getResponse)

  } catch (e: any) {
    let exception= new BasicErrorException(e.message);
    return res.status(400).send(exception.getResponse)
  }
}

export async function editShape(req: RequestEditShape, res: Response): Promise<Response> {
  try {

    const { shape_uid } = req.params;
    const inputData     = req.body;

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
    
    const editShape     = {
      name            : inputData.name.trim().toLowerCase(),
      current_user_uid: inputData.current_user_uid.trim(),
    }
    
    const checkShape = await prisma.shapes.findFirst({
      where: {
        AND: [
          {uid: shape_uid},
          {deleted_at: null,},
        ]
      },
      select: {
        uid         : true,
        name        : true,
      }
    })

    if(checkShape?.name != editShape.name) {
      const checkName = await prisma.shapes.findFirst({
        where: {
          AND: [
            {name: editShape.name,},
            {deleted_at: null,},
          ]
        },
      })

      if (checkName) {
        const exception = new ShapeAlreadyExistException("Name Already Exist");
        return res.status(400).send(exception.getResponse);
      }
    }

    const currentUser = await prisma.users.findFirst({
      where: {
        AND: [
          {uid: editShape.current_user_uid,},
          {deleted_at: null,},
        ]
      },
    })

    try {
      const updateShape = await prisma.shapes.update({
        where: {
          uid: shape_uid
        },
        data: {
          name             : editShape.name,
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

      const responseData = new SuccessException("Shape edited successfully", updateShape)

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

export async function deleteShape(req: RequestDeleteShape, res: Response): Promise<Response> {
  try {
    
    const { shape_uid }    = req.params;
    const inputData        = req.body;
    const current_user_uid = inputData.current_user_uid.trim()
    
    const checkShape = await prisma.shapes.findFirst({
      where: {
        AND: [
          {uid: shape_uid},
          {deleted_at: null,},
        ]
      }
    })

    if (!checkShape) {
      const exception = new ShapeNotFoundException();
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
      const shape = await prisma.shapes.update({
        where: {
          uid: shape_uid
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
      
      const responseData = new SuccessException("Shape deleted successfully")

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
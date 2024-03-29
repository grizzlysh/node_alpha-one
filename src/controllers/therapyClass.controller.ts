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
import TherapyClassNotFoundException from '../exceptions/715_therapyClassNotFound.exception';
import TherapyClassAlreadyExistException from '../exceptions/714_therapyClassAlreadyExist.exception';

import RequestGetTherapyClass from '../interfaces/therapyClass/requestGetTherapyClass.interface';
import ResponseGetTherapyClass from '../interfaces/therapyClass/responseGetTherapyClass.interface';
import RequestEditTherapyClass from '../interfaces/therapyClass/requestEditTherapyClass.interface';
import RequestDeleteTherapyClass from '../interfaces/therapyClass/requestDeleteTherapyClass.interface';
import RequestCreateTherapyClass from '../interfaces/therapyClass/requestCreateTherapyClass.interface';
import RequestGetTherapyClassByID from '../interfaces/therapyClass/requestGetTherapyClassByID.interface';
import ResponseGetTherapyClassByID from '../interfaces/therapyClass/responseGetTherapyClassByID.interface';

const prisma = new PrismaClient({
  log: ['query'],
});

export async function createTherapyClass(req: RequestCreateTherapyClass, res: Response): Promise<Response> {
  
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

    const inputData = {
      name            : req.body.name.trim().toLowerCase(),
      current_user_uid: req.body.current_user_uid,
    }

    const checkTherapyClass = await prisma.therapy_classes.findFirst({
      where: {
        AND: [
          {name: inputData.name,},
          {deleted_at: null,},
        ]
      },
    })

    if (checkTherapyClass) {
      const exception = new TherapyClassAlreadyExistException("Therapy Class name already exist");
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
      let therapyClass = await prisma.therapy_classes.create({
        data: {
          name        : inputData.name,
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
      
      const responseData = new SuccessException("Therapy Class created successfully")

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

export async function getTherapyClass(req: RequestGetTherapyClass, res: Response): Promise<Response> {
  try {
    const { page, size, cond, sort, field } = req.query;
    const condition                         = cond ? cond : undefined;
    const sortBy                            = sort ? sort : 'asc';
    const fieldBy                           = field ? field : 'id';
    const { limit, offset }                 = getPagination(page, size);

    const query: Prisma.therapy_classesFindManyArgs = {
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

    const [therapyClassList, therapyClassCount] = await prisma.$transaction([
      prisma.therapy_classes.findMany(query),
      prisma.therapy_classes.count({ where: query.where}),
    ])
    
    const therapyClassData                             = getPagingData(therapyClassList, therapyClassCount, page, limit);
    const getTherapyClassData: ResponseGetTherapyClass = {
      data        : therapyClassData.data,
      total_data  : therapyClassData.totalData,
      current_page: therapyClassData.currentPage,
      total_pages : therapyClassData.totalPages
    }
    
    const responseData = new SuccessException("Therapy Class data received", getTherapyClassData)

    return res.send(responseData.getResponse)

  } catch (e: any) {
    let exception= new BasicErrorException(e.message);
    return res.status(400).send(exception.getResponse)
  }
}

export async function getTherapyClassById(req: RequestGetTherapyClassByID, res: Response): Promise<Response> {
  try {

    const { therapy_class_uid }   = req.params;

    const therapyClass = await prisma.therapy_classes.findFirst({
      where: {
        AND: [
          {uid: therapy_class_uid,},
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

    if (!therapyClass) {
      const exception = new TherapyClassNotFoundException();
      return res.status(400).send(exception.getResponse);
    }

    const getTherapyClassData: ResponseGetTherapyClassByID = {
      data: therapyClass
    }
    
    const responseData = new SuccessException("Therapy Class data received", getTherapyClassData)

    return res.send(responseData.getResponse)

  } catch (e: any) {
    let exception= new BasicErrorException(e.message);
    return res.status(400).send(exception.getResponse)
  }
}

export async function editTherapyClass(req: RequestEditTherapyClass, res: Response): Promise<Response> {
  try {

    const { therapy_class_uid } = req.params;
    const inputData             = req.body;

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
    
    const editData = {
      name            : inputData.name.trim().toLowerCase(),
      current_user_uid: inputData.current_user_uid,
    }
    
    const checkTherapyClass = await prisma.therapy_classes.findFirst({
      where: {
        AND: [
          {uid: therapy_class_uid},
          {deleted_at: null,},
        ]
      },
      select: {
        uid         : true,
        name        : true,
      }
    })

    if(checkTherapyClass?.name != editData.name) {
      const checkName = await prisma.therapy_classes.findFirst({
        where: {
          AND: [
            {name: editData.name,},
            {deleted_at: null,},
          ]
        },
      })

      if (checkName) {
        const exception = new TherapyClassAlreadyExistException("Therapy Class name already exist");
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
      const updateTherapyClass = await prisma.therapy_classes.update({
        where: {
          uid: therapy_class_uid
        },
        data: {
          name             : editData.name,
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

      const responseData = new SuccessException("Therapy Class edited successfully", updateTherapyClass)

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

export async function deleteTherapyClass(req: RequestDeleteTherapyClass, res: Response): Promise<Response> {
  try {
    
    const { therapy_class_uid } = req.params;
    const deleteData            = req.body;
    
    const checkTherapyClass = await prisma.therapy_classes.findFirst({
      where: {
        AND: [
          {uid: therapy_class_uid},
          {deleted_at: null,},
        ]
      }
    })

    if (!checkTherapyClass) {
      const exception = new TherapyClassNotFoundException();
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
      const therapyClass = await prisma.therapy_classes.update({
        where: {
          uid: therapy_class_uid
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
      
      const responseData = new SuccessException("Therapy Class deleted successfully")

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
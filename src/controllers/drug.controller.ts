import moment from 'moment-timezone';
import Joi, { not } from 'joi';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { Request, Response } from "express";
import { PrismaClient, Prisma } from '@prisma/client';

import { getPagination, getPagingData } from '../utils/pagination.util';
import SuccessException from '../exceptions/200_success.exception';
import BasicErrorException from '../exceptions/700_basicError.exception';
import InvalidInputException from '../exceptions/701_invalidInput.exception';
import DrugNotFoundException from '../exceptions/717_drugNotFound.exception';
import DrugAlreadyExistException from '../exceptions/716_drugAlreadyExist.exception';

import RequestGetDrug from '../interfaces/drug/requestGetDrug.interface';
import RequestEditDrug from '../interfaces/drug/requestEditDrug.interface';
import ResponseGetDrug from '../interfaces/drug/responseGetDrug.interface';
import RequestDeleteDrug from '../interfaces/drug/requestDeleteDrug.interface';
import RequestCreateDrug from '../interfaces/drug/requestCreateDrug.interface';
import RequestGetDrugByID from '../interfaces/drug/requestGetDrugByID.interface';
import ResponseGetDrugByID from '../interfaces/drug/responseGetDrugByID.interface';
import ResponseGetDrugDdl from '../interfaces/drug/responseGetDrugDdl.interface';

const prisma = new PrismaClient({
  log: ['query'],
});

export async function createDrug(req: RequestCreateDrug, res: Response): Promise<Response> {
  
  try {
    const schema = Joi.object({
      name: Joi.string().min(1).max(60).required().messages({
          // 'string.base': `"a" should be a type of 'text'`,
        'string.empty': `Name cannot be an empty field`,
        'string.min'  : `Name should have a minimum length of 1`,
        'any.required': `Name is a required field`
      }),
      description: Joi.string().max(191).allow('').optional(),
      status     : Joi.boolean().required().messages({
        'boolean.empty': `Status cannot be an empty field`,
        'any.required' : `STatus is a required field`
      }),
      shape_uid       : Joi.string().required().messages({
        'string.empty': `Shape cannot be an empty field`,
        'any.required': `Shape is a required field`
      }),
      category_uid    : Joi.string().required().messages({
        'string.empty': `Category cannot be an empty field`,
        'any.required': `Category is a required field`
      }),
      therapy_class_uid : Joi.string().required().messages({
        'string.empty': `Therapy Class cannot be an empty field`,
        'any.required': `Therapy Class is a required field`
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

    const inputData   = {
      name             : req.body.name.trim().toLowerCase(),
      description      : req.body.description.trim(),
      status           : (String(req.body.status).toLowerCase() === 'true'),
      shape_uid        : req.body.shape_uid,
      category_uid     : req.body.category_uid,
      therapy_class_uid: req.body.therapy_class_uid,
      current_user_uid : req.body.current_user_uid,
    }

    const checkDrug = await prisma.drugs.findFirst({
      where: {
        AND: [
          {name: inputData.name,},
          {deleted_at: null,},
        ]
      },
    })

    if (checkDrug) {
      const exception = new DrugAlreadyExistException("Drug name already exist");
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
      let drug = await prisma.drugs.create({
        data: {
          name       : inputData.name,
          description: inputData.description,
          status     : inputData.status,
          shapes     : {
            connect: {
              uid: inputData.shape_uid,
            }
          },
          categories: {
            connect : {
              uid: inputData.category_uid,
            }
          },
          therapy_classes: {
            connect: {
              uid: inputData.therapy_class_uid,
            }
          },
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
        },
      });
      
      const responseData = new SuccessException("Drug created successfully")

      return res.send(responseData.getResponse)

    } catch (err: any) {
      let exception = new BasicErrorException(err.message);
      return res.status(400).send(exception.getResponse)
    }

  } catch (e: any) {
    let exception = new BasicErrorException(e.message);
    return res.status(400).send(exception.getResponse)
  }

}

export async function getDrug(req: RequestGetDrug, res: Response): Promise<Response> {
  try {
    const { page, size, cond, sort, field } = req.query;
    const condition                         = cond ? cond : undefined;
    const sortBy                            = sort ? sort : 'asc';
    const fieldBy                           = field ? field : 'id';
    const { limit, offset }                 = getPagination(page, size);

    const query: Prisma.drugsFindManyArgs = {
      skip : offset,
      take : limit,
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
        uid   : true,
        name  : true,
        shapes: {
          select : {
            name: true,
            uid : true,
          }
        },
        categories: {
          select : {
            name: true,
            uid : true,
          }
        },
        therapy_classes: {
          select : {
            name: true,
            uid : true,
          }
        },
        status     : true,
        description: true,
        created_at : true,
        updated_at : true,
        deleted_at : true,
        createdby  : {
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

    const [drugList, drugCount] = await prisma.$transaction([
      prisma.drugs.findMany(query),
      prisma.drugs.count({ where: query.where}),
    ])
    
    const drugData                     = getPagingData(drugList, drugCount, page, limit);
    const getDrugData: ResponseGetDrug = {
      data        : drugData.data,
      total_data  : drugData.totalData,
      current_page: drugData.currentPage,
      total_pages : drugData.totalPages
    }
    
    const responseData = new SuccessException("Drug data received", getDrugData)

    return res.send(responseData.getResponse)

  } catch (e: any) {
    let exception = new BasicErrorException(e.message);
    return res.status(400).send(exception.getResponse)
  }
}

export async function getDrugById(req: RequestGetDrugByID, res: Response): Promise<Response> {
  try {

    const { drug_uid } = req.params;

    const drug = await prisma.drugs.findFirst({
      where: {
        AND: [
          {uid: drug_uid,},
          {deleted_at: null,},
        ]
      },
      select: {
        uid   : true,
        name  : true,
        shapes: {
          select : {
            name: true,
            uid : true,
          }
        },
        categories: {
          select : {
            name: true,
            uid : true,
          }
        },
        therapy_classes: {
          select : {
            name: true,
            uid : true,
          }
        },
        status     : true,
        description: true,
        created_at : true,
        updated_at : true,
        deleted_at : true,
        createdby  : {
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

    if (!drug) {
      const exception = new DrugNotFoundException();
      return res.status(400).send(exception.getResponse);
    }

    const getDrugData: ResponseGetDrugByID = {
      data: drug
    }
    
    const responseData = new SuccessException("Drug data received", getDrugData)

    return res.send(responseData.getResponse)

  } catch (e: any) {
    let exception = new BasicErrorException(e.message);
    return res.status(400).send(exception.getResponse)
  }
}

export async function editDrug(req: RequestEditDrug, res: Response): Promise<Response> {
  try {

    const { drug_uid } = req.params;

    const schema = Joi.object({
      name: Joi.string().min(1).max(60).required().messages({
          // 'string.base': `"a" should be a type of 'text'`,
        'string.empty': `Name cannot be an empty field`,
        'string.min'  : `Name should have a minimum length of 1`,
        'any.required': `Name is a required field`
      }),
      description: Joi.string().max(191).allow('').optional(),
      status     : Joi.boolean().required().messages({
        'boolean.empty': `Status cannot be an empty field`,
        'any.required' : `STatus is a required field`
      }),
      shape_uid       : Joi.string().required().messages({
        'string.empty': `Shape cannot be an empty field`,
        'any.required': `Shape is a required field`
      }),
      category_uid    : Joi.string().required().messages({
        'string.empty': `Category cannot be an empty field`,
        'any.required': `Category is a required field`
      }),
      therapy_class_uid : Joi.string().required().messages({
        'string.empty': `Therapy Class cannot be an empty field`,
        'any.required': `Therapy Class is a required field`
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
      name             : req.body.name.trim().toLowerCase(),
      description      : req.body.description.trim(),
      status           : (String(req.body.status).toLowerCase() === 'true'),
      shape_uid        : req.body.shape_uid,
      category_uid     : req.body.category_uid,
      therapy_class_uid: req.body.therapy_class_uid,
      current_user_uid : req.body.current_user_uid,
    }

    const checkDrug = await prisma.drugs.findFirst({
      where: {
        AND: [
          {uid: drug_uid},
          {deleted_at: null,},
        ]
      },
      select: {
        uid : true,
        name: true,
      }
    })

    if(checkDrug?.name != editData.name) {
      const checkName = await prisma.drugs.findFirst({
        where: {
          AND: [
            {name: editData.name,},
            {deleted_at: null,},
          ]
        },
      })

      if (checkName) {
        const exception = new DrugAlreadyExistException("Drug name already exist");
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
      const updateDrug = await prisma.drugs.update({
        where: {
          uid: drug_uid
        },
        data: {
          name       : editData.name,
          description: editData.description,
          status     : editData.status,
          shapes     : {
            connect: {
              uid: editData.shape_uid,
            }
          },
          categories: {
            connect : {
              uid: editData.category_uid,
            }
          },
          therapy_classes: {
            connect: {
              uid: editData.therapy_class_uid,
            }
          },
          updated_at: moment().tz('Asia/Jakarta').format(),
          updatedby : {
            connect : {
              id: currentUser?.id
            }
          },
        },
        select: {
          uid   : true,
          name  : true,
          shapes: {
            select : {
              name: true,
              uid : true,
            }
          },
          categories: {
            select : {
              name: true,
              uid : true,
            }
          },
          therapy_classes: {
            select : {
              name: true,
              uid : true,
            }
          },
          status     : true,
          description: true,
          created_at : true,
          updated_at : true,
          deleted_at : true,
          createdby  : {
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

      const responseData = new SuccessException("Drug edited successfully", updateDrug)

      return res.send(responseData.getResponse)

    } catch (err: any) {
      let exception = new BasicErrorException(err.message);
      return res.status(400).send(exception.getResponse)
    }

  } catch (e: any) {
    let exception = new BasicErrorException(e.message);
    return res.status(400).send(exception.getResponse)
  }
}

export async function deleteDrug(req: RequestDeleteDrug, res: Response): Promise<Response> {
  try {
    
    const { drug_uid } = req.params;
    const deleteData   = req.body;
    
    const checkDrug = await prisma.drugs.findFirst({
      where: {
        AND: [
          {uid: drug_uid},
          {deleted_at: null,},
        ]
      }
    })

    if (!checkDrug) {
      const exception = new DrugNotFoundException();
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
      const drug = await prisma.drugs.update({
        where: {
          uid: drug_uid
        },
        data: {
          updated_at: moment().tz('Asia/Jakarta').format(),
          deleted_at: moment().tz('Asia/Jakarta').format(),
          updatedby : {
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
      
      const responseData = new SuccessException("Drug deleted successfully")

      return res.send(responseData.getResponse)

    } catch (err: any) {
      let exception = new BasicErrorException(err.message);
      return res.status(400).send(exception.getResponse)
    }
  } catch (e: any) {
    let exception = new BasicErrorException(e.message);
    return res.status(400).send(exception.getResponse)
  }
}


export async function getDrugDdl(req: Request, res: Response): Promise<Response> {
  try {

    const drugList = await prisma.drugs.findMany({
      where: {
        AND:[
          {deleted_at: null,},
          {status: true,},
        ]
      },
      orderBy: {
        name: 'asc'
      },
      select: {
        uid : true,
        name: true,
      }
    })

    const drugOptions = drugList.map((drug) => {
      return {
        label: drug.name,
        value: drug.uid,
      }
    })

    const getDrugDdlData: ResponseGetDrugDdl = {
      data: drugOptions,
    }
    
    const responseData = new SuccessException("Drug ddl received", getDrugDdlData)

    return res.send(responseData.getResponse)

  } catch (e: any) {
    let exception = new BasicErrorException(e.message);
    return res.status(400).send(exception.getResponse)
  }
}
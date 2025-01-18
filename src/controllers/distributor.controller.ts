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
import DistributorNotFoundException from '../exceptions/721_distributorNotFound.exception';
import DistributorAlreadyExistException from '../exceptions/720_distributorAlreadyExist.exception';

import RequestCreateDistributor from '../interfaces/distributor/requestCreateDistributor.interface';
import RequestGetDistributor from '../interfaces/distributor/requestGetDistributor.interface';
import RequestGetDistributorByID from '../interfaces/distributor/requestGetDistributorByID.interface';
import ResponseGetDistributorByID from '../interfaces/distributor/responseGetDistributorByID.interface';
import RequestEditDistributor from '../interfaces/distributor/requestEditDistributor.interface';
import RequestDeleteDistributor from '../interfaces/distributor/requestDeleteDistributor.interface';
import ResponseGetDistributor from '../interfaces/distributor/responseGetDistributor.interface';
import ResponseGetDistributorDdl from '../interfaces/distributor/responseGetDistributorDdl.interface';

const prisma = new PrismaClient({
  log: ['query'],
});

export async function createDistributor(req: RequestCreateDistributor, res: Response): Promise<Response> {
  
  try {
    const schema = Joi.object({
      name: Joi.string().min(1).max(60).required().messages({
        // 'string.base': `"a" should be a type of 'text'`,
        'string.empty': `Name cannot be an empty field`,
        'string.min'  : `Name should have a minimum length of 1`,
        'any.required': `Name is a required field`
      }),
      address: Joi.string().required().messages({
        'string.empty': `Address cannot be an empty field`,
        'any.required': `Address is a required field`
      }),
      phone: Joi.string().required().messages({
        'string.empty': `Phone cannot be an empty field`,
        'any.required': `Phone is a required field`
      }),
      no_permit: Joi.string().required().messages({
        'string.empty': `No Permit cannot be an empty field`,
        'any.required': `No Permit is a required field`
      }),
      contact_person: Joi.string().required().messages({
        'string.empty': `Contact Person cannot be an empty field`,
        'any.required': `Contact Person is a required field`
      }),
      status: Joi.boolean().required().messages({
        'boolean.empty': `Status cannot be an empty field`,
        'any.required' : `STatus is a required field`
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
      name            : req.body.name.trim().toLowerCase(),
      address         : req.body.address.trim(),
      phone           : req.body.phone.trim(),
      no_permit       : req.body.no_permit.trim(),
      contact_person  : req.body.contact_person.trim(),
      description     : req.body.description.trim(),
      status          : (String(req.body.status).toLowerCase() === 'true'),
      current_user_uid: req.body.current_user_uid,
    };

    const checkDistributor = await prisma.distributors.findFirst({
      where: {
        AND: [
          {name: inputData.name,},
          {deleted_at: null,},
        ]
      },
    })

    if (checkDistributor) {
      const exception = new DistributorAlreadyExistException("Distributor name already exist");
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
      let distributor = await prisma.distributors.create({
        data: {
          name          : inputData.name,
          address       : inputData.address,
          phone         : inputData.phone,
          no_permit     : inputData.no_permit,
          contact_person: inputData.contact_person,
          description   : inputData.description,
          status        : inputData.status,
          created_at    : moment().tz('Asia/Jakarta').format(),
          updated_at    : moment().tz('Asia/Jakarta').format(),
          createdby     : {
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
      
      const responseData = new SuccessException("Distributor created successfully")

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

export async function getDistributor(req: RequestGetDistributor, res: Response): Promise<Response> {
  try {
    const { page, size, cond, sort, field } = req.query;
    const condition                         = cond ? cond : undefined;
    const sortBy                            = sort ? sort : 'asc';
    const fieldBy                           = field ? field : 'id';
    const { limit, offset }                 = getPagination(page, size);

    const query: Prisma.distributorsFindManyArgs = {
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
        uid           : true,
        name          : true,
        address       : true,
        phone         : true,
        no_permit     : true,
        contact_person: true,
        status        : true,
        description   : true,
        created_at    : true,
        updated_at    : true,
        deleted_at    : true,
        createdby     : {
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

    const [distributorList, distributorCount] = await prisma.$transaction([
      prisma.distributors.findMany(query),
      prisma.distributors.count({ where: query.where}),
    ])
    
    const distributorData                            = getPagingData(distributorList, distributorCount, page, limit);
    const getDistributorData: ResponseGetDistributor = {
      data        : distributorData.data,
      total_data  : distributorData.totalData,
      current_page: distributorData.currentPage,
      total_pages : distributorData.totalPages
    }
    
    const responseData = new SuccessException("Distributor data received", getDistributorData)

    return res.send(responseData.getResponse)

  } catch (e: any) {
    let exception= new BasicErrorException(e.message);
    return res.status(400).send(exception.getResponse)
  }
}

export async function getDistributorById(req: RequestGetDistributorByID, res: Response): Promise<Response> {
  try {

    const { distributor_uid }   = req.params;

    const distributor = await prisma.distributors.findFirst({
      where: {
        AND: [
          {uid: distributor_uid,},
          {deleted_at: null,},
        ]
      },
      select: {
        uid           : true,
        name          : true,
        address       : true,
        phone         : true,
        no_permit     : true,
        contact_person: true,
        status        : true,
        description   : true,
        created_at    : true,
        updated_at    : true,
        deleted_at    : true,
        createdby     : {
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

    if (!distributor) {
      const exception = new DistributorNotFoundException();
      return res.status(400).send(exception.getResponse);
    }

    const getDistributorData: ResponseGetDistributorByID = {
      data: distributor
    }
    
    const responseData = new SuccessException("Distributor data received", getDistributorData)

    return res.send(responseData.getResponse)

  } catch (e: any) {
    let exception= new BasicErrorException(e.message);
    return res.status(400).send(exception.getResponse)
  }
}

export async function editDistributor(req: RequestEditDistributor, res: Response): Promise<Response> {
  try {

    const { distributor_uid } = req.params;

    const schema = Joi.object({
      name: Joi.string().min(1).max(60).required().messages({
        // 'string.base': `"a" should be a type of 'text'`,
        'string.empty': `Name cannot be an empty field`,
        'string.min'  : `Name should have a minimum length of 1`,
        'any.required': `Name is a required field`
      }),
      address: Joi.string().required().messages({
        'string.empty': `Address cannot be an empty field`,
        'any.required': `Address is a required field`
      }),
      phone: Joi.string().required().messages({
        'string.empty': `Phone cannot be an empty field`,
        'any.required': `Phone is a required field`
      }),
      no_permit: Joi.string().required().messages({
        'string.empty': `No Permit cannot be an empty field`,
        'any.required': `No Permit is a required field`
      }),
      contact_person: Joi.string().required().messages({
        'string.empty': `Contact Person cannot be an empty field`,
        'any.required': `Contact Person is a required field`
      }),
      status: Joi.boolean().required().messages({
        'boolean.empty': `Status cannot be an empty field`,
        'any.required': `STatus is a required field`
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
    
    const editData = {
      name            : req.body.name.trim().toLowerCase(),
      address         : req.body.address.trim(),
      phone           : req.body.phone.trim(),
      no_permit       : req.body.no_permit.trim(),
      contact_person  : req.body.contact_person.trim(),
      description     : req.body.description.trim(),
      status          : (String(req.body.status).toLowerCase() === 'true'),
      current_user_uid: req.body.current_user_uid,
    }
    
    const checkDistributor = await prisma.distributors.findFirst({
      where: {
        AND: [
          {uid: distributor_uid},
          {deleted_at: null,},
        ]
      },
      select: {
        uid         : true,
        name        : true,
      }
    })

    if(checkDistributor?.name != editData.name) {
      const checkName = await prisma.distributors.findFirst({
        where: {
          AND: [
            {name: editData.name,},
            {deleted_at: null,},
          ]
        },
      })

      if (checkName) {
        const exception = new DistributorAlreadyExistException("Distributor name already exist");
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
      const updateDistributor = await prisma.distributors.update({
        where: {
          uid: distributor_uid
        },
        data: {
          name          : editData.name,
          address       : editData.address,
          phone         : editData.phone,
          no_permit     : editData.no_permit,
          contact_person: editData.contact_person,
          description   : editData.description,
          status        : editData.status,
          updated_at    : moment().tz('Asia/Jakarta').format(),
          updatedby     : {
            connect : {
              id: currentUser?.id
            }
          },
        },
        select: {
          uid           : true,
          name          : true,
          address       : true,
          phone         : true,
          no_permit     : true,
          contact_person: true,
          status        : true,
          description   : true,
          created_at    : true,
          updated_at    : true,
          deleted_at    : true,
          createdby     : {
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

      const responseData = new SuccessException("Distributor edited successfully", updateDistributor)

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

export async function deleteDistributor(req: RequestDeleteDistributor, res: Response): Promise<Response> {
  try {
    
    const { distributor_uid } = req.params;
    const deleteData          = req.body;
    
    const checkDistributor = await prisma.distributors.findFirst({
      where: {
        AND: [
          {uid: distributor_uid},
          {deleted_at: null,},
        ]
      }
    })

    if (!checkDistributor) {
      const exception = new DistributorNotFoundException();
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
      const distributor = await prisma.distributors.update({
        where: {
          uid: distributor_uid
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
      
      const responseData = new SuccessException("Distributor deleted successfully")

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


export async function getDistributorDdl(req: Request, res: Response): Promise<Response> {
  try {

    const distributorList = await prisma.distributors.findMany({
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

    const distributorOptions = distributorList.map((distributor) => {
      return {
        label: distributor.name,
        value: distributor.uid,
      }
    })

    const getDistributorDdlData: ResponseGetDistributorDdl = {
      data: distributorOptions,
    }
    
    const responseData = new SuccessException("Distributors ddl received", getDistributorDdlData)

    return res.send(responseData.getResponse)

  } catch (e: any) {
    let exception= new BasicErrorException(e.message);
    return res.status(400).send(exception.getResponse)
  }
}
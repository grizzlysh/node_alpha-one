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
import CategoryNotFoundException from '../exceptions/713_categoryNotFound.exception';
import CategoryAlreadyExistException from '../exceptions/712_categoryAlreadyExist.exception';

import RequestGetCategory from '../interfaces/category/requestGetCategory.interface';
import ResponseGetCategory from '../interfaces/category/responseGetCategory.interface';
import RequestEditCategory from '../interfaces/category/requestEditCategory.interface';
import RequestDeleteCategory from '../interfaces/category/requestDeleteCategory.interface';
import RequestCreateCategory from '../interfaces/category/requestCreateCategory.interface';
import RequestGetCategoryByID from '../interfaces/category/requestGetCategoryByID.interface';
import ResponseGetCategoryByID from '../interfaces/category/responseGetCategoryByID.interface';
import ResponseGetCategoryDdl from '../interfaces/category/responseGetCategoryDdl.interface';

const prisma = new PrismaClient({
  log: ['query'],
});

export async function createCategory(req: RequestCreateCategory, res: Response): Promise<Response> {
  
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

    const checkCategory = await prisma.categories.findFirst({
      where: {
        AND: [
          {name: inputData.name,},
          {deleted_at: null,},
        ]
      },
    })

    if (checkCategory) {
      const exception = new CategoryAlreadyExistException("Category name already exist");
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
      let category = await prisma.categories.create({
        data: {
          name        : inputData.name,
          created_at  : moment().tz('Asia/Jakarta').format(),
          updated_at  : moment().tz('Asia/Jakarta').format(),
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
      
      const responseData = new SuccessException("Category created successfully")

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

export async function getCategory(req: RequestGetCategory, res: Response): Promise<Response> {
  try {
    const { page, size, cond, sort, field } = req.query;
    const condition                         = cond ? cond : undefined;
    const sortBy                            = sort ? sort : 'asc';
    const fieldBy                           = field ? field : 'id';
    const { limit, offset }                 = getPagination(page, size);

    const query: Prisma.categoriesFindManyArgs = {
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

    const [categoryList, categoryCount] = await prisma.$transaction([
      prisma.categories.findMany(query),
      prisma.categories.count({ where: query.where}),
    ])
    
    const categoryData                         = getPagingData(categoryList, categoryCount, page, limit);
    const getCategoryData: ResponseGetCategory = {
      data        : categoryData.data,
      total_data  : categoryData.totalData,
      current_page: categoryData.currentPage,
      total_pages : categoryData.totalPages
    }
    
    const responseData = new SuccessException("Category data received", getCategoryData)

    return res.send(responseData.getResponse)

  } catch (e: any) {
    let exception= new BasicErrorException(e.message);
    return res.status(400).send(exception.getResponse)
  }
}

export async function getCategoryById(req: RequestGetCategoryByID, res: Response): Promise<Response> {
  try {

    const { category_uid }   = req.params;

    const category = await prisma.categories.findFirst({
      where: {
        AND: [
          {uid: category_uid,},
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

    if (!category) {
      const exception = new CategoryNotFoundException();
      return res.status(400).send(exception.getResponse);
    }

    const getCategoryData: ResponseGetCategoryByID = {
      data: category
    }
    
    const responseData = new SuccessException("Category data received", getCategoryData)

    return res.send(responseData.getResponse)

  } catch (e: any) {
    let exception= new BasicErrorException(e.message);
    return res.status(400).send(exception.getResponse)
  }
}

export async function editCategory(req: RequestEditCategory, res: Response): Promise<Response> {
  try {

    const { category_uid } = req.params;

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
      name            : req.body.name.trim().toLowerCase(),
      current_user_uid: req.body.current_user_uid,
    }
    
    const checkCategory = await prisma.categories.findFirst({
      where: {
        AND: [
          {uid: category_uid},
          {deleted_at: null,},
        ]
      },
      select: {
        uid         : true,
        name        : true,
      }
    })

    if(checkCategory?.name != editData.name) {
      const checkName = await prisma.categories.findFirst({
        where: {
          AND: [
            {name: editData.name,},
            {deleted_at: null,},
          ]
        },
      })

      if (checkName) {
        const exception = new CategoryAlreadyExistException("Category name already exist");
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
      const updateCategory = await prisma.categories.update({
        where: {
          uid: category_uid
        },
        data: {
          name             : editData.name,
          updated_at       : moment().tz('Asia/Jakarta').format(),
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

      const responseData = new SuccessException("Category edited successfully", updateCategory)

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

export async function deleteCategory(req: RequestDeleteCategory, res: Response): Promise<Response> {
  try {
    
    const { category_uid } = req.params;
    const deleteData       = req.body;
    
    const checkCategory = await prisma.categories.findFirst({
      where: {
        AND: [
          {uid: category_uid},
          {deleted_at: null,},
        ]
      }
    })

    if (!checkCategory) {
      const exception = new CategoryNotFoundException();
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
      const category = await prisma.categories.update({
        where: {
          uid: category_uid
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
      
      const responseData = new SuccessException("Category deleted successfully")

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

export async function getCategoryDdl(req: Request, res: Response): Promise<Response> {
  try {

    const categoryList = await prisma.categories.findMany({
      where: {
        AND:[
          {deleted_at: null,},
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

    const categoryOptions = categoryList.map((category) => {
      return {
        label: category.name,
        value: category.uid,
      }
    })

    const getCategoryDdlData: ResponseGetCategoryDdl = {
      data: categoryOptions,
    }
    
    const responseData = new SuccessException("Category ddl received", getCategoryDdlData)

    return res.send(responseData.getResponse)

  } catch (e: any) {
    let exception= new BasicErrorException(e.message);
    return res.status(400).send(exception.getResponse)
  }
}
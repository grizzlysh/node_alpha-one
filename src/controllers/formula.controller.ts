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
import FormulaNotFoundException from '../exceptions/719_formulaNotFound.exception';
import FormulaAlreadyExistException from '../exceptions/718_formulaAlreadyExist.exception';

import RequestCreateFormula from '../interfaces/formula/requestCreateFormula.interface';
import RequestGetFormula from '../interfaces/formula/requestGetFormula.interface';
import ResponseGetFormula from '../interfaces/formula/responseGetFormula.interface';
import RequestGetFormulaByID from '../interfaces/formula/requestGetFormulaByID.interface';
import ResponseGetFormulaByID from '../interfaces/formula/responseGetFormulaByID.interface';
import RequestDeleteFormula from '../interfaces/formula/requestDeleteFormula.interface';
import RequestEditFormula from '../interfaces/formula/requestEditFormula.interface';
import { generateBarcodeFormula } from '../utils/barcode.util';
import ResponseGetFormulaDdl from '../interfaces/formula/responseGetFormulaDdl.interface';

const prisma = new PrismaClient({
  log: ['query'],
});

export async function createFormula(req: RequestCreateFormula, res: Response): Promise<Response> {
  
  try {
    const schema = Joi.object({
      name: Joi.string().min(1).max(60).required().messages({
        'string.empty': `Name cannot be an empty field`,
        'string.min'  : `Name should have a minimum length of 1`,
        'any.required': `Name is a required field`
      }),
      price: Joi.number().required().messages({
        'string.empty': `Price cannot be an empty field`,
        'any.required': `Price is a required field`
      }),
      status: Joi.boolean().required().messages({
        'booleanß.empty': `Status cannot be an empty field`,
        'any.required': `STatus is a required field`
      }),
      description: Joi.string().max(191).allow('').optional(),
      detail_formulas: Joi.string().required().messages({
        'string.empty': `Detail Formula cannot be an empty field`,
        'any.required': `Detail Formula is a required field`
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
      name                : req.body.name.trim().toLowerCase(),
      price               : req.body.price,
      status              : (String(req.body.status).toLowerCase() === 'true'),
      description         : req.body.description.trim(),
      detail_formulas_json: req.body.detail_formulas,
      current_user_uid    : req.body.current_user_uid
    }

    const checkFormula = await prisma.formulas.findFirst({
      where: {
        AND: [
          {name: inputData.name,},
          {deleted_at: null,},
        ]
      },
    })

    if (checkFormula) {
      const exception = new FormulaAlreadyExistException("Formula name already exist");
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

    const currentDate      = moment().tz('Asia/Jakarta').format('YYMM').toString();
    const currentNoFormula = currentDate+'00';
    const latestNoFormula  = await prisma.formulas.findFirst({
      where: {
        no_formula: {
          startsWith: currentNoFormula
        }
      },
      orderBy: {
        no_formula: 'desc',
      }
    });

    let newNoFormula = '';
    if(latestNoFormula) {
      newNoFormula = (parseInt(latestNoFormula.no_formula)+1).toString();
    }
    else{
      newNoFormula = currentNoFormula+'1';
    }

    try {

      let inputDetailFormula: {
        drug_uid: string,
        qty_pcs : number,
      }[] = JSON.parse(inputData.detail_formulas_json);
      
      const barcodeFormula = await generateBarcodeFormula();

      await prisma.$transaction( async (prisma) => {
        let formula = await prisma.formulas.create({
          data: {
            name       : inputData.name,
            description: inputData.description,
            no_formula : newNoFormula,
            no_barcode : barcodeFormula,
            price      : inputData.price,
            status     : inputData.status,
            created_at : moment().tz('Asia/Jakarta').format().toString(),
            updated_at : moment().tz('Asia/Jakarta').format().toString(),
            createdby  : {
              connect: {
                id: currentUser?.id,
              }
            },
            updatedby : {
              connect: {
                id: currentUser?.id,
              }
            },
          },
        });

        inputDetailFormula.forEach( async (val) => {
          await prisma.detail_formulas.create({
            data: {
              drugs : {
                connect: {
                  uid: val.drug_uid,
                }
              },
              formulas: {
                connect: {
                  id: formula.id
                }
              },
              qty_pcs   : val.qty_pcs,
              created_at: moment().tz('Asia/Jakarta').format().toString(),
              updated_at: moment().tz('Asia/Jakarta').format().toString(),
              createdby : {
                connect: {
                  id: currentUser?.id,
                }
              },
              updatedby : {
                connect: {
                  id: currentUser?.id,
                }
              }, 
            }
          })
        })
      })

      const responseData = new SuccessException("Formula created successfully")

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

export async function getFormula(req: RequestGetFormula, res: Response): Promise<Response> {
  try {
    const { page, size, cond, sort, field } = req.query;
    const condition                         = cond ? cond : undefined;
    const sortBy                            = sort ? sort : 'asc';
    const fieldBy                           = field ? field : 'id';
    const { limit, offset }                 = getPagination(page, size);

    const query: Prisma.formulasFindManyArgs = {
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
        uid        : true,
        name       : true,
        description: true,
        no_formula : true,
        price      : true,
        status     : true,
        detail_formulas : {
          select: {
            qty_pcs: true,
            drugs  : {
              select : {
                uid : true,
                name: true,
              },
            },
          }
        },
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

    const [formulaList, formulaCount] = await prisma.$transaction([
      prisma.formulas.findMany(query),
      prisma.formulas.count({ where: query.where}),
    ])
    
    const formulaData                        = getPagingData(formulaList, formulaCount, page, limit);
    const getFormulaData: ResponseGetFormula = {
      data        : formulaData.data,
      total_data  : formulaData.totalData,
      current_page: formulaData.currentPage,
      total_pages : formulaData.totalPages
    }
    
    const responseData = new SuccessException("Formula data received", getFormulaData)

    return res.send(responseData.getResponse)

  } catch (e: any) {
    let exception= new BasicErrorException(e.message);
    return res.status(400).send(exception.getResponse)
  }
}

export async function getFormulaById(req: RequestGetFormulaByID, res: Response): Promise<Response> {
  try {

    const { formula_uid } = req.params;

    const formula = await prisma.formulas.findFirst({
      where: {
        AND: [
          {uid: formula_uid,},
          {deleted_at: null,},
        ]
      },
      select: {
        uid            : true,
        name           : true,
        description    : true,
        no_formula     : true,
        no_barcode     : true,
        price          : true,
        status         : true,
        detail_formulas: {
          select: {
            uid       : true,
            qty_pcs   : true,
            drugs     : {
              select : {
                uid : true,
                name: true,
              },
            },
          }
        },
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

    if (!formula) {
      const exception = new FormulaNotFoundException();
      return res.status(400).send(exception.getResponse);
    }

    const getFormulaData: ResponseGetFormulaByID = {
      data: formula
    }
    
    const responseData = new SuccessException("Formula data received", getFormulaData)

    return res.send(responseData.getResponse)

  } catch (e: any) {
    let exception= new BasicErrorException(e.message);
    return res.status(400).send(exception.getResponse)
  }
}

export async function editFormula(req: RequestEditFormula, res: Response): Promise<Response> {
  try {

    const { formula_uid } = req.params;

    const schema = Joi.object({
      name: Joi.string().min(1).max(60).required().messages({
        'string.empty': `Name cannot be an empty field`,
        'string.min'  : `Name should have a minimum length of 1`,
        'any.required': `Name is a required field`
      }),
      price: Joi.number().required().messages({
        'string.empty': `Price cannot be an empty field`,
        'any.required': `Price is a required field`
      }),
      status: Joi.boolean().required().messages({
        'boolean.empty': `Status cannot be an empty field`,
        'any.required' : `STatus is a required field`
      }),
      description: Joi.string().max(191).allow('').optional(),
      // detail_formulas: Joi.string().required().messages({
      //   'string.empty': `Detail Formula cannot be an empty field`,
      //   'any.required': `Detail Formula is a required field`
      // }),
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
      name                : req.body.name.trim().toLowerCase(),
      price               : req.body.price,
      status              : (String(req.body.status).toLowerCase() === 'true'),
      description         : req.body.description.trim(),
      // detail_formulas_json: req.body.detail_formulas,
      current_user_uid    : req.body.current_user_uid,
    }
    
    const checkFormula = await prisma.formulas.findFirst({
      where: {
        AND: [
          {uid: formula_uid},
          {deleted_at: null,},
        ]
      },
      select: {
        uid         : true,
        name        : true,
      }
    })

    if(checkFormula?.name != editData.name) {
      const checkName = await prisma.formulas.findFirst({
        where: {
          AND: [
            {name: editData.name,},
            {deleted_at: null,},
          ]
        },
      })

      if (checkName) {
        const exception = new FormulaAlreadyExistException("Formula name already exist");
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
      
      // let editDetailFormula: {
      //   detail_formula_uid: string,
      //   drug_uid          : string,
      //   qty_pcs           : number,
      // }[] = JSON.parse(editData.detail_formulas_json);
      
      await prisma.$transaction( async (prisma) => {
        let formula = await prisma.formulas.update({
          where: {
            uid: formula_uid,
          },
          data: {
            name       : editData.name,
            description: editData.description,
            price      : editData.price,
            status     : editData.status,
            updated_at : moment().tz('Asia/Jakarta').format().toString(),
            updatedby  : {
              connect : {
                id: currentUser?.id,
              }
            },
          },
        });

        //update formula detail
        // editDetailFormula.forEach( async (val) => {
        //   await prisma.detail_formulas.update({
        //     where : {
        //       uid: val.detail_formula_uid,
        //     },
        //     data: {
        //       drugs : {
        //         connect: {
        //           uid: val.drug_uid,
        //         }
        //       },
        //       qty_pcs   : val.qty_pcs,
        //       updated_at : moment().tz('Asia/Jakarta').format().toString(),
        //       updatedby  : {
        //         connect : {
        //           uid: editData.current_user_uid,
        //         }
        //       },
        //     }
        //   })
        // })

      })

      const responseData = new SuccessException("Formula edited successfully")

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

export async function deleteFormula(req: RequestDeleteFormula, res: Response): Promise<Response> {
  try {
    
    const { formula_uid } = req.params;
    const deleteData      = req.body;
    
    const checkFormula = await prisma.formulas.findFirst({
      where: {
        AND: [
          {uid: formula_uid},
          {deleted_at: null,},
        ]
      }
    })

    if (!checkFormula) {
      const exception = new FormulaNotFoundException();
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

      await prisma.$transaction( async (prisma) => {

        const formula = await prisma.formulas.update({
          where: {
            uid: formula_uid
          },
          data: {
            updated_at: moment().tz('Asia/Jakarta').format().toString(),
            deleted_at: moment().tz('Asia/Jakarta').format().toString(),
            updatedby: {
              connect: {
                id: currentUser?.id,
              }
            },
            deletedby: {
              connect: {
                id: currentUser?.id,
              }
            },
          }
        });

        const detailFormula = await prisma.detail_formulas.updateMany({
          where: {
            formula_id: formula.id,
          },
          data:{
            updated_at: moment().tz('Asia/Jakarta').format().toString(),
            deleted_at: moment().tz('Asia/Jakarta').format().toString(),
            updated_by: currentUser?.id,
            deleted_by: currentUser?.id,
          }
        })

      })
      
      const responseData = new SuccessException("Formula deleted successfully")

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

export async function getFormulaDdl(req: Request, res: Response): Promise<Response> {
  try {

    const formulaList = await prisma.formulas.findMany({
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

    const formulaOptions = formulaList.map((formula) => {
      return {
        label: formula.name,
        value: formula.uid,
      }
    })

    const getFormulaDdlData: ResponseGetFormulaDdl = {
      data: formulaOptions,
    }
    
    const responseData = new SuccessException("Formula ddl received", getFormulaDdlData)

    return res.send(responseData.getResponse)

  } catch (e: any) {
    let exception= new BasicErrorException(e.message);
    return res.status(400).send(exception.getResponse)
  }
}
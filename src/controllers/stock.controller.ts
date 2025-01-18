import moment from 'moment-timezone';
import Joi from 'joi';
import { Response } from "express";
import { PrismaClient, Prisma } from '@prisma/client';

import { getPagination, getPagingData, sortPage } from '../utils/pagination.util';

import SuccessException from '../exceptions/200_success.exception';
import BasicErrorException from '../exceptions/700_basicError.exception';
import InvalidInputException from '../exceptions/701_invalidInput.exception';
import StockNotFoundException from '../exceptions/726_stockNotFound.exception';

import { getCurrentUser } from '../utils/business.util';
import RequestGetStock from '../interfaces/stock/requestGetStock.interface';
import RequestGetStockByID from '../interfaces/stock/requestGetStockByID.interface';
import RequestEditStock from '../interfaces/stock/requestEditStock.interface';
import ResponseGetStock from '../interfaces/stock/responseGetStock.interface';
import ResponseGetStockByID from '../interfaces/stock/responseGetStockByID.interface';

const prisma = new PrismaClient({
  log: ['query'],
});

export async function getStock(req: RequestGetStock, res: Response): Promise<Response> {
  try {
    const { page, size, cond, sort, field } = req.query;
    const condition                         = cond ? cond : undefined;
    const sortBy                            = sort ? sort : 'asc';
    const fieldBy                           = field ? field : 'id';
    const { limit, offset }                 = getPagination(page, size);

    const query: Prisma.stocksFindManyArgs = {
      skip: offset,
      take: limit,
      where: {
        drugs: {
          name: {
            contains: condition
          }
        },
        deleted_at: null
      },
      orderBy: (fieldBy === 'drugs.name') ? {
        drugs: {
          name: sortBy, // Use 'asc' for ascending or 'desc' for descending
        },
      } : {
        [fieldBy]: sortBy, // Sort by a field in the stocks table
      },
      select: {
        uid         : true,
        total_qty   : true,
        price       : true,
        price_buy   : true,
        price_manual: true,
        drugs       : {
          select : {
            uid : true,
            name: true,
          },
        },
        detail_stocks: {
          select : {
            uid            : true,
            qty_pcs        : true,
            qty_box        : true,
            expired_date   : true,
            no_batch       : true,
            no_barcode     : true,
            is_initiate    : true,
            detail_invoices: {
              select : {
                uid : true,
                invoices: {
                  select: {
                    uid       : true,
                    no_invoice: true,
                  }
                },
              },
            },
          },
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

    const [stockList, stockCount] = await prisma.$transaction([
      prisma.stocks.findMany(query),
      prisma.stocks.count({ where: query.where}),
    ])
    
    const stockData                        = getPagingData(stockList, stockCount, page, limit);
    const getStockData: ResponseGetStock = {
      data        : stockData.data,
      total_data  : stockData.totalData,
      current_page: stockData.currentPage,
      total_pages : stockData.totalPages
    }
    
    const responseData = new SuccessException("Stock data received", getStockData)

    return res.send(responseData.getResponse)

  } catch (e: any) {
    let exception= new BasicErrorException(e.message);
    return res.status(400).send(exception.getResponse)
  }
}

export async function getStockById(req: RequestGetStockByID, res: Response): Promise<Response> {
  try {

    const { stock_uid } = req.params;

    const stock = await prisma.stocks.findFirst({
      where: {
        AND: [
          {uid: stock_uid,},
          {deleted_at: null,},
        ]
      },
      select: {
        uid         : true,
        total_qty   : true,
        price       : true,
        price_buy   : true,
        price_manual: true,
        drugs       : {
          select : {
            uid : true,
            name: true,
          },
        },
        detail_stocks: {
          select : {
            uid            : true,
            qty_pcs        : true,
            qty_box        : true,
            expired_date   : true,
            no_batch       : true,
            no_barcode     : true,
            is_initiate    : true,
            detail_invoices: {
              select : {
                uid : true,
                invoices: {
                  select: {
                    uid       : true,
                    no_invoice: true,
                  }
                },
              },
            },
          },
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

    if (!stock) {
      const exception = new StockNotFoundException();
      return res.status(400).send(exception.getResponse);
    }

    const getStockData: ResponseGetStockByID = {
      data: stock
    }
    
    const responseData = new SuccessException("Stock data received", getStockData)

    return res.send(responseData.getResponse)

  } catch (e: any) {
    let exception= new BasicErrorException(e.message);
    return res.status(400).send(exception.getResponse)
  }
}

export async function editStock(req: RequestEditStock, res: Response): Promise<Response> {
  try {

    const { stock_uid } = req.params;

    const schema = Joi.object({
      price_manual: Joi.number().required().messages({
        'string.empty': `Price Manual cannot be an empty field`,
        'any.required': `Price Manual is a required field`
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
      price_manual        : req.body.price_manual,
      current_user_uid    : req.body.current_user_uid,
    }

    const currentUser       = await getCurrentUser(editData.current_user_uid);

    try {

      const updateStock = await prisma.stocks.update({
        where: {
          uid: stock_uid
        },
        data: {
          price_manual: editData.price_manual,
          updated_at  : moment().tz('Asia/Jakarta').format(),
          updatedby   : {
            connect : {
              id: currentUser?.id
            }
          },
        },
      });

      const responseData = new SuccessException("Stock edited successfully")

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
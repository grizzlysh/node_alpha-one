import moment from 'moment-timezone';
import Joi from 'joi';
import { Response } from "express";
import { PrismaClient, Prisma } from '@prisma/client';

import Business from '../constants/business.constant';
import { generateBarcodeStock } from '../utils/barcode.util';
import { getPagination, getPagingData } from '../utils/pagination.util';

import SuccessException from '../exceptions/200_success.exception';
import BasicErrorException from '../exceptions/700_basicError.exception';
import InvalidInputException from '../exceptions/701_invalidInput.exception';
import StockNotFoundException from '../exceptions/727_stockNotFound.exception';
import StockStillExistException from '../exceptions/728_stockStillExist.exception';
import InvoiceNotFoundException from '../exceptions/723_invoiceNotFound.exception';
import InvoiceAlreadyExistException from '../exceptions/722_invoiceAlreadyExist.exception';

import RequestGetInvoice from '../interfaces/invoice/requestGetInvoice.interface';
import ResponseGetInvoice from '../interfaces/invoice/responseGetInvoice.interface';
import RequestEditInvoice from '../interfaces/invoice/requestEditInvoice.interface';
import RequestDeleteInvoice from '../interfaces/invoice/requestDeleteInvoice.interface';
import RequestCreateInvoice from '../interfaces/invoice/requestCreateInvoice.interface';
import RequestGetInvoiceByID from '../interfaces/invoice/requestGetInvoiceByID.interface';
import ResponseGetInvoiceByID from '../interfaces/invoice/responseGetInvoiceByID.interface';

const prisma = new PrismaClient({
  log: ['query'],
});

export async function createInvoice(req: RequestCreateInvoice, res: Response): Promise<Response> {

  try {
    const schema = Joi.object({
      no_invoice: Joi.string().min(1).max(60).required().messages({
        'string.empty': `No Invoice cannot be an empty field`,
        'string.min'  : `No Invoice should have a minimum length of 1`,
        'any.required': `No Invoice is a required field`
      }),
      invoice_date: Joi.string().min(1).max(60).required().messages({
        'string.empty': `Invoice Date cannot be an empty field`,
        'string.min'  : `Invoice Date should have a minimum length of 1`,
        'any.required': `Invoice Date is a required field`
      }),
      receive_date: Joi.string().min(1).max(60).required().messages({
        'string.empty': `Receive Date cannot be an empty field`,
        'string.min'  : `Receive Date should have a minimum length of 1`,
        'any.required': `Receive Date is a required field`
      }),
      total_invoice: Joi.number().required().messages({
        'string.empty': `Total Invoice cannot be an empty field`,
        'any.required': `Total Invoice is a required field`
      }),
      count_item: Joi.number().required().messages({
        'string.empty': `Item Count cannot be an empty field`,
        'any.required': `Item Count is a required field`
      }),
      due_date: Joi.string().min(1).max(60).required().messages({
        'string.empty': `Due Date cannot be an empty field`,
        'string.min'  : `Due Date should have a minimum length of 1`,
        'any.required': `Due Date is a required field`
      }),
      status: Joi.string().required().messages({
        'string.empty': `Status cannot be an empty field`,
        'any.required': `STatus is a required field`
      }),
      total_pay: Joi.number().required().messages({
        'string.empty': `Total Pay cannot be an empty field`,
        'any.required': `Total Pay is a required field`
      }),
      distributor_uid : Joi.string().required().messages({
        'string.empty': `Distributor cannot be an empty field`,
        'any.required': `Distributor is a required field`
      }),
      detail_invoices: Joi.string().required().messages({
        'string.empty': `Detail Invoice cannot be an empty field`,
        'any.required': `Detail Invoice is a required field`
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
      no_invoice          : req.body.no_invoice.trim(),
      invoice_date        : req.body.invoice_date,
      receive_date        : req.body.receive_date,
      total_invoice       : req.body.total_invoice,
      count_item          : req.body.count_item,
      due_date            : req.body.due_date,
      status              : req.body.status,
      total_pay           : req.body.total_pay,
      distributor_uid     : req.body.distributor_uid,
      detail_invoices_json: req.body.detail_invoices,
      current_user_uid    : req.body.current_user_uid,
    }

    const checkInvoice = await prisma.invoices.findFirst({
      where: {
        AND: [
          {no_invoice: inputData.no_invoice,},
          {deleted_at: null,},
        ]
      },
    })

    if (checkInvoice) {
      const exception = new InvoiceAlreadyExistException("No Invoice already exist");
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
      
      let inputDetailInvoice: {
        no_batch        : string,
        expired_at      : string,
        count_box       : number,
        qty_box         : number,
        price_box       : number,
        total_price     : number,
        discount        : number,
        discount_nominal: number,
        ppn             : number,
        ppn_nominal     : number,
        drug_uid        : string,
      }[] = JSON.parse(inputData.detail_invoices_json);      

      await prisma.$transaction( async (prisma) => {
        let invoice = await prisma.invoices.create({
          data: {
            no_invoice   : inputData.no_invoice,
            invoice_date : inputData.invoice_date,
            receive_date : inputData.receive_date,
            total_invoice: inputData.total_invoice,
            count_item   : inputData.count_item,
            due_date     : inputData.due_date,
            status       : inputData.status,
            total_pay    : inputData.total_pay,
            distributors : {
              connect: {
                uid: inputData.distributor_uid,
              }
            },
            created_at   : moment().tz('Asia/Jakarta').format().toString(),
            updated_at   : moment().tz('Asia/Jakarta').format().toString(),
            createdby    : {
              connect: {
                id: currentUser?.id
              }
            },
            updatedby    : {
              connect: {
                id: currentUser?.id
              }
            },
          },
        });

        inputDetailInvoice.forEach( async (val) => {

          let checkStock = await prisma.stocks.findFirst({
            where: {
              drugs: {
                uid: val.drug_uid,
              }
            },
          });

          if(!checkStock) {      
            const total_qty    = (val.count_box * val.qty_box);
            const price_buy    = (Business.PPN * val.price_box) + val.price_box;
            const price        = (0.3 * price_buy)+price_buy;
            const price_manual = 0;

            checkStock = await prisma.stocks.create({
              data: {
                total_qty   : total_qty,
                price       : price,
                price_buy   : price_buy,
                price_manual: price_manual,
                drugs: {
                  connect : {
                    uid: val.drug_uid,
                  }
                },
                created_at: moment().tz('Asia/Jakarta').format().toString(),
                updated_at: moment().tz('Asia/Jakarta').format().toString(),
                createdby : {
                  connect: {
                    uid: inputData.current_user_uid,
                  }
                },
                updatedby: {
                  connect: {
                    uid: inputData.current_user_uid,
                  }
                }, 
              }
            })
          }
          else {
            const total_qty      = checkStock.total_qty + (val.count_box * val.qty_box);
            const price_buy_temp = (Business.PPN * val.price_box) + val.price_box;
            const price_buy      = ((checkStock.price_buy || 0) > price_buy_temp) ? checkStock.price_buy : price_buy_temp;
            const price          = (0.3 * (price_buy || 0)) + (price_buy || 0);
            const price_manual   = checkStock.price_manual

            await prisma.stocks.update({
              where: {
                id: checkStock.id
              },
              data: {
                total_qty : total_qty,
                price_buy : price_buy,
                price     : price,
                updated_at: moment().tz('Asia/Jakarta').format().toString(),
                updatedby : {
                  connect : {
                    id: currentUser?.id
                  }
                },
              }
            })
          }

          let detailInvoice = await prisma.detail_invoices.create({
            data: {
              no_batch        : val.no_batch,
              expired_at      : val.expired_at,
              count_box       : val.count_box,
              qty_box         : val.qty_box,
              price_box       : val.price_box,
              total_price     : val.total_price,
              discount        : val.discount,
              discount_nominal: val.discount_nominal,
              ppn             : val.ppn,
              ppn_nominal     : val.ppn_nominal,
              drugs : {
                connect: {
                  uid: val.drug_uid,
                }
              },
              invoices : {
                connect: {
                  id: invoice.id
                }
              },
              created_at: moment().tz('Asia/Jakarta').format().toString(),
              updated_at: moment().tz('Asia/Jakarta').format().toString(),
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
            }
          });

          let barcodeStock = await generateBarcodeStock();
          let totalQty     = (val.qty_box * val.count_box);

          let detailStock  = await prisma.detail_stocks.create({
            data: {
              stocks : {
                connect: {
                  id: checkStock.id,
                }
              },
              detail_invoices: {
                connect: {
                  id: detailInvoice.id,
                }
              },
              qty_pcs    : totalQty,
              qty_box    : val.count_box,
              expired_at : val.expired_at,
              no_barcode : barcodeStock,
              no_batch   : val.no_batch,
              is_initiate: false,
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
            }
          });

          let historyStock = await prisma.history_stocks.create({
            data: {
              stocks : {
                connect: {
                  id: checkStock.id,
                }
              },
              detail_invoices: {
                connect: {
                  id: detailInvoice.id,
                }
              },
              status    : 'IN',
              qty_pcs   : detailStock.qty_pcs,
              created_at: moment().tz('Asia/Jakarta').format().toString(),
              updated_at: moment().tz('Asia/Jakarta').format().toString(),
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
            }
          });
        })



      })

      const responseData = new SuccessException("Invoice created successfully")

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

export async function getInvoice(req: RequestGetInvoice, res: Response): Promise<Response> {
  try {
    const { page, size, cond, sort, field } = req.query;
    const condition                         = cond ? cond : undefined;
    const sortBy                            = sort ? sort : 'asc';
    const fieldBy                           = field ? field : 'id';
    const { limit, offset }                 = getPagination(page, size);

    const query: Prisma.invoicesFindManyArgs = {
      skip: offset,
      take: limit,
      where: {
        AND:[
          {deleted_at: null,},
          {no_invoice: {
            contains: condition
          }}
        ]
      },
      orderBy: {
        [fieldBy]: sortBy,
      },
      select: {
        uid            : true,
        no_invoice     : true,
        invoice_date   : true,
        receive_date   : true,
        total_invoice  : true,
        count_item     : true,
        due_date       : true,
        status         : true,
        total_pay      : true,
        distributors : {
          select : {
            uid : true,
            name: true,
          },
        },
        detail_invoices: {
          select : {
            uid             : true,
            no_batch        : true,
            expired_at      : true,
            count_box       : true,
            qty_box         : true,
            price_box       : true,
            total_price     : true,
            discount        : true,
            discount_nominal: true,
            ppn             : true,
            ppn_nominal     : true,
            drugs           : {
              select : {
                uid : true,
                name: true,
              },
            },
          },
        },
        transaction_invoices: {
          select: {
            uid       : true,
            pay_date  : true,
            total_pay : true,
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

    const [invoiceList, invoiceCount] = await prisma.$transaction([
      prisma.invoices.findMany(query),
      prisma.invoices.count({ where: query.where}),
    ])
    
    const invoiceData                        = getPagingData(invoiceList, invoiceCount, page, limit);
    const getInvoiceData: ResponseGetInvoice = {
      data        : invoiceData.data,
      total_data  : invoiceData.totalData,
      current_page: invoiceData.currentPage,
      total_pages : invoiceData.totalPages
    }
    
    const responseData = new SuccessException("Invoice data received", getInvoiceData)

    return res.send(responseData.getResponse)

  } catch (e: any) {
    let exception= new BasicErrorException(e.message);
    return res.status(400).send(exception.getResponse)
  }
}

export async function getInvoiceById(req: RequestGetInvoiceByID, res: Response): Promise<Response> {
  try {

    const { invoice_uid } = req.params;

    const invoice = await prisma.invoices.findFirst({
      where: {
        AND: [
          {uid: invoice_uid,},
          {deleted_at: null,},
        ]
      },
      select: {
        uid            : true,
        no_invoice     : true,
        invoice_date   : true,
        receive_date   : true,
        total_invoice  : true,
        count_item     : true,
        due_date       : true,
        status         : true,
        total_pay      : true,
        distributors : {
          select : {
            uid : true,
            name: true,
          },
        },
        detail_invoices: {
          select : {
            uid             : true,
            no_batch        : true,
            expired_at      : true,
            count_box       : true,
            qty_box         : true,
            price_box       : true,
            total_price     : true,
            discount        : true,
            discount_nominal: true,
            ppn             : true,
            ppn_nominal     : true,
            drugs           : {
              select : {
                uid : true,
                name: true,
              },
            },
          },
        },
        transaction_invoices: {
          select: {
            uid       : true,
            pay_date  : true,
            total_pay : true,
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

    if (!invoice) {
      const exception = new InvoiceNotFoundException();
      return res.status(400).send(exception.getResponse);
    }

    const getInvoiceData: ResponseGetInvoiceByID = {
      data: invoice
    }
    
    const responseData = new SuccessException("Invoice data received", getInvoiceData)

    return res.send(responseData.getResponse)

  } catch (e: any) {
    let exception= new BasicErrorException(e.message);
    return res.status(400).send(exception.getResponse)
  }
}

export async function editInvoice(req: RequestEditInvoice, res: Response): Promise<Response> {
  try {

    const { invoice_uid } = req.params;

    const schema = Joi.object({
      no_invoice: Joi.string().min(1).max(60).required().messages({
        'string.empty': `No Invoice cannot be an empty field`,
        'string.min'  : `No Invoice should have a minimum length of 1`,
        'any.required': `No Invoice is a required field`
      }),
      invoice_date: Joi.string().min(1).max(60).required().messages({
        'string.empty': `Invoice Date cannot be an empty field`,
        'string.min'  : `Invoice Date should have a minimum length of 1`,
        'any.required': `Invoice Date is a required field`
      }),
      receive_date: Joi.string().min(1).max(60).required().messages({
        'string.empty': `Receive Date cannot be an empty field`,
        'string.min'  : `Receive Date should have a minimum length of 1`,
        'any.required': `Receive Date is a required field`
      }),
      total_invoice: Joi.number().required().messages({
        'string.empty': `Total Invoice cannot be an empty field`,
        'any.required': `Total Invoice is a required field`
      }),
      count_item: Joi.number().required().messages({
        'string.empty': `Item Count cannot be an empty field`,
        'any.required': `Item Count is a required field`
      }),
      due_date: Joi.string().min(1).max(60).required().messages({
        'string.empty': `Due Date cannot be an empty field`,
        'string.min'  : `Due Date should have a minimum length of 1`,
        'any.required': `Due Date is a required field`
      }),
      status: Joi.string().required().messages({
        'string.empty': `Status cannot be an empty field`,
        'any.required': `STatus is a required field`
      }),
      total_pay: Joi.number().required().messages({
        'string.empty': `Total Pay cannot be an empty field`,
        'any.required': `Total Pay is a required field`
      }),
      distributor_uid : Joi.string().required().messages({
        'string.empty': `Distributor cannot be an empty field`,
        'any.required': `Distributor is a required field`
      }),
      // detail_invoices: Joi.string().required().messages({
      //   'string.empty': `Detail Invoice cannot be an empty field`,
      //   'any.required': `Detail Invoice is a required field`
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
      no_invoice          : req.body.no_invoice.trim(),
      invoice_date        : req.body.invoice_date,
      receive_date        : req.body.receive_date,
      total_invoice       : req.body.total_invoice,
      count_item          : req.body.count_item,
      due_date            : req.body.due_date,
      status              : req.body.status,
      total_pay           : req.body.total_pay,
      distributor_uid     : req.body.distributor_uid,
      // detail_invoices_json: req.body.detail_invoices,
      current_user_uid    : req.body.current_user_uid,
    }
    
    const checkInvoice = await prisma.invoices.findFirst({
      where: {
        AND: [
          {uid: invoice_uid},
          {deleted_at: null,},
        ]
      },
      select: {
        uid       : true,
        no_invoice: true,
      }
    })

    if(checkInvoice?.no_invoice != editData.no_invoice) {
      const checkNoInvoice = await prisma.invoices.findFirst({
        where: {
          AND: [
            {no_invoice: editData.no_invoice,},
            {deleted_at: null,},
          ]
        },
      })

      if (checkNoInvoice) {
        const exception = new InvoiceAlreadyExistException("No Invoice already exist");
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

      // let editDetailInvoice: {
      //   detail_invoice_uid: string,
      //   no_batch          : string,
      //   expired_at        : string,
      //   count_box         : number,
      //   qty_box           : number,
      //   price_box         : number,
      //   total_price       : number,
      //   discount          : number,
      //   discount_nominal  : number,
      //   ppn               : number,
      //   ppn_nominal       : number,
      //   drug_uid          : string,
      // }[] = JSON.parse(editData.detail_invoices_json);

      await prisma.$transaction( async (prisma) => {
        
        let invoice = await prisma.invoices.update({
          where: {
            uid: invoice_uid,
          },
          data: {
            no_invoice   : editData.no_invoice,
            invoice_date : editData.invoice_date,
            receive_date : editData.receive_date,
            total_invoice: editData.total_invoice,
            count_item   : editData.count_item,
            due_date     : editData.due_date,
            status       : editData.status,
            total_pay    : editData.total_pay,
            distributors : {
              connect: {
                uid: editData.distributor_uid,
              }
            },
            updated_at : moment().tz('Asia/Jakarta').format().toString(),
            updatedby  : {
              connect : {
                id: currentUser?.id
              }
            },
          },
        });

        // update invoice detail
        // editDetailInvoice.forEach( async (val) => {
        //   await prisma.detail_invoices.update({
        //     where : {
        //       uid: val.detail_invoice_uid,
        //     },
        //     data: {
        //       no_batch        : val.no_batch,
        //       expired_at      : val.expired_at,
        //       count_box       : val.count_box,
        //       qty_box         : val.qty_box,
        //       price_box       : val.price_box,
        //       total_price     : val.total_price,
        //       discount        : val.discount,
        //       discount_nominal: val.discount_nominal,
        //       ppn             : val.ppn,
        //       ppn_nominal     : val.ppn_nominal,
        //       drugs : {
        //         connect: {
        //           uid: val.drug_uid,
        //         }
        //       },
        //       invoices : {
        //         connect: {
        //           id: invoice.id
        //         }
        //       },
        //       updated_at : moment().tz('Asia/Jakarta').format().toString(),
        //       updatedby  : {
        //         connect : {
        //           id: currentUser?.id
        //         }
        //       },
        //     }
        //   })
        // })
      })

      const responseData = new SuccessException("Invoice edited successfully")

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

export async function deleteInvoice(req: RequestDeleteInvoice, res: Response): Promise<Response> {
  try {
    
    const { invoice_uid } = req.params;
    const deleteData      = req.body;
    
    const checkInvoice = await prisma.invoices.findFirst({
      where: {
        AND: [
          {uid: invoice_uid},
          {deleted_at: null,},
        ]
      },
      include:{
        detail_invoices:{
          include: {
            detail_stocks: true,
          }
        }
      }
    })

    if (!checkInvoice) {
      const exception = new InvoiceNotFoundException();
      return res.status(400).send(exception.getResponse);
    }

    checkInvoice.detail_invoices.forEach( async (val) => {

      const checkDetailStock = await prisma.detail_stocks.findFirst({
        where: {
          detail_invoice_id: val.id
        }
      });

      if(!checkDetailStock){
        const exception = new StockNotFoundException();
        return res.status(400).send(exception.getResponse); 
      }
      else {
        if(checkDetailStock.qty_pcs>0){
          const exception = new StockStillExistException();
          return res.status(400).send(exception.getResponse); 
        }
      }
    })
    
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


        const invoice = await prisma.invoices.update({
          where: {
            uid: invoice_uid
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

        const detailInvoice = await prisma.detail_invoices.updateMany({
          where: {
            invoice_id: invoice.id,
          },
          data: {
            updated_at: moment().tz('Asia/Jakarta').format().toString(),
            deleted_at: moment().tz('Asia/Jakarta').format().toString(),
            updated_by: currentUser?.id,
            deleted_by: currentUser?.id,
          }
        })

        checkInvoice.detail_invoices.forEach( async (val) => {
          let historyStock = await prisma.history_stocks.create({
            data: {
              stocks : {
                connect: {
                  id: val.detail_stocks?.stock_id,
                }
              },
              detail_invoices: {
                connect: {
                  id: val.id
                }
              },
              status           : 'DELETED',
              qty_pcs          : (val.count_box * val.qty_box),
              created_at       : moment().tz('Asia/Jakarta').format().toString(),
              updated_at       : moment().tz('Asia/Jakarta').format().toString(),
              createdby        : {
                connect: {
                  id: currentUser?.id
                }
              },
              updatedby : {
                connect: {
                  id: currentUser?.id
                }
              },
            }
          });
        });
      })
      
      const responseData = new SuccessException("Invoice deleted successfully")

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

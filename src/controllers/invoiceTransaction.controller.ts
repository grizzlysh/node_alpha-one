import moment from 'moment-timezone';
import Joi from 'joi';
import { Response } from "express";
import { PrismaClient, Prisma } from '@prisma/client';

import SuccessException from '../exceptions/200_success.exception';
import BasicErrorException from '../exceptions/700_basicError.exception';
import InvalidInputException from '../exceptions/701_invalidInput.exception';
import InvoiceNotFoundException from '../exceptions/723_invoiceNotFound.exception';
import InvoiceAlreadyPaidException from '../exceptions/724_invoiceAlreadyPaid.exception';
import TransactionInvoiceNotFoundException from '../exceptions/725_transactionInvoiceNotFound.exception';

import RequestCreateTransactionInvoice from '../interfaces/invoiceTransaction/requestCreateTransactionInvoice.interface';
import RequestGetTransactionInvoiceByID from '../interfaces/invoiceTransaction/requestGetTransactionInvoiceByID.interface';
import ResponseGetTransactionInvoiceByID from '../interfaces/invoiceTransaction/responseGetTransactionInvoiceByID.interface';
import RequestDeleteTransactionInvoice from '../interfaces/invoiceTransaction/requestDeleteTransactionInvoice.interface';

const prisma = new PrismaClient({
  log: ['query'],
});

export async function createTransactionInvoice(req: RequestCreateTransactionInvoice, res: Response): Promise<Response> {
  try {

    const { invoice_uid } = req.params;

    const schema = Joi.object({
      pay_date: Joi.string().min(1).max(60).required().messages({
        'string.empty': `Pay Date cannot be an empty field`,
        'string.min'  : `Pay Date should have a minimum length of 1`,
        'any.required': `Pay Date is a required field`
      }),
      total_pay: Joi.number().required().messages({
        'string.empty': `Total Pay cannot be an empty field`,
        'any.required': `Total Pay is a required field`
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

    const payData = {
      pay_date        : req.body.pay_date,
      total_pay       : req.body.total_pay,
      current_user_uid: req.body.current_user_uid,
    }
    
    const checkInvoice = await prisma.invoices.findFirst({
      where: {
        AND: [
          {uid: invoice_uid},
          {deleted_at: null,},
        ]
      },
      select: {
        uid                 : true,
        status              : true,
        total_invoice       : true,
        total_pay           : true,
        transaction_invoices: {
          select: {
            total_pay: true,
          }
        }
      }
    })

    if(checkInvoice?.status == 'LUNAS') {
      const exception = new InvoiceAlreadyPaidException();
      return res.status(400).send(exception.getResponse);
    }

    const currentUser = await prisma.users.findFirst({
      where: {
        AND: [
          {uid: payData.current_user_uid,},
          {deleted_at: null,},
        ]
      },
    })

    try {

      let totalPayment = (checkInvoice?.total_pay || 0) + payData.total_pay

      await prisma.$transaction( async (prisma) => {
        
        let transaction_invoices= await prisma.transaction_invoices.create({
          data: {
            // invoice_id: checkInvoice?.uid,
            invoices: {
              connect: {
                uid: invoice_uid,
              }
            },
            pay_date  : payData.pay_date,
            total_pay : payData.total_pay,
            created_at: moment().tz('Asia/Jakarta').format().toString(),
            updated_at: moment().tz('Asia/Jakarta').format().toString(),
            createdby : {
              connect: {
                uid: payData.current_user_uid,
              }
            },
            updatedby    : {
              connect: {
                uid: payData.current_user_uid,
              }
            },
          }
        })

        let invoice = await prisma.invoices.update({
          where: {
            uid: invoice_uid,
          },
          data: {
            total_pay : totalPayment,
            updated_at: moment().tz('Asia/Jakarta').format().toString(),
            updatedby : {
              connect : {
                id: currentUser?.id
              }
            },
          },
        });
      })

      const responseData = new SuccessException("Invoice paid successfully")

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


export async function getTransactionInvoiceById(req: RequestGetTransactionInvoiceByID, res: Response): Promise<Response> {
  try {

    const { invoice_uid } = req.params;

    const transaction_invoices = await prisma.invoices.findFirst({
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

    if (!transaction_invoices) {
      const exception = new InvoiceNotFoundException();
      return res.status(400).send(exception.getResponse);
    }

    const getTransactionInvoiceData: ResponseGetTransactionInvoiceByID = {
      data: transaction_invoices
    }
    
    const responseData = new SuccessException("Transaction Invoice data received", getTransactionInvoiceData)

    return res.send(responseData.getResponse)

  } catch (e: any) {
    let exception= new BasicErrorException(e.message);
    return res.status(400).send(exception.getResponse)
  }
}


export async function deleteTransactionInvoice(req: RequestDeleteTransactionInvoice, res: Response): Promise<Response> {
  try {
    
    const { transaction_invoice_uid } = req.params;
    const deleteData                  = req.body;
    
    const checkInvoice = await prisma.transaction_invoices.findFirst({
      where: {
        AND: [
          {uid: transaction_invoice_uid},
          {deleted_at: null,},
        ]
      },
      include: {
        invoices: true,
      }
    })

    if (!checkInvoice) {
      const exception = new TransactionInvoiceNotFoundException();
      return res.status(400).send(exception.getResponse);
    }


    if(!checkInvoice.invoices.deleted_at){
      const exception = new InvoiceNotFoundException();
      return res.status(400).send(exception.getResponse); 
    }
    
    const currentUser = await prisma.users.findFirst({
      where: {
        AND: [
          {uid: deleteData.current_user_uid,},
          {deleted_at: null,},
        ]
      },
    });

    const updatedPay = checkInvoice.invoices.total_pay - checkInvoice.total_pay;

    try {

      await prisma.$transaction( async (prisma) => {

        const transaction_invoice = await prisma.transaction_invoices.update({
          where: {
            uid: transaction_invoice_uid
          },
          data: {
            updated_at: moment().tz('Asia/Jakarta').format().toString(),
            deleted_at: moment().tz('Asia/Jakarta').format().toString(),
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

        const invoice = await prisma.invoices.update({
          where: {
            uid: checkInvoice.invoices.uid
          },
          data: {
            total_pay : updatedPay,
            updated_at: moment().tz('Asia/Jakarta').format().toString(),
            deleted_at: moment().tz('Asia/Jakarta').format().toString(),
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

      })
      
      const responseData = new SuccessException("Transaction Invoice deleted successfully")

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

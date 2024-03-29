import { PrismaClient, Prisma } from '@prisma/client';
import moment from 'moment';

const prisma = new PrismaClient({
  log: ['query'],
});

export const generateBarcodeStock = async () => {

  const currentDate     = moment().tz('Asia/Jakarta').format('YYYYMMDD').toString();
  const noBarcodeInit   = 'S'+currentDate+'00';
  const latestNoBarcode = await prisma.detail_stocks.findFirst({
    where: {
      no_barcode: {
        startsWith: noBarcodeInit
      }
    },
    orderBy: {
      no_barcode: 'desc',
    }
  })

  let newBarcode = noBarcodeInit;
  if(latestNoBarcode) {
    let noBarcode  = parseInt(latestNoBarcode.no_barcode.slice(1,-1))+1
        newBarcode = 'S'+noBarcode;
  }
  else {
    newBarcode = newBarcode+'1';
  }

  return newBarcode;
};


export const generateBarcodeFormula = async () => {

  const currentDate     = moment().tz('Asia/Jakarta').format('YYYYMMDD').toString();
  const noBarcodeInit   = 'F'+currentDate+'00';
  const latestNoBarcode = await prisma.formulas.findFirst({
    where: {
      no_barcode: {
        startsWith: noBarcodeInit
      }
    },
    orderBy: {
      no_barcode: 'desc',
    }
  })

  let newBarcode = noBarcodeInit;
  if(latestNoBarcode) {
    let noBarcode  = parseInt(latestNoBarcode.no_barcode.slice(1,-1))+1
        newBarcode = 'S'+noBarcode;
  }
  else {
    newBarcode = newBarcode+'1';
  }

  return newBarcode;
};
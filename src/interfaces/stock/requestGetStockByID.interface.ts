import { Request } from "express";

interface RequestGetStockByID extends Request {
  params: {
    stock_uid: string,
  },
}

export default RequestGetStockByID;
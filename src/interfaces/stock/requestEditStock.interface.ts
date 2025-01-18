import { Request } from "express";

interface RequestEditStock extends Request {
  params: {
    stock_uid: string,
  },
  body  : {
    price_manual    : number,
    current_user_uid: string,
  }
}

export default RequestEditStock;
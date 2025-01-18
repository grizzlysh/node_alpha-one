import { Request } from "express";

interface RequestDeleteStock extends Request {
  params: {
    stock_uid: string,
  },
  body  : {
    current_user_uid: string,
  }
}

export default RequestDeleteStock;
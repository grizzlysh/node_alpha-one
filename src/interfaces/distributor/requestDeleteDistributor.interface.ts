import { Request } from "express";

interface RequestDeleteDistributor extends Request {
  params: {
    distributor_uid: string,
  },
  body  : {
    current_user_uid: string,
  }
}

export default RequestDeleteDistributor;
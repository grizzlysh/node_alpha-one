import { Request } from "express";

interface RequestDeleteType extends Request {
  params: {
    type_uid: string,
  },
  body  : {
    current_user_uid: string,
  }
}

export default RequestDeleteType;
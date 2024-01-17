import { Request } from "express";

interface RequestDeleteShape extends Request {
  params: {
    shape_uid: string,
  },
  body  : {
    current_user_uid: string,
  }
}

export default RequestDeleteShape;
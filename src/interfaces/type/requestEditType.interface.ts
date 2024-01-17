import { Request } from "express";

interface RequestEditType extends Request {
  params: {
    type_uid: string,
  },
  body  : {
    name            : string,
    current_user_uid: string,
  }
}

export default RequestEditType;
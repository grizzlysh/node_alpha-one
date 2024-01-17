import { Request } from "express";

interface RequestEditShape extends Request {
  params: {
    shape_uid: string,
  },
  body  : {
    name            : string,
    current_user_uid: string,
  }
}

export default RequestEditShape;
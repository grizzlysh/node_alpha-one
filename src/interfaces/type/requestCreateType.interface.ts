import { Request } from "express";

interface RequestCreateType extends Request {
  body: {
    name            : string,
    current_user_uid: string,
  }
}

export default RequestCreateType;
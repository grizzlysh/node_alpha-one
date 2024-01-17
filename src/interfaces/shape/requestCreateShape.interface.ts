import { Request } from "express";

interface RequestCreateShape extends Request {
  body: {
    name            : string,
    current_user_uid: string,
  }
}

export default RequestCreateShape;
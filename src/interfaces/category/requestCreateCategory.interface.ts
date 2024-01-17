import { Request } from "express";

interface RequestCreateCategory extends Request {
  body: {
    name            : string,
    current_user_uid: string,
  }
}

export default RequestCreateCategory;
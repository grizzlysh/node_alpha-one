import { Request } from "express";

interface RequestEditCategory extends Request {
  params: {
    category_uid: string,
  },
  body  : {
    name            : string,
    current_user_uid: string,
  }
}

export default RequestEditCategory;
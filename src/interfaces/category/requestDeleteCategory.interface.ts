import { Request } from "express";

interface RequestDeleteCategory extends Request {
  params: {
    category_uid: string,
  },
  body  : {
    current_user_uid: string,
  }
}

export default RequestDeleteCategory;
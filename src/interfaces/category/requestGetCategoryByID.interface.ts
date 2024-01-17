import { Request } from "express";

interface RequestGetCategoryByID extends Request {
  params: {
    category_uid: string,
  },
}

export default RequestGetCategoryByID;
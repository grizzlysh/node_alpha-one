import { Request } from "express";

interface RequestCreateDrug extends Request {
  body: {
    name              : string,
    shape_uid         : string,
    category_uid      : string,
    therapy_class_uid : string,
    description       : string,
    status            : string,
    current_user_uid  : string,
  }
}

export default RequestCreateDrug;
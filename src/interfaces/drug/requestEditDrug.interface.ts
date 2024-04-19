import { Request } from "express";

interface RequestEditDrug extends Request {
  params: {
    drug_uid: string,
  },
  body  : {
    name              : string,
    shape_uid         : string,
    category_uid      : string,
    therapy_class_uid : string,
    description       : string,
    status            : boolean,
    current_user_uid  : string,
  }
}

export default RequestEditDrug;
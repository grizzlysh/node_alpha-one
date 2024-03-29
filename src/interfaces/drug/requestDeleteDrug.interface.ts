import { Request } from "express";

interface RequestDeleteDrug extends Request {
  params: {
    drug_uid: string,
  },
  body  : {
    current_user_uid: string,
  }
}

export default RequestDeleteDrug;
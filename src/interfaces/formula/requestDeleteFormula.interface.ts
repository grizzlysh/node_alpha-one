import { Request } from "express";

interface RequestDeleteFormula extends Request {
  params: {
    formula_uid: string,
  },
  body  : {
    current_user_uid: string,
  }
}

export default RequestDeleteFormula;
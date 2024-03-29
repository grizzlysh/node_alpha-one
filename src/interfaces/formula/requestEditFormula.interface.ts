import { Request } from "express";

interface RequestEditFormula extends Request {
  params: {
    formula_uid: string,
  },
  body  : {
    name            : string,
    price           : number,
    status          : string,
    description     : string,
    // detail_formulas : string,
    current_user_uid: string,
  }
}

export default RequestEditFormula;
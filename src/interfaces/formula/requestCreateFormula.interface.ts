import { Request } from "express";

interface RequestCreateFormula extends Request {
  body: {
    name            : string,
    price           : number,
    status          : boolean,
    description     : string,
    detail_formulas : string,
    current_user_uid: string,
  }
}

export default RequestCreateFormula;
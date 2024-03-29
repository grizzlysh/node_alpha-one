import { Request } from "express";

interface RequestGetFormulaByID extends Request {
  params: {
    formula_uid: string,
  },
}

export default RequestGetFormulaByID;
import { Request } from "express";

interface RequestGetDrugByID extends Request {
  params: {
    drug_uid: string,
  },
}

export default RequestGetDrugByID;
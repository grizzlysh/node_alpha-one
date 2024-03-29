import { Request } from "express";

interface RequestGetDistributorByID extends Request {
  params: {
    distributor_uid: string,
  },
}

export default RequestGetDistributorByID;
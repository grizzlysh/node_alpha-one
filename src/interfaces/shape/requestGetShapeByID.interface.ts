import { Request } from "express";

interface RequestGetShapeByID extends Request {
  params: {
    shape_uid: string,
  },
}

export default RequestGetShapeByID;
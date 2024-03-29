import { Request } from "express";

interface RequestGetTherapyClassByID extends Request {
  params: {
    therapy_class_uid: string,
  },
}

export default RequestGetTherapyClassByID;
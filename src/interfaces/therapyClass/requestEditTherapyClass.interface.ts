import { Request } from "express";

interface RequestEditTherapyClass extends Request {
  params: {
    therapy_class_uid: string,
  },
  body  : {
    name            : string,
    current_user_uid: string,
  }
}

export default RequestEditTherapyClass;
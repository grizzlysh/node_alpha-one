import { Request } from "express";

interface RequestDeleteTherapyClass extends Request {
  params: {
    therapy_class_uid: string,
  },
  body  : {
    current_user_uid: string,
  }
}

export default RequestDeleteTherapyClass;
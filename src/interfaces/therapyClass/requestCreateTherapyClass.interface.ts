import { Request } from "express";

interface RequestCreateTherapyClass extends Request {
  body: {
    name            : string,
    current_user_uid: string,
  }
}

export default RequestCreateTherapyClass;
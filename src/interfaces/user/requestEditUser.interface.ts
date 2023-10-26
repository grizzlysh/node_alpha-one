import { Request } from "express";

interface RequestEditUser extends Request {
  params: {
    user_uid: string,
  },
  body  : {
    username        : string,
    name            : string,
    sex             : string,
    email           : string,
    password        : string,
    current_user_uid: string,
    role_uid        : string
  }
}

export default RequestEditUser;
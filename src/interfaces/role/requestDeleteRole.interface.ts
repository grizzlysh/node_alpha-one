import { Request } from "express";

interface RequestDeleteRole extends Request {
  params: {
    role_uid: string,
  },
  body  : {
    current_user_uid: string,
  }
}

export default RequestDeleteRole;
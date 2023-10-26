import { Request } from "express";

interface RequestDeleteUser extends Request {
  params: {
    user_uid: string,
  },
  body  : {
    current_user_uid: string,
  }
}

export default RequestDeleteUser;
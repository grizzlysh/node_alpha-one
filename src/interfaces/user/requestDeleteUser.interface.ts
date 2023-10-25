import { Request } from "express";

interface RequestDeleteUser extends Request {
  params: {
    username: string,
  },
  body  : {
    current_user_uid: string,
  }
}

export default RequestDeleteUser;
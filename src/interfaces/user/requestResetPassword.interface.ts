import { Request } from "express";

interface RequestResetPassword extends Request {
  params: {
    user_uid: string,
  },
  body  : {
    password        : string,
    repassword      : string,
    current_user_uid: string,
  }
}

export default RequestResetPassword;
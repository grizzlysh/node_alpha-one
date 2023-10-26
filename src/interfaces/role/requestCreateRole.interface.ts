import { Request } from "express";

interface RequestCreateRole extends Request {
  body: {
    display_name    : string,
    description     : string,
    permission      : string,
    current_user_uid: string,
  }
}

export default RequestCreateRole;
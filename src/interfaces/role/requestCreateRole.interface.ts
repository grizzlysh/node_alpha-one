import { Request } from "express";

interface RequestCreateRole extends Request {
  body: {
    display_name    : string,
    description     : string,
    current_user_uid: string,
    permissions     : string
  }
}

export default RequestCreateRole;
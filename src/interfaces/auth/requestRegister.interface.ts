import { Request } from "express";
interface RequestRegister extends Request {
  body: {
    username   : string,
    name       : string,
    sex        : string,
    email      : string,
    password   : string,
  }
}

export default RequestRegister;
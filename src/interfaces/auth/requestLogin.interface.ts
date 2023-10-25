import { Request } from "express";

interface RequestLogin extends Request {
  body: {
    username: string,
    password: string,
  }
}

export default RequestLogin;
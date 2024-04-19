import { Request } from "express";

interface RequestCreateDistributor extends Request {
  body: {
    name            : string,
    address         : string,
    phone           : string,
    no_permit       : string,
    contact_person  : string,
    status          : boolean,
    description     : string,
    current_user_uid: string,
  }
}

export default RequestCreateDistributor;
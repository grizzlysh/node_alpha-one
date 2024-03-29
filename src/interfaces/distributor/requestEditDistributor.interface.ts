import { Request } from "express";

interface RequestEditDistributor extends Request {
  params: {
    distributor_uid: string,
  },
  body  : {
    name            : string,
    address         : string,
    phone           : string,
    no_permit       : string,
    contact_person  : string,
    status          : string,
    description     : string,
    current_user_uid: string,
  }
}

export default RequestEditDistributor;
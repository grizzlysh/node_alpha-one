
export default interface Distributor{
    uid           : string,
    name          : string,
    address       : string,
    phone         : string,
    no_permit     : string,
    contact_person: string,
    status        : boolean,
    description   : string | null,
    created_at    : Date | null,
    updated_at    : Date | null,
    deleted_at    : Date | null,
    createdby     : { name: string, } | null,
    updatedby     : { name: string, } | null,
    deletedby     : { name: string, } | null,
  }
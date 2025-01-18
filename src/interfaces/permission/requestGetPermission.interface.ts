import { Request } from "express";
import { sortPage } from "../../utils/pagination.util";

interface RequestGetPermission extends Request{
  query: {
    page : string,
    size : string,
    cond : string,
    sort : sortPage,
    field: string,
  }
}

export default RequestGetPermission;
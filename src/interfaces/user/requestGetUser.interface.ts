import { Query } from "express-serve-static-core"

interface RequestGetUserType<Q extends Query> extends Express.Request {
  query: Q
}

interface RequestGetUser extends RequestGetUserType<{
  asda: string,
  page: string,
  size: string,
  cond: string
}>{

}

export default RequestGetUser;
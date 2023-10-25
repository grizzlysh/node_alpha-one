import { Params } from "express-serve-static-core"

interface RequestGetUserByIDType<P extends Params> extends Express.Request {
  params: P
}

interface RequestGetUserByID extends RequestGetUserByIDType<{
  username: string
}>{

}

export default RequestGetUserByID;
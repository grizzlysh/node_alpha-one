
export default interface Shape {
  uid         : string,
  name        : string,
  created_at  : Date | null,
  updated_at  : Date | null,
  deleted_at  : Date | null,
  createdby   : { name: string, } | null,
  updatedby   : { name: string, } | null,
  deletedby   : { name: string, } | null,
}
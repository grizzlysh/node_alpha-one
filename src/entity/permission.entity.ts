
export default interface Permission {
  uid         : string,
  name        : string,
  display_name: string,
  description : string | null,
  created_at  : Date | null,
  updated_at  : Date | null,
  deleted_at  : Date | null,
  createdby   : { name: string, } | null,
  updatedby   : { name: string, } | null,
  deletedby   : { name: string, } | null,
}
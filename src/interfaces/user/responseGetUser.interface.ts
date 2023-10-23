
interface UserData{
  uid              : string,
  username         : string,
  name             : string,
  sex              : string,
  email            : string,
  email_verified_at: Date | null,
  created_at       : Date | null,
  updated_at       : Date | null,
  deleted_at       : Date | null,
  createdby        : { name: string, } | null
  updatedby        : { name: string, } | null
  deletedby        : { name: string, } | null
  // role?             : IRole[]
}

interface ResponseGetUser {
  data: UserData[]
}

export default ResponseGetUser;
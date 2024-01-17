
export default interface UserOnline{
  uid       : string,
  username  : string,
  name      : string,
  sex       : string,
  email     : string,
  created_at: string,
  role      : {
    uid            : string,
    name           : string,
    display_name   : string,
    permission_role: {
      permissions: {
        uid         : string,
        name        : string,
        display_name: string,
      },
      delete_permit: boolean,
      read_permit  : boolean,
      write_permit : boolean,
      modify_permit: boolean,
    }[]
  },
}

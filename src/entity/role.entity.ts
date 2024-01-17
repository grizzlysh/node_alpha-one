import Permission from "./permission.entity";

export default interface Role{
    uid         : string,
    name        : string,
    display_name: string,
    description : string | null,
    permission_role: {
      permissions: {
          name        : string;
          uid         : string;
          display_name: string;
      };
    }[]
    created_at  : Date | null,
    updated_at  : Date | null,
    deleted_at  : Date | null,
    createdby   : { name: string, } | null,
    updatedby   : { name: string, } | null,
    deletedby   : { name: string, } | null,
  }
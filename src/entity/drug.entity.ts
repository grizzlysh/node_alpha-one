
export default interface Drug{
    uid        : string,
    name       : string,
    description: string | null,
    status     : boolean,
    shapes     : {
      name: string;
      uid : string;
    },
    categories      : {
      name: string;
      uid : string;
    }
    therapy_classes : {
      name: string;
      uid : string;
    }
    created_at: Date | null,
    updated_at: Date | null,
    deleted_at: Date | null,
    createdby : { name: string, } | null,
    updatedby : { name: string, } | null,
    deletedby : { name: string, } | null,
  }
import Role from "../../entity/role.entity";

interface ResponseGetRole {
  data        : Role[]
  total_data  : number,
  total_pages : number,
  current_page: number,
}

export default ResponseGetRole;
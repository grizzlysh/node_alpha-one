import RoleData from "../../entity/roleData.entity";

interface ResponseGetRole {
  data        : RoleData[]
  total_data  : number,
  total_pages : number,
  current_page: number
}

export default ResponseGetRole;
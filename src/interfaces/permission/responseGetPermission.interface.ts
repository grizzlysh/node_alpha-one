import Permission from "../../entity/permission.entity";

interface ResponseGetPermission {
  data        : Permission[],
  total_data  : number,
  total_pages : number,
  current_page: number
}

export default ResponseGetPermission;
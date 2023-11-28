import PermissionData from "../../entity/permissionData.entity";

interface ResponseGetPermission {
  data        : PermissionData[],
  total_data  : number,
  total_pages : number,
  current_page: number
}

export default ResponseGetPermission;
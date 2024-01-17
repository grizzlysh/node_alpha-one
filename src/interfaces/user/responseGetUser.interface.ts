import User from "../../entity/user.entity";

interface ResponseGetUser {
  data        : User[],
  total_data  : number,
  total_pages : number,
  current_page: number
}

export default ResponseGetUser;
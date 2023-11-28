import UserData from "../../entity/userData.entity";

interface ResponseGetUser {
  data        : UserData[],
  total_data  : number,
  total_pages : number,
  current_page: number
}

export default ResponseGetUser;
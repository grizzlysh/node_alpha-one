import UserOnline from "../../entity/userOnline.entity";

interface ResponseLogin {
  user        : UserOnline,
  access_token : string,
  refresh_token: string,
}

export default ResponseLogin;
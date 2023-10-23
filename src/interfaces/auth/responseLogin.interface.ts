import UserOnline from "../../entity/userOnline.entity";

interface ResponseLogin {
  user        : UserOnline,
  accessToken : string,
  refreshToken: string,
}

export default ResponseLogin;
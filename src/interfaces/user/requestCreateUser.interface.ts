
interface RequestCreateUser extends Express.Request {
  body: {
    username        : string,
    name            : string,
    sex             : string,
    email           : string,
    password        : string,
    current_user_uid: string,
    role_uid        : string
  }
}

export default RequestCreateUser;
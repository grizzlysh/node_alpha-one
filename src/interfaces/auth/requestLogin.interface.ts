
interface RequestLogin extends Express.Request {
  body: {
    username: string,
    password: string,
  }
}

export default RequestLogin;

interface RequestRegister extends Express.Request {
  body: {
    username   : string,
    name       : string,
    sex        : string,
    email      : string,
    password   : string,
  }
}

export default RequestRegister;
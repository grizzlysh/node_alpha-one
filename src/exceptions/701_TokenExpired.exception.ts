import HttpException from "../interfaces/httpException.interface"

class UserNotFoundException implements HttpException {
  status : number;
  message: string = 'User not found';

  constructor(message: string) {
    this.status  = 701;
    this.message = message;
  }
}

export default UserNotFoundException;
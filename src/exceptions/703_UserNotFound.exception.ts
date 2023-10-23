import HttpException from "../interfaces/httpException.interface"

class UserNotFoundException implements HttpException {
  status : number;
  message: string = 'I\'ts not found';

  constructor(message: string) {
    this.status  = 703;
    this.message = message;
  }
}

export default UserNotFoundException;
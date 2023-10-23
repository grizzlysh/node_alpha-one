import HttpException from "../interfaces/httpException.interface"

class UserAlreadyExistException implements HttpException {
  status : number;
  message: string = 'User Already Exist';

  constructor(message?: string) {
    this.status  = 702;
    this.message = message || 'User Already Exist';
  }
}

export default UserAlreadyExistException;
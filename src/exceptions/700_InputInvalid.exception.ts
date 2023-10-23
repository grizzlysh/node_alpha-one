import HttpException from "../interfaces/httpException.interface"

class InputInvalidException implements HttpException {
  status : number;
  message: string = 'Something goes wrong, please try again.';

  constructor(message: string) {
    this.status  = 700;
    this.message = message;
  }
}

export default InputInvalidException;
import HttpException from "../interfaces/httpException.interface"
import ResponseService from "../interfaces/responseService.interface";

class UserAlreadyExistException implements HttpException {
  status : number;
  message: string;

  constructor(inputMessage?: string) {
    this.status  = 704;
    this.message = inputMessage ? inputMessage : "User Already Exist";
  }

  get getResponse() {
    let responseData: ResponseService = {
      status_schema: {
        status_code: this.status,
        status_message: this.message,
      },
      output_schema: {}
    }

    return responseData;
  }
}

export default UserAlreadyExistException;


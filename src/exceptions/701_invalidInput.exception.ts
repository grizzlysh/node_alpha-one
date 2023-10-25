import HttpException from "../interfaces/httpException.interface"
import ResponseService from "../interfaces/responseService.interface";

class InvalidInputException implements HttpException {
  status : number;
  message: string;

  constructor(inputMessage?: string) {
    this.status  = 701;
    this.message = inputMessage ? inputMessage : "Invalid Credentials";
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

export default InvalidInputException;


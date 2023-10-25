import HttpException from "../interfaces/httpException.interface"
import ResponseService from "../interfaces/responseService.interface";

class BasicErrorException implements HttpException {
  status : number;
  message: string;

  constructor(inputMessage?: string) {
    this.status  = 700;
    this.message = inputMessage ? inputMessage : "Something went wrong, please try again";
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

export default BasicErrorException;


import HttpException from "../interfaces/httpException.interface"
import ResponseService from "../interfaces/responseService.interface";

class ShapeAlreadyExistException implements HttpException {
  status : number;
  message: string;

  constructor(inputMessage?: string) {
    this.status  = 710;
    this.message = inputMessage ? inputMessage : "Shape already exist";
  }

  get getResponse() {
    let responseData: ResponseService = {
      status_schema: {
        status_code   : this.status,
        status_message: this.message,
      },
      output_schema: {}
    }

    return responseData;
  }
}

export default ShapeAlreadyExistException;


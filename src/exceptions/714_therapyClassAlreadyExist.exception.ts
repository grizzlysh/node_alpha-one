import HttpException from "../interfaces/httpException.interface"
import ResponseService from "../interfaces/responseService.interface";

class TherapyClassAlreadyExistException implements HttpException {
  status : number;
  message: string;

  constructor(inputMessage?: string) {
    this.status  = 714;
    this.message = inputMessage ? inputMessage : "Therapy Class already exist";
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

export default TherapyClassAlreadyExistException;


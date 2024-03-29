import HttpException from "../interfaces/httpException.interface"
import ResponseService from "../interfaces/responseService.interface";

class TherapyClassNotFoundException implements HttpException {
  status : number;
  message: string;

  constructor(inputMessage?: string) {
    this.status  = 715;
    this.message = inputMessage ? inputMessage : "Therapy Class not found";
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

export default TherapyClassNotFoundException;


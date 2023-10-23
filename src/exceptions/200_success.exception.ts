import HttpException from "../interfaces/httpException.interface"
import ResponseService from "../interfaces/responseService.interface";

class SuccessException implements HttpException {
  status : number;
  message: string = "Success";
  data?   : any;

  constructor(message?: string | null, data?: any) {
    this.status  = 0;
    this.message = message || this.message;
    this.data    = data || {};
  }

  get getResponse() {
    let responseData: ResponseService = {
      status_schema: {
        status_code: this.status,
        status_message: this.message,
      },
      output_schema: this.data
    }

    return responseData;
  }
}

export default SuccessException;


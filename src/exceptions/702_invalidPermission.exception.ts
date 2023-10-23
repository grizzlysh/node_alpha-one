import HttpException from "../interfaces/httpException.interface"
import ResponseService from "../interfaces/responseService.interface";

class InvalidPermissionException implements HttpException {
  status : number;
  message: string;

  constructor(inputMessage?: string) {
    this.status  = 702;
    this.message = inputMessage ? inputMessage : "No Permission";
  }

  get getResponse() {
    let responseData: ResponseService = {
      status_schema: {
        status_code: this.status,
        status_message: this.message,
      }
    }

    return responseData;
  }
}

export default InvalidPermissionException;


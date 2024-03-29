import HttpException from "../interfaces/httpException.interface"
import ResponseService from "../interfaces/responseService.interface";

class CategoryAlreadyExistException implements HttpException {
  status : number;
  message: string;

  constructor(inputMessage?: string) {
    this.status  = 712;
    this.message = inputMessage ? inputMessage : "Category already exist";
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

export default CategoryAlreadyExistException;


import ResponseLogin from "./auth/responseLogin.interface";

interface ResponseService {
  status_schema: {
    status_code: number
    status_message: string
  },
  output_schema?: ResponseLogin | any
}

export default ResponseService;
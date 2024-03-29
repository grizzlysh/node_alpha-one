import Invoice from "../../entity/invoice.entity";

interface ResponseGetInvoice {
  data        : Invoice[],
  total_data  : number,
  total_pages : number,
  current_page: number
}

export default ResponseGetInvoice;
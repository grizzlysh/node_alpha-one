import Stock from "../../entity/stock.entity";

interface ResponseGetStock {
  data        : Stock[],
  total_data  : number,
  total_pages : number,
  current_page: number
}

export default ResponseGetStock;
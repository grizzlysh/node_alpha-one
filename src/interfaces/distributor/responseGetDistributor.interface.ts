import Distributor from "../../entity/distributor.entity";

interface ResponseGetDistributor {
  data        : Distributor[],
  total_data  : number,
  total_pages : number,
  current_page: number
}

export default ResponseGetDistributor;
import Drug from "../../entity/drug.entity";

interface ResponseGetDrug {
  data        : Drug[],
  total_data  : number,
  total_pages : number,
  current_page: number
}

export default ResponseGetDrug;
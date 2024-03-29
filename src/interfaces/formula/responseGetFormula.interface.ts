import Formula from "../../entity/formula.entity";

interface ResponseGetFormula {
  data        : Formula[],
  total_data  : number,
  total_pages : number,
  current_page: number
}

export default ResponseGetFormula;
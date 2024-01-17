import Category from "../../entity/category.entity";

interface ResponseGetCategory {
  data        : Category[],
  total_data  : number,
  total_pages : number,
  current_page: number
}

export default ResponseGetCategory;
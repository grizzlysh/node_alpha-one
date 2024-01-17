import Type from "../../entity/type.entity";

interface ResponseGetType {
  data        : Type[],
  total_data  : number,
  total_pages : number,
  current_page: number
}

export default ResponseGetType;
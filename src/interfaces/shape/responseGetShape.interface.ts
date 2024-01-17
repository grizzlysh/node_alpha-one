import Shape from "../../entity/shape.entity";

interface ResponseGetShape {
  data        : Shape[],
  total_data  : number,
  total_pages : number,
  current_page: number
}

export default ResponseGetShape;
import TherapyClass from "../../entity/therapyClass.entity";

interface ResponseGetTherapyClass {
  data        : TherapyClass[],
  total_data  : number,
  total_pages : number,
  current_page: number
}

export default ResponseGetTherapyClass;
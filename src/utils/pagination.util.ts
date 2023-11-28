
export const getPagination = (page: any, size: any) => {
  const limit  = size ? +size : 3;
  const offset = page ? page * limit : 0;

  return { limit, offset };
};

export const getPagingData = (data: any[], totalData: number, page: any, limit: any) => {
  // const { count: totalData, rows: data } = data;
  const currentPage                        = page ? +page : 0;
  const totalPages                         = Math.ceil(totalData / limit);

  return { data, totalData, currentPage, totalPages };
};

export const getPagination = (page: any, size: any) => {
  const limit  = size ? +size : 3;
  const offset = page ? page * limit : 0;

  return { limit, offset };
};

export const getPagingData = (data: any, page: any, limit: any) => {
  const { count: totalItems, rows: items } = data;
  const currentPage                        = page ? +page : 0;
  const totalPages                         = Math.ceil(totalItems / limit);

  return { totalItems, items, totalPages, currentPage };
};
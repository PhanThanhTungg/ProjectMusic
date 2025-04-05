interface Pagination{
  page: number,
  limit: number,
  skip: number,
  totalPage: number
}
export default (currentPage:number, limit:number, total:number):object=>{
  const objectPagination:Pagination = {
    page: currentPage,
    limit: limit,
    skip: (currentPage-1)*limit,
    totalPage: Math.ceil(total/limit)
  }
  // objectPagination["skip"] = (currentPage-1)*limit;
  // objectPagination["totalPage"] = Math.ceil(total/limit);
  return objectPagination;
}
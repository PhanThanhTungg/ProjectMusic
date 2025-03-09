export default (currentPage:number, limit:number, total:number):object=>{
  const objectPagination = {
    page: currentPage,
    limit: limit,
  }
  objectPagination["skip"] = (currentPage-1)*limit;
  objectPagination["totalPage"] = Math.ceil(total/limit);
  return objectPagination;
}
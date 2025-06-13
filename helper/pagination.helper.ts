import { Pagination } from "../types/admin/common.type";

export default (currentPage:number, limit:number, total:number):Pagination=>{
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
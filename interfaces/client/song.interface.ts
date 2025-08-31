import { Pagination } from "../admin/common.interface";
import { SuccessResponse } from "../common/response.type";

export interface GetMySongInterface extends SuccessResponse {
  songs: any[];
  pagination: Pagination;
}
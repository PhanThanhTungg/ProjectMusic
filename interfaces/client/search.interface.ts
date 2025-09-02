import { SuccessResponse } from "../common/response.interface";

export interface SearchInterface extends SuccessResponse{
  songs: any[];
  artists: any[];
  albums: any[];
}
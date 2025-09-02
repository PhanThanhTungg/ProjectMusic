import { SuccessResponse } from "../common/response.interface";

export interface GetUserInterface extends SuccessResponse {
  user: any,
  top5NewestSongs?: any[] | null,
  albums?: any[] | null,
  playlists: any[],
}
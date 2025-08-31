import { SuccessResponse } from "../common/response.type";

export interface GetUserInterface extends SuccessResponse {
  user: any,
  top5NewestSongs?: any[] | null,
  albums?: any[] | null,
  playlists: any[],
}
import { SuccessResponse } from "./response.type";

export interface AuthLoginSuccess extends SuccessResponse{
  accessToken: string;
}
import { SuccessResponse } from "../common/response.type";

export interface AuthLoginSuccess extends SuccessResponse{
  accessToken: string;
  user: any;
}

export interface tokenDecoded {
  id: string;
  type: "admin" | "user";
  iat: number;
  exp: number;
  expired?: boolean;
}
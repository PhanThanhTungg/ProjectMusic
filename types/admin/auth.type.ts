import { SuccessResponse } from "./response.type";

export interface AuthLoginSuccess extends SuccessResponse{
  accessToken: string;
}

export interface tokenDecoded {
  id: string;
  type: "admin" | "user";
  iat: number;
  exp: number;
  expired?: boolean;
}
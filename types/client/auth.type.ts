import { SuccessResponse } from "../common/response.type";

export interface AuthLoginSuccess extends SuccessResponse{
  accessToken: string;
  user: {
    type: "admin"| "user";
    id: string;
    avatar: string;
    name: string;
    phone: string;
    email: string;
  };
}

export interface tokenDecoded {
  id: string;
  type: "admin" | "user";
  iat: number;
  exp: number;
  expired?: boolean;
}
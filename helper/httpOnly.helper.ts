import path from "path";

export const saveCookie = (res:any, type:string, token:string):void => {
  res.cookie(type, token, {
    httpOnly: true,
    // secure: process.env.NODE_ENV === "production",
    secure: false,
    sameSite: "strict",
    maxAge: +process.env.COOKIE_HTTP_ONLY_EXPIRE * 24 * 60 * 60 * 1000,
    path: "/"
  });
}
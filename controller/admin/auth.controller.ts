import { Request, Response } from "express";
import Admin from "../../model/admin.model";
import bcrypt from "bcrypt";

export const login = async (req:Request, res:Response):Promise<any> =>{
  const { email, password } = req.body;
  
  // check email, password in database
  const checkEmail = await Admin.findOne({ email });
  if (!checkEmail) {
    return res.status(404).json({ message: "Email not found" });
  }
  if (!bcrypt.compareSync(password, checkEmail.password)) {
    return res.status(401).json({ message: "Incorrect password" });
  }

  



  return res.status(200).json({ message: "Login successful" });
}
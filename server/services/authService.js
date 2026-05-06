import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function registerUser(email, password) {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return await User.create({ email, passwordHash: hashedPassword });
}

export async function logInUser(email, password) {
  const user = await User.findOne({ email: email });
  if (!user) {
    throw new Error("Invalid credentials");
  }
  const userPw = await bcrypt.compare(password, user.passwordHash);
  if (!userPw) {
    throw new Error("Invalid credentials");
  }
  const signedToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  return { token: signedToken, user };
}

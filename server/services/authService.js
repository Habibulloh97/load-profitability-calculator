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

export async function updateMe(userId, updates) {
  return await User.findOneAndUpdate(
    { _id: userId },
    { $set: updates },
    { returnDocument: "after", runValidators: true },
  );
}

export async function changePassword(userId, currentPassword, newPassword) {
  const user = await User.findOne({ _id: userId });
  const saltRounds = 10;
  if (!user) {
    throw new Error("Unauthorized");
  }
  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isMatch) {
    throw new Error("Current password is incorrect");
  }
  const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
  return await User.findOneAndUpdate(
    { _id: userId },
    { $set: { passwordHash: hashedPassword } },
    { returnDocument: "after", runValidators: true },
  );
}

export async function deleteUser(userId, password) {
  const user = await User.findOne({ _id: userId });
  if (!user) {
    throw new Error("Unathorized");
  }
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new Error("Password is incorrect");
  }
  return await User.findOneAndDelete({ _id: userId });
}

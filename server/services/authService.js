import User from "../models/User.js";
import bcrypt from "bcryptjs"

export async function registerUser(email, password) {
        const saltRounds = 10
        const hashedPassword = await bcrypt.hash(password,saltRounds)
        return await User.create({email, passwordHash: hashedPassword})
}
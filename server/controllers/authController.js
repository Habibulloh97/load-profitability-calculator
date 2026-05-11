import { registerUser, logInUser } from "../services/authService.js";

export async function register(req, res) {
  try {
    const email = req.body.email;
    const password = req.body.password;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }
    const user = await registerUser(email, password);
    res.status(201).json({ id: user.id, email: user.email });
  } catch (err) {
    const DUPLICATE_KEY_ERROR = 11000;
    if (err.code === DUPLICATE_KEY_ERROR) {
      return res.status(409).json({ error: "Email already exists" });
    } else {
      console.error(err);
      res.status(500).json({ error: "Server Error" });
    }
  }
}
export async function login(req, res) {
  try {
    const email = req.body.email;
    const password = req.body.password;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }
    const { token, user } = await logInUser(email, password);
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({ id: user.id, email: user.email });
  } catch (err) {
    if (err.message === "Invalid credentials")
      return res.status(401).json({ error: "Invalid credentials" });
    console.error(err);
    return res.status(500).json({ error: "Service error" });
  }
}

export async function getMe(req, res) {
  const { id, email } = req.user;
  res.status(200).json({ id, email });
}

import {
  registerUser,
  logInUser,
  updateMe,
  deleteUser,
  changePassword,
} from "../services/authService.js";

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
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
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
  const { id, email, dispatchRates, maintenanceRates, companyDriverPay } =
    req.user;
  res.status(200).json(req.user);
}

export async function update(req, res) {
  try {
    const userId = req.user._id;
    const { passwordHash, ...safeUpdates } = req.body;
    if (Object.keys(safeUpdates).length === 0) {
      return res.status(400).json({ error: "Update Field Can't be Empty" });
    }
    const updated = await updateMe(userId, safeUpdates);
    return res.status(200).json(updated);
  } catch (err) {
    return res.status(500).json({ error: "Something went Wrong" });
  }
}

export async function updatePassword(req, res) {
  try {
    const userId = req.user._id;
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Both fields are required" });
    }
    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ error: "Password has to be at least 6 characters long" });
    }
    const updated = await changePassword(userId, currentPassword, newPassword);
    return res.status(204).end();
  } catch (err) {
    if (err.message === "Current password is incorrect") {
      return res.status(401).json({ error: err.message });
    }
    return res.status(500).json({ error: "Something went wrong" });
  }
}
export async function logout(req, res) {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return res.status(200).json({ message: "Logged out" });
}

export async function remove(req, res) {
  try {
    const id = req.user._id;
    const password = req.body.password;
    const removed = await deleteUser(id, password);
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
    });
    return res.status(204).end();
  } catch (err) {
    if (err.message === "Password is incorrect") {
      return res.status(401).json({ error: "Incorrect password" });
    }
    return res.status(500).json({ error: "Server Error" });
  }
}

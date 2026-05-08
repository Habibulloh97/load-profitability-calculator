import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api.js";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  async function logIn(e) {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Email and password is required");
      return;
    }
    try {
      await api.post("/api/auth/login", { email, password });
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    }
  }
  return (
    <>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={logIn}>
        <Input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <Input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
        />
        <Button type="submit">Log In</Button>
      </form>
    </>
  );
}

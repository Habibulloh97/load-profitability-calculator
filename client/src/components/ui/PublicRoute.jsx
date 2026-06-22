import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import api from "@/lib/api";

export default function PublicRoute({ children }) {
  const [authStatus, setAuthStatus] = useState("loading");

  useEffect(() => {
    api
      .get("/api/auth/me")
      .then(() => setAuthStatus("authenticated"))
      .catch(() => setAuthStatus("unauthenticated"));
  }, []);

  if (authStatus === "authenticated")
    return <Navigate to="/dashboard" replace />;
  return children;
}

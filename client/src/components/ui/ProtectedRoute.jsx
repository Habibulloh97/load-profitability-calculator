import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import api from "@/lib/api";

export default function ProtectedRoute({ children }) {
  const [authStatus, setAuthStatus] = useState("loading");

  useEffect(() => {
    api
      .get("/api/auth/me")
      .then(() => setAuthStatus("authenticated"))
      .catch(() => setAuthStatus("unauthenticated"));
  }, []);

  if (authStatus === "loading") return null;
  if (authStatus === "unauthenticated") {
    return <Navigate to="/login" replace />;
  }
  return children;
}

import { Routes, Route } from "react-router-dom";
import SignupPage from "./pages/SignupPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import ProtectedRoute from "./components/ui/ProtectedRoute.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import { Button } from "./components/ui/button";
import TrucksPage from "./pages/TrucksPage.jsx";
import DriversPage from "./pages/DriversPage.jsx";
function App() {
  return (
    <Routes>
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/trucks"
        element={
          <ProtectedRoute>
            <TrucksPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/drivers"
        element={
          <ProtectedRoute>
            <DriversPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;

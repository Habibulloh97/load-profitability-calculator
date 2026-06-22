import { Routes, Route } from "react-router-dom";
import SignupPage from "./pages/SignupPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import ProtectedRoute from "./components/ui/ProtectedRoute.jsx";
import PublicRoute from "./components/ui/PublicRoute.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import { Button } from "./components/ui/button";
import TrucksPage from "./pages/TrucksPage.jsx";
import DriversPage from "./pages/DriversPage.jsx";
import NewLoadPage from "./pages/NewLoadPage.jsx";
import LoadListPage from "./pages/LoadListPage.jsx";
import LoadDetailPage from "./pages/LoadDetailPage.jsx";
import DashboardLayout from "./pages/DashboardLayout.jsx";
import DriverDetailPage from "./pages/DriverDetailPage.jsx";
function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <SignupPage />
          </PublicRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/trucks" element={<TrucksPage />} />
        <Route path="/drivers" element={<DriversPage />} />
        <Route path="/drivers/:id" element={<DriverDetailPage />} />
        <Route path="/load" element={<NewLoadPage />} />
        <Route path="/loads" element={<LoadListPage />} />
        <Route path="/loads/:id" element={<LoadDetailPage />} />
      </Route>
    </Routes>
  );
}

export default App;

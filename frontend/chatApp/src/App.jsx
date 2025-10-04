import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import { useAuth } from "./components/authentification/AuthContext";
import { ToastContainer } from "react-toastify";

import Navbar from "./components/navBar/navBar";
import LoginPage from "./components/authentification/LoginPage";
import RegisterPage from "./components/authentification/RegisterPage";
import ForgotPasswordPage from "./components/authentification/ForgotPasswordPage";
import ResetPasswordPage from "./components/authentification/ResetPasswordPage";
import Logout from "./components/authentification/Logout";
import EditProfile from "./components/authentification/EditUser";
import Chat from "./components/chatComponents/chat";

import ProtectedRoute from "./components/authentification/ProtectedRoute";
import PublicRoute from "./components/authentification/PublicRoute";

// Spinner for loading state
const LoadingSpinner = () => <p>Loading...</p>;

// Root redirect logic
const RootRedirect = () => {

  
  const { loggedIn, loading } = useAuth();
  if (loading) return <LoadingSpinner />;

  return loggedIn ? <Navigate to="/chat" replace /> : <Navigate to="/login" replace />;
};

// Layout wrapper for protected pages
const ProtectedLayout = ({ children }) => (
  <>
    <Navbar />
    {children}
  </>
);

export default function App() {
    const { user } = useAuth();
  return (
    <Router>
      <ToastContainer />
      <Routes>
        {/* Root redirect */}
        <Route path="/" element={<RootRedirect />} />

        {/* Public routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot"
          element={
            <PublicRoute>
              <ForgotPasswordPage />
            </PublicRoute>
          }
        />
        <Route
          path="/reset/:token"
          element={
            <PublicRoute>
              <ResetPasswordPage />
            </PublicRoute>
          }
        />

        {/* Protected routes with Navbar */}
        <Route
          path="/edit-profile"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <EditProfile />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />
       <Route
  path="/chat"
  element={
    <ProtectedRoute>
      <ProtectedLayout>
        {user ? <Chat currentUserId={user._id} /> : <p>Loading...</p>}
      </ProtectedLayout>
    </ProtectedRoute>
  }
/>

        {/* Logout route */}
        <Route path="/logout" element={<Logout />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

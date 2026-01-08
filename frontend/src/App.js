import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CareerDiscoveryPage from "./pages/CareerDiscoveryPage";

import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

function Layout({ children }) {
  const location = useLocation();

  const hideNavbar =
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/register";

  return (
    <>
      {!hideNavbar && <Navbar />}
      {children}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>

          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/career"
            element={
              <ProtectedRoute>
                <CareerDiscoveryPage />
              </ProtectedRoute>
            }
          />

        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

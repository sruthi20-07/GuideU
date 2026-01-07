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
<<<<<<< HEAD

<<<<<<< Updated upstream
  // Hide navbar ONLY on landing + auth pages
=======
>>>>>>> main
=======
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
<<<<<<< HEAD
          {/* ✅ FRONT PAGE */}
=======
          {/* Public */}
>>>>>>> Stashed changes
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected */}
=======
          {/* PUBLIC */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* PROTECTED */}
>>>>>>> main
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
<<<<<<< Updated upstream
<<<<<<< HEAD
=======
          <Route
            path="/ask"
            element={
              <ProtectedRoute>
                <AskPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/suggest"
            element={
              <ProtectedRoute>
                <SuggestPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/explore"
            element={
              <ProtectedRoute>
                <ExplorePage />
              </ProtectedRoute>
            }
          />
>>>>>>> main
=======

          <Route
            path="/career"
            element={
              <ProtectedRoute>
                <CareerDiscoveryPage />
              </ProtectedRoute>
            }
          />
>>>>>>> Stashed changes
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

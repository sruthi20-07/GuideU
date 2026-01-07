import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

function Layout({ children }) {
  const location = useLocation();
<<<<<<< HEAD

  // Hide navbar ONLY on landing + auth pages
=======
>>>>>>> main
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
<<<<<<< HEAD
          {/* ✅ FRONT PAGE */}
          <Route path="/" element={<Home />} />

          {/* Auth pages */}
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
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

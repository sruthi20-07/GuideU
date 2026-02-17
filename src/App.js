import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AskPage from "./pages/AskPage";
import SuggestPage from "./pages/SuggestPage";
import AskSuggest from "./pages/Ask_Suggest";
import ExplorePage from "./pages/ExplorePage";
import RoadmapPage from "./pages/RoadmapPage";
import CareerDiscoveryPage from "./pages/CareerDiscoveryPage";
import DailyTasksPage from "./pages/DailyTasksPage";
import MentalHealthPage from "./pages/MentalHealthPage";

// Components
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

// Context
import { MenuContext } from "./context/MenuContext";

/* ---------- Layout ---------- */
function Layout({ children }) {
  const location = useLocation();

  const hideNavbar =
    location.pathname === "/login" ||
    location.pathname === "/register";

  return (
    <>
      {!hideNavbar && <Navbar />}

      <div style={{ paddingTop: hideNavbar ? "0px" : "60px" }}>
        {children}
      </div>
    </>
  );
}

/* ---------- App ---------- */
export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  return (
    <MenuContext.Provider value={{ menuOpen, toggleMenu }}>
      <Router>
        <Layout>
          <Routes>

            {/* PUBLIC */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* PROTECTED */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

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
              path="/ask-suggest"
              element={
                <ProtectedRoute>
                  <AskSuggest />
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

            <Route
              path="/roadmap"
              element={
                <ProtectedRoute>
                  <RoadmapPage />
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

            <Route
              path="/tasks"
              element={
                <ProtectedRoute>
                  <DailyTasksPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/wellbeing"
              element={
                <ProtectedRoute>
                  <MentalHealthPage />
                </ProtectedRoute>
              }
            />

          </Routes>
        </Layout>
      </Router>
    </MenuContext.Provider>
  );
}

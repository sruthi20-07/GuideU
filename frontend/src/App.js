import React, { useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AskPage from "./pages/AskPage";
import SuggestPage from "./pages/SuggestPage";
import ExplorePage from "./pages/ExplorePage";
import RoadmapPage from "./pages/RoadmapPage";
import CareerDiscoveryPage from "./pages/CareerDiscoveryPage";
import DailyTasksPage from "./pages/DailyTasksPage";
import MentalHealthPage from "./pages/MentalHealthPage";

import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import { MenuContext } from "./context/MenuContext";

/* ---------- Layout ---------- */
function Layout() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const hideNavbar =
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/register";

  const toggleMenu = () => setMenuOpen(prev => !prev);

  return (
    <MenuContext.Provider value={{ menuOpen, toggleMenu }}>
      {!hideNavbar && <Navbar />}

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
        />
        <Route path="/ask" element={<ProtectedRoute><AskPage /></ProtectedRoute>} />
        <Route path="/suggest" element={<ProtectedRoute><SuggestPage /></ProtectedRoute>} />
        <Route path="/explore" element={<ProtectedRoute><ExplorePage /></ProtectedRoute>} />
        <Route path="/roadmap" element={<ProtectedRoute><RoadmapPage /></ProtectedRoute>} />
        <Route path="/career" element={<ProtectedRoute><CareerDiscoveryPage /></ProtectedRoute>} />
        <Route path="/tasks" element={<ProtectedRoute><DailyTasksPage /></ProtectedRoute>} />
        <Route path="/wellbeing" element={<ProtectedRoute><MentalHealthPage /></ProtectedRoute>} />
      </Routes>
    </MenuContext.Provider>
  );
}

/* ---------- App ---------- */
export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

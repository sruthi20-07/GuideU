
import { BrowserRouter, Routes, Route, Outlet, useLocation } from "react-router-dom";

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

import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

/* ---------- Layout ---------- */
function Layout() {
  const location = useLocation();

  // Hide navbar ONLY on landing + auth pages
  const hideNavbar =
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/register";

  return (
    <>
      {!hideNavbar && <Navbar />}
      <div style={{ paddingTop: hideNavbar ? 0 : 60 }}>
        <Outlet /> {/* Nested routes render here */}
      </div>
    </>
  );
}

/* ---------- App ---------- */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Layout wraps all routes */}
        <Route element={<Layout />}>

          {/* PUBLIC ROUTES */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* PROTECTED ROUTES */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
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
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

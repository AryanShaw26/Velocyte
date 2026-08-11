import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/Dashboard";

import ProtectedRoute from "./routes/ProtectedRoute";

import { AuthProvider } from "./context/AuthContext";
import Projects from "./pages/Projects";
import ProjectDetails from "./pages/ProjectDetails";
import Tasks from "./pages/Tasks";
import PullRequests from "./pages/PullRequests";
import AIReviews from "./pages/AIReviews";
import Analytics from "./pages/Analytics";
import GitHubCallback from "./pages/auth/GitHubCallback";
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}

          <Route path="/" element={<Landing />} />

          <Route path="/login" element={<Login />} />

          <Route path="/register" element={<Register />} />
          <Route path="/github-callback" element={<GitHubCallback />} />

          {/* Protected Routes */}

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:projectId" element={<ProjectDetails />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/pull-requests" element={<PullRequests />} />
          <Route path="/ai-reviews" element={<AIReviews />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

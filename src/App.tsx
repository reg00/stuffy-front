// App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './components/Auth/Login';
import { Register } from './components/Auth/Register';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import { EventsPage } from './components/Events/EventsPage';
import { EventDetailsPage } from './components/Events/EventDetailsPage';
import { ParticipantsPage } from './components/Participant/ParticipantsPage';
import { PurchasesPage } from './components/Purchase/PurchasesPage';
import { NotFoundPage } from './components/Errors/NotFoundPage';
import { useAuthStore } from './store/auth-store';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Router>
      <Routes>
        {/* без layout */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* с layout */}
        <Route
          path="/events"
          element={
            <ProtectedRoute>
                <EventsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/events/:id"
          element={
            <ProtectedRoute>
                <EventDetailsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/events/:id/participants"
          element={
            <ProtectedRoute>
                <ParticipantsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/events/:id/purchases"
          element={
            <ProtectedRoute>
                <PurchasesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/events" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;

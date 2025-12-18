import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth-store';
import { authService } from '../../services/auth-service';
import { AppLayout } from '../Layout/AppLayout';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  const hasToken = authService.isAuthenticated();

  if (!isAuthenticated || !hasToken) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Все защищённые страницы теперь внутри общего layout с хедером
  return <AppLayout>{children}</AppLayout>;
};

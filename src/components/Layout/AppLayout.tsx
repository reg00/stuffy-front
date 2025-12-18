// src/components/Layout/AppLayout.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth-store';
import { useTheme } from '../../hooks/useTheme'; // хук из прошлего шага
import './AppLayout.css';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const goHome = () => {
    navigate('/events');
  };

  return (
    <div className="app-root">
      <header className="app-header">
        <div className="app-logo" onClick={goHome}>
          StuffyHelper
        </div>

        <div className="app-header-right">
          <button
  className="app-theme-toggle"
  onClick={toggleTheme}
  aria-label="Toggle theme"
>
  <span className="app-theme-icon app-theme-icon--sun" data-active={theme === 'light'}>
    ☀️
  </span>
  <span className="app-theme-icon app-theme-icon--moon" data-active={theme === 'dark'}>
    🌙
  </span>
</button>


          {isAuthenticated && user && (
            <div className="app-user">
              <span className="app-user-name">
                {user.firstName || user.name || user.email || 'Пользователь'}
              </span>
              <button onClick={handleLogout}>Выход</button>
            </div>
          )}
        </div>
      </header>

      <main className="app-main">{children}</main>
    </div>
  );
};

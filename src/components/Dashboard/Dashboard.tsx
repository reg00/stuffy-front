import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth-store';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuthStore();

  if (!isAuthenticated) {
    // Если сюда нельзя заходить без логина — лучше делать редирект,
    // но минимально можно показать заглушку
    return <div>Нет данных пользователя</div>;
  }

  return (
    <div>
      <h1>Добро пожаловать!</h1>
      <button
        onClick={() => {
          logout();
          navigate('/login');
        }}
      >
        Выход
      </button>
    </div>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '40px 24px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'var(--color-bg)',
      }}
    >
      <div
        style={{
          textAlign: 'center',
          maxWidth: 480,
        }}
      >
        <h1 style={{ fontSize: 32, margin: '0 0 8px' }}>404</h1>
        <p style={{ margin: '0 0 16px', fontSize: 16 }}>
          Страница не найдена.
        </p>
        <Link
          to="/events"
          style={{
            textDecoration: 'none',
            color: 'white',
            background: '#4f46e5',
            padding: '8px 16px',
            borderRadius: 8,
            fontSize: 14,
          }}
        >
          На главную
        </Link>
      </div>
    </div>
  );
};

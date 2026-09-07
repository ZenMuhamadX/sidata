import React from 'react';
import { LoginForm } from '../components/LoginForm';

export const LoginPage: React.FC = () => {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <LoginForm />
      </div>
    </div>
  );
};

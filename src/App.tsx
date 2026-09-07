import React from 'react';
import { AuthProvider } from './features/auth/providers/AuthProvider';
import { AppRouter } from './app/router';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
};

export default App;

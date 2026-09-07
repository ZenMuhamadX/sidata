import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setErrorMessage('Email dan password wajib diisi.');
      return;
    }

    try {
      setIsSubmitting(true);
      await login({ email: trimmedEmail, password });
      navigate('/', { replace: true });
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'message' in err) {
        setErrorMessage(String((err as { message: string }).message));
      } else {
        setErrorMessage('Gagal masuk ke sistem. Periksa kembali kredensial Anda.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <div className="form-header">
        <h2>Portal Admin Sekolah</h2>
        <p>Sistem Pengelolaan Data Siswa (Schema: assyifa)</p>
      </div>

      {errorMessage && (
        <div className="error-alert" role="alert">
          {errorMessage}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@sekolah.sch.id"
          disabled={isSubmitting}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          disabled={isSubmitting}
          required
        />
      </div>

      <button
        type="submit"
        className="btn-submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Memproses...' : 'Masuk ke Sistem'}
      </button>
    </form>
  );
};

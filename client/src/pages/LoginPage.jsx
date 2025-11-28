import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext.jsx';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, authError, setAuthError, authStatus } = useAuthContext();
  const [form, setForm] = useState({ username: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setAuthError(null);
  }, [setAuthError]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    const result = await login(form);
    setSubmitting(false);

    if (result.success) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  };

  const serverBaseUrl = import.meta.env.VITE_SERVER_BASE_URL || 'http://localhost:4000';
  const googleLoginUrl = `${serverBaseUrl}/api/auth/google`;

  return (
    <div className="container">
      <form className="form-card" onSubmit={handleSubmit}>
        <h1>Welcome back, coach</h1>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="username"
            autoComplete="username"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
        </div>

        {authError ? <div className="alert">{authError}</div> : null}

        <div className="form-actions">
          <button type="submit" className="btn" disabled={submitting || authStatus === 'loading'}>
            {submitting ? 'Logging in...' : 'Log in'}
          </button>
          <a className="btn btn" href={googleLoginUrl}>
            Continue with Google
          </a>
        </div>

        <p>
          Don&apos;t have an account? <Link to="/register">Register here</Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;

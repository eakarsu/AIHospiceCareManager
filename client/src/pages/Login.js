import React, { useState } from 'react';
import axios from 'axios';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submitLogin = async (loginEmail, loginPassword) => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/auth/login', { email: loginEmail, password: loginPassword });
      onLogin(res.data.token, res.data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submitLogin(email, password);
  };

  const handleDemoLogin = async () => {
    const demoEmail = process.env.REACT_APP_DEMO_EMAIL || '';
    const demoPassword = process.env.REACT_APP_DEMO_PASSWORD || '';
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    if (demoEmail && demoPassword) {
      await submitLogin(demoEmail, demoPassword);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-logo">
          <div className="logo-icon">🏥</div>
          <h1>Hospice Care Manager</h1>
          <p>AI-Powered Compassionate Care Platform</p>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading || !process.env.REACT_APP_DEMO_EMAIL || !process.env.REACT_APP_DEMO_PASSWORD}
            aria-label="Fill demo credentials"
            style={{ width: '100%', marginBottom: '12px', padding: '10px 14px', borderRadius: '8px', border: '1px solid currentColor', background: 'transparent', cursor: 'pointer' }}
          >
            Fill demo credentials
          </button>
          {(!process.env.REACT_APP_DEMO_EMAIL || !process.env.REACT_APP_DEMO_PASSWORD) && <p role="status">Demo credentials are not configured for this build. Enter your account credentials to sign in.</p>}
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

      </div>
    </div>
  );
}

export default Login;

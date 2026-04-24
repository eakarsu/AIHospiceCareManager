import React, { useState } from 'react';
import axios from 'axios';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      onLogin(res.data.token, res.data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
    setLoading(false);
  };

  const quickLogin = () => {
    setEmail('admin@hospice.com');
    setPassword('password123');
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
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="quick-login">
          <p>Quick access for demo</p>
          <button className="quick-login-btn" onClick={quickLogin}>
            Auto-fill Admin Credentials
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;

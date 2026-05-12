import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaMusic, FaEye, FaEyeSlash } from 'react-icons/fa';
import { GoogleLogin } from '@react-oauth/google';
import Button from '../components/Button';
import { useAuthContext } from '../context/AuthContext';
import api from '../services/api';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    const existingToken = localStorage.getItem('echoduel_token');
    const existingUser = localStorage.getItem('echoduel_user');
    if (existingToken && existingUser) {
      navigate('/lobby', { replace: true });
    }
  }, [navigate]);

  const successMessage = location.state?.successMessage;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Email and password are required.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/api/auth/login', { email, password });
      login(response.data.token, response.data.user);
      navigate('/lobby');
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await api.post('/api/auth/google', { credential: credentialResponse.credential });
      login(response.data.token, response.data.user);
      navigate('/lobby');
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Google Login failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#e0e5ec] px-4 py-12">
      <div className="w-full max-w-md rounded-[2rem] bg-[#e0e5ec] p-8 shadow-neu">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-72 w-auto items-center justify-center">
            <img src="/logo.png" alt="EchoDuel" className="h-64 w-auto object-contain" />
          </div>
          <p className="mt-2 text-sm text-[#7b7b8d]">Login to continue the musical showdown.</p>
        </div>

        {successMessage && (
          <div className="mb-4 rounded-3xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 shadow-neu-sm">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#4a4a6a]">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl bg-[#e0e5ec] px-4 py-3 text-[#4a4a6a] shadow-neu-inset outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#4a4a6a]">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-xl bg-[#e0e5ec] px-4 py-3 pr-12 text-[#4a4a6a] shadow-neu-inset outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-[#a78bfa] text-white hover:bg-[#8b5cf6]"
            disabled={loading}
          >
            {loading ? 'Logging in…' : 'Login'}
          </Button>

          {error && <p className="text-center text-sm text-red-600">{error}</p>}
        </form>

        <div className="my-6 flex items-center justify-center gap-3">
          <div className="h-px w-full bg-slate-300"></div>
          <span className="text-xs text-slate-400 uppercase tracking-widest">or</span>
          <div className="h-px w-full bg-slate-300"></div>
        </div>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Google Login Failed')}
            theme="filled_blue"
            shape="pill"
          />
        </div>

        <p className="mt-6 text-center text-sm text-[#7b7b8d]">
          Don&apos;t have an account?{' '}
          <button type="button" onClick={() => navigate('/register')} className="font-semibold text-[#a78bfa]">
            Register
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
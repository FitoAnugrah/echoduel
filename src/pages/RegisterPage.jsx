import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMusic } from 'react-icons/fa';
import Button from '../components/Button';
import api from '../services/api';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!fullName.trim() || !username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Please complete all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/auth/register', { email, password, username, name: fullName });
      navigate('/login', {
        state: {
          successMessage: 'Account created successfully. Please log in.',
        },
      });
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#e0e5ec] px-4 py-12">
      {/* Animated Background Blobs */}
      <div className="absolute -left-20 top-20 h-96 w-96 animate-pulse-slow rounded-full bg-[#a78bfa] opacity-20 blur-[100px]"></div>
      <div className="absolute -bottom-20 -right-20 h-96 w-96 animate-pulse-slow rounded-full bg-fuchsia-400 opacity-20 blur-[100px]" style={{ animationDelay: '2s' }}></div>
      <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 animate-spin-slow rounded-full bg-sky-300 opacity-10 blur-[80px]"></div>

      <div className="relative z-10 w-full max-w-md rounded-[2.5rem] bg-[#e0e5ec]/80 p-8 shadow-[15px_15px_30px_#b8b9be,-15px_-15px_30px_#ffffff] backdrop-blur-xl transition-all duration-300 hover:shadow-[20px_20px_40px_#b8b9be,-20px_-20px_40px_#ffffff]">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-72 w-auto items-center justify-center">
            <img src="/logo.png" alt="EchoDuel" className="h-64 w-auto object-contain" />
          </div>
          <p className="mt-2 text-sm text-[#7b7b8d]">Start your journey with a new profile.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid place-items-center">
            {/* Logo is now in the header section above */}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#4a4a6a]">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              className="w-full rounded-xl bg-[#e0e5ec] px-4 py-3 text-[#4a4a6a] shadow-neu-inset outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#4a4a6a]">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="echoplayer"
              className="w-full rounded-xl bg-[#e0e5ec] px-4 py-3 text-[#4a4a6a] shadow-neu-inset outline-none"
            />
          </div>

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
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              className="w-full rounded-xl bg-[#e0e5ec] px-4 py-3 text-[#4a4a6a] shadow-neu-inset outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#4a4a6a]">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your password"
              className="w-full rounded-xl bg-[#e0e5ec] px-4 py-3 text-[#4a4a6a] shadow-neu-inset outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative mt-4 flex w-full overflow-hidden items-center justify-center rounded-full bg-gradient-to-r from-[#a78bfa] to-fuchsia-500 py-4 text-base font-extrabold text-white shadow-neu transition-all duration-300 hover:scale-[1.02] hover:shadow-lg disabled:opacity-70"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full transition-transform duration-300 group-hover:translate-y-0"></div>
            <span className="relative z-10 text-shadow-sm">{loading ? 'Creating account…' : 'Create Account'}</span>
          </button>

          {error && <p className="text-center text-sm text-red-600">{error}</p>}
        </form>

        <p className="mt-6 text-center text-sm text-[#7b7b8d]">
          Already have an account?{' '}
          <button type="button" onClick={() => navigate('/login')} className="font-semibold text-[#a78bfa]">
            Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
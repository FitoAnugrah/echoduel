import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCamera } from 'react-icons/fa';
import Button from '../components/Button';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!avatar) {
      setAvatarPreview('');
      return;
    }

    const objectUrl = URL.createObjectURL(avatar);
    setAvatarPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [avatar]);

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatar(file);
    }
  };

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
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username, name: fullName }),
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || 'Registration failed');

      navigate('/login', {
        state: {
          successMessage: 'Account created successfully. Please log in.',
        },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#e0e5ec] px-4 py-12">
      <div className="w-full max-w-md rounded-[2rem] bg-[#e0e5ec] p-8 shadow-neu">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold text-[#4a4a6a]">Create Account</h1>
          <p className="mt-2 text-sm text-[#7b7b8d]">Start your EchoDuel journey with a new profile.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid place-items-center">
            <label htmlFor="avatar-upload" className="group relative flex h-28 w-28 cursor-pointer items-center justify-center rounded-full bg-[#e0e5ec] shadow-neu transition hover:shadow-neu-sm">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar preview" className="h-full w-full rounded-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center text-[#a78bfa]">
                  <FaCamera className="text-2xl" />
                  <p className="mt-2 text-xs text-[#4a4a6a]">Upload Avatar</p>
                </div>
              )}
              <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarChange} className="sr-only" />
            </label>
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

          <Button type="submit" className="w-full bg-[#a78bfa] text-white hover:bg-[#8b5cf6]" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </Button>

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
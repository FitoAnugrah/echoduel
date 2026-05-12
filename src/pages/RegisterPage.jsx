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
    <div className="flex min-h-screen items-center justify-center bg-[#e0e5ec] px-4 py-12">
      <div className="w-full max-w-md rounded-[2rem] bg-[#e0e5ec] p-8 shadow-neu">
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
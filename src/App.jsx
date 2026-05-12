import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuthContext } from './context/AuthContext';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import LobbyPage from './pages/LobbyPage.jsx';
import FriendsPage from './pages/FriendsPage.jsx';
import ChatPage from './pages/ChatPage.jsx';
import GamePage from './pages/GamePage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import LeaderboardPage from './pages/LeaderboardPage.jsx';
import SearchPage from './pages/SearchPage.jsx';
import Navbar from './components/Navbar.jsx';
import { Toaster } from 'react-hot-toast';

function ProtectedRoute({ children }) {
  const { token } = useAuthContext();
  return token ? children : <Navigate to="/login" replace />;
}


function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
      
        path="/lobby"
        element={
          <ProtectedRoute>
            <LobbyPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/friends"
        element={
          <ProtectedRoute>
            <FriendsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat/:friendId"
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage initialTab="account" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <ProfilePage initialTab="settings" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/leaderboard"
        element={
          <ProtectedRoute>
            <LeaderboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/search"
        element={
          <ProtectedRoute>
            <SearchPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/game/:roomId"
        element={
          <ProtectedRoute>
            <GamePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="*"
        element={
          <div className="flex min-h-screen items-center justify-center bg-[#e0e5ec] px-4 py-10">
            <div className="rounded-[2rem] bg-[#e0e5ec] p-10 shadow-neu text-center max-w-xl">
              <h1 className="text-3xl font-semibold text-[#4a4a6a]">404 Page Not Found</h1>
              <p className="mt-3 text-sm text-slate-500">The page you are looking for does not exist.</p>
            </div>
          </div>
        }
      />
    </Routes>
  );
}

const AUTH_ROUTES = ['/login', '/register'];

function AppContent() {
  const { token } = useAuthContext();
  const location = useLocation();
  const isAuthRoute = AUTH_ROUTES.includes(location.pathname);
  const isGameRoute = location.pathname.startsWith('/game');
  
  return (
    <>
      {token && !isAuthRoute && !isGameRoute && <Navbar />}
      <Toaster position="top-right" />
      <AppRoutes />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
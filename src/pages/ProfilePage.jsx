import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useAuthContext } from '../context/AuthContext';
import { updateProfile, changePassword } from '../services/authService';
import api from '../services/api';
import Button from '../components/Button';
import InputField from '../components/InputField';
import { FaCamera } from 'react-icons/fa';
import { getAvatarUrl } from '../utils/avatar';

const tabs = [
  { id: 'account', label: 'Account' },
  { id: 'security', label: 'Security' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'settings', label: 'Settings' },
];

const ProfilePage = ({ initialTab = 'account' }) => {
  const { user, updateUser } = useAuthContext();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(getAvatarUrl(user?.avatar, user?.name || user?.username));
  const [avatarFile, setAvatarFile] = useState(null);
  const fileInputRef = useRef(null);
  const [profile, setProfile] = useState({
    name: '',
    username: '',
    email: '',
    joinDate: '',
    gamesPlayed: 0,
    winRate: 0,
    favoriteGenre: '',
    notifications: {
      friendRequests: true,
      gameInvites: true,
      chatMessages: true,
    },
  });
  const [settings, setSettings] = useState({ themeMode: 'light', language: 'English' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    if (!user) return;
    setProfile({
      name: user.name || '',
      username: user.username || '',
      email: user.email || '',
      joinDate: user.joinDate || 'Unknown',
      gamesPlayed: user.gamesPlayed || 0,
      winRate: user.winRate || 0,
      favoriteGenre: user.favoriteGenre || 'K-Pop',
      notifications: {
        friendRequests: user.notifications?.friendRequests ?? true,
        gameInvites: user.notifications?.gameInvites ?? true,
        chatMessages: user.notifications?.chatMessages ?? true,
      },
    });
    setAvatarPreview(getAvatarUrl(user.avatar, user.name || user.username));
  }, [user]);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (event) => {
    const pickedFile = event.target.files?.[0];
    if (!pickedFile) return;
    setAvatarFile(pickedFile);
    setAvatarPreview(URL.createObjectURL(pickedFile));
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      // Upload avatar first if a new file was selected
      if (avatarFile) {
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        const avatarRes = await api.put('/api/auth/avatar', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        // Update local avatar preview with the server URL
        const serverAvatarUrl = avatarRes.data?.user?.avatar;
        const newAvatarToken = avatarRes.data?.token;
        if (serverAvatarUrl) {
          const fullUrl = getAvatarUrl(serverAvatarUrl, profile.name || profile.username);
          setAvatarPreview(fullUrl);
          updateUser({ avatar: fullUrl }, newAvatarToken);
        }
        setAvatarFile(null);
      }

      // Save text profile fields
      const payload = {
        name: profile.name,
        username: profile.username,
        email: profile.email,
        favoriteGenre: profile.favoriteGenre,
        notifications: profile.notifications,
      };
      const response = await updateProfile(payload);
      updateUser(response.user || payload, response.token);
      toast.success('Profile updated successfully.');
      setEditMode(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePassword = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await changePassword(passwordForm);
      toast.success('Password changed successfully.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || 'Unable to change password.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleNotification = (key) => {
    setProfile((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key],
      },
    }));
  };

  const handleSaveSettings = () => {
    toast.success('Settings saved successfully.');
  };

  return (
    <section className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 text-[#4a4a6a]">
      <header className="rounded-[2rem] bg-background p-6 shadow-neu">
        <h1 className="text-3xl font-bold text-slate-900">Profile</h1>
        <p className="mt-2 text-slate-500">Update your account, security settings, and notification preferences.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[2rem] bg-background p-6 shadow-neu">
          <div className="flex flex-col items-center gap-5 text-center">
            <div className="relative">
              <button type="button" onClick={handleAvatarClick} className="absolute bottom-0 right-0 rounded-full bg-[#a78bfa] p-3 text-white shadow-neu-sm transition hover:bg-[#8b5cf6]">
                <FaCamera />
              </button>
              <img
                src={avatarPreview}
                alt={profile.name}
                className="h-32 w-32 rounded-full border-8 border-[#e0e5ec] object-cover shadow-neu"
              />
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            <div>
              <p className="text-xl font-semibold text-slate-900">{profile.name}</p>
              <p className="text-sm text-slate-500">@{profile.username}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl bg-[#f5f7fb] p-4 text-left shadow-neu-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Joined</p>
                <p className="mt-2 font-semibold text-slate-900">{profile.joinDate}</p>
              </div>
              <div className="rounded-3xl bg-[#f5f7fb] p-4 text-left shadow-neu-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Games</p>
                <p className="mt-2 font-semibold text-slate-900">{profile.gamesPlayed}</p>
              </div>
            </div>
            <div className="w-full rounded-[2rem] bg-[#f5f7fb] p-5 shadow-neu-sm">
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>Win rate</span>
                <span className="font-semibold text-slate-900">{profile.winRate}%</span>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-[#a78bfa] transition-all" style={{ width: `${profile.winRate}%` }} />
              </div>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#f5f7fb] px-4 py-2 text-sm font-semibold text-[#4a4a6a] shadow-neu-sm">
              Favorite genre:
              <span className="rounded-full bg-[#a78bfa]/20 px-3 py-1 text-sm text-[#5b21b6]">{profile.favoriteGenre}</span>
            </div>
            <Button onClick={() => { setActiveTab('account'); setEditMode(true); }} className="w-full">
              Edit Profile
            </Button>
          </div>
        </div>

        <div className="rounded-[2rem] bg-background p-6 shadow-neu">
          <div className="flex flex-wrap gap-3 border-b border-slate-200 pb-4">
            {tabs.map((tabItem) => (
              <button
                key={tabItem.id}
                type="button"
                onClick={() => setActiveTab(tabItem.id)}
                className={`rounded-3xl px-5 py-3 text-sm font-semibold transition ${
                  activeTab === tabItem.id
                    ? 'bg-[#a78bfa] text-white shadow-neu-sm'
                    : 'bg-[#e0e5ec] text-slate-600 hover:bg-[#f5f7fb]'
                }`}
              >
                {tabItem.label}
              </button>
            ))}
          </div>

          <div className="mt-6 space-y-6">
            {activeTab === 'account' && (
              <div className="space-y-6">
                <InputField
                  label="Full name"
                  value={profile.name}
                  onChange={(event) => setProfile((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="Enter your full name"
                  type="text"
                  disabled={!editMode}
                />
                <InputField
                  label="Username"
                  value={profile.username}
                  onChange={(event) => setProfile((prev) => ({ ...prev, username: event.target.value }))}
                  placeholder="Enter your username"
                  type="text"
                  disabled={!editMode}
                />
                <InputField
                  label="Email"
                  value={profile.email}
                  onChange={(event) => setProfile((prev) => ({ ...prev, email: event.target.value }))}
                  placeholder="Enter your email address"
                  type="email"
                  disabled={!editMode}
                />
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Favorite Genre</label>
                  <select
                    value={profile.favoriteGenre}
                    onChange={(event) => setProfile((prev) => ({ ...prev, favoriteGenre: event.target.value }))}
                    disabled={!editMode}
                    className="w-full rounded-3xl border border-slate-200 bg-[#e0e5ec] px-5 py-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-[#a78bfa]/30 disabled:opacity-60"
                  >
                    {['Pop Indo', 'Pop Barat', 'K-Pop', 'Rock', 'Jazz', 'Electronic'].map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                {!editMode && <p className="text-sm text-slate-500">Click Edit Profile to update your account details.</p>}
                {editMode && (
                  <div className="flex flex-wrap gap-3">
                    <Button onClick={handleSaveProfile} className="min-w-[140px]">
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <button
                      type="button"
                      onClick={() => setEditMode(false)}
                      className="rounded-2xl border border-slate-200 bg-[#e0e5ec] px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-[#f5f7fb]"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'security' && (
              <form className="space-y-5" onSubmit={handleSavePassword}>
                <InputField
                  label="Current password"
                  value={passwordForm.currentPassword}
                  onChange={(event) => setPasswordForm((prev) => ({ ...prev, currentPassword: event.target.value }))}
                  placeholder="Enter current password"
                  type="password"
                />
                <InputField
                  label="New password"
                  value={passwordForm.newPassword}
                  onChange={(event) => setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))}
                  placeholder="Enter new password"
                  type="password"
                />
                <InputField
                  label="Confirm new password"
                  value={passwordForm.confirmPassword}
                  onChange={(event) => setPasswordForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                  placeholder="Confirm new password"
                  type="password"
                />
                <Button type="submit" className="min-w-[140px]">
                  {loading ? 'Saving...' : 'Change Password'}
                </Button>
              </form>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-4">
                {[
                  { key: 'friendRequests', label: 'Friend request alerts' },
                  { key: 'gameInvites', label: 'Game invite notifications' },
                  { key: 'chatMessages', label: 'Chat message updates' },
                ].map((item) => (
                  <label key={item.key} className="flex items-center justify-between rounded-3xl bg-[#f5f7fb] p-4 shadow-neu-sm">
                    <span className="text-sm font-semibold text-slate-800">{item.label}</span>
                    <input
                      type="checkbox"
                      checked={profile.notifications[item.key]}
                      onChange={() => handleToggleNotification(item.key)}
                      className="h-5 w-5 rounded-full accent-[#a78bfa]"
                    />
                  </label>
                ))}
                <Button onClick={handleSaveProfile} className="min-w-[140px]">
                  {loading ? 'Saving...' : 'Save Notification Preferences'}
                </Button>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="rounded-3xl bg-[#f5f7fb] p-5 shadow-neu-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Theme mode</p>
                      <p className="text-sm text-slate-500">Pick light or dark appearance for your experience.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSettings((prev) => ({ ...prev, themeMode: prev.themeMode === 'light' ? 'dark' : 'light' }))}
                      className="rounded-full bg-[#e0e5ec] px-5 py-3 text-sm font-semibold text-slate-700 shadow-neu-sm"
                    >
                      {settings.themeMode === 'light' ? 'Light Mode' : 'Dark Mode'}
                    </button>
                  </div>
                </div>
                <div className="rounded-3xl bg-[#f5f7fb] p-5 shadow-neu-sm">
                  <label className="flex flex-col gap-2 text-sm font-semibold text-slate-900">
                    Preferred language
                    <select
                      value={settings.language}
                      onChange={(event) => setSettings((prev) => ({ ...prev, language: event.target.value }))}
                      className="mt-1 rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                    >
                      <option>English</option>
                      <option>Spanish</option>
                      <option>French</option>
                    </select>
                  </label>
                </div>
                <Button onClick={handleSaveSettings} className="min-w-[140px]">
                  Save Settings
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfilePage;

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { getUsers, saveUsers } from '../utils/db.js';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('❌ FATAL: JWT_SECRET is not set in environment variables. Server cannot start securely.');
  process.exit(1);
}

// ─── Validators ───────────────────────────────────────────────────────────────

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isStrongPassword = (password) =>
  password.length >= 8 && /[a-zA-Z]/.test(password) && /[0-9]/.test(password);

// ─── Register ─────────────────────────────────────────────────────────────────

export const register = async (req, res) => {
  try {
    const { email, password, username, name } = req.body;

    if (!email || !password || !username || !name) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format.' });
    }
    if (!isStrongPassword(password)) {
      return res.status(400).json({ message: 'Password must be at least 8 characters and contain letters and numbers.' });
    }
    if (username.trim().length < 3) {
      return res.status(400).json({ message: 'Username must be at least 3 characters.' });
    }

    const users = getUsers();
    if (users.find(u => u.email === email || u.username === username)) {
      return res.status(400).json({ message: 'Email or username already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: `usr_${Date.now()}`,
      email,
      username,
      name,
      password: hashedPassword,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=A78BFA&color=ffffff`,
      joinDate: new Date().toLocaleDateString(),
      gamesPlayed: 0,
      winRate: 0,
      score: 0,
      favoriteGenre: 'Pop Indo',
    };

    users.push(newUser);
    saveUsers(users);

    const token = jwt.sign({ id: newUser.id, email: newUser.email, username: newUser.username, avatar: newUser.avatar }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({ token, user: userWithoutPassword });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ─── Login ────────────────────────────────────────────────────────────────────

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const users = getUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }
    if (!user.password) {
      return res.status(400).json({ message: 'Please login using Google.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, username: user.username, avatar: user.avatar }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json({ token, user: userWithoutPassword });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ─── Google Login ─────────────────────────────────────────────────────────────

export const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: 'Google credential missing.' });
    }

    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    const { email, name, picture } = payload;
    const users = getUsers();
    let user = users.find(u => u.email === email);

    if (!user) {
      user = {
        id: `usr_${Date.now()}`,
        email,
        username: email.split('@')[0],
        name,
        avatar: picture,
        joinDate: new Date().toLocaleDateString(),
        gamesPlayed: 0,
        winRate: 0,
        score: 0,
        favoriteGenre: 'Pop Indo',
      };
      users.push(user);
      saveUsers(users);
    }

    const token = jwt.sign({ id: user.id, email: user.email, username: user.username, avatar: user.avatar }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json({ token, user: userWithoutPassword });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ message: 'Google authentication failed' });
  }
};

// ─── Update Profile ───────────────────────────────────────────────────────────

export const updateProfile = (req, res) => {
  try {
    const { name, username, email, favoriteGenre, notifications } = req.body;
    const userId = req.user.id;

    if (email && !isValidEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format.' });
    }
    if (username && username.trim().length < 3) {
      return res.status(400).json({ message: 'Username must be at least 3 characters.' });
    }

    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }

    const emailExists = users.find(u => u.email === email && u.id !== userId);
    const usernameExists = users.find(u => u.username === username && u.id !== userId);

    if (emailExists) return res.status(400).json({ message: 'Email is already taken.' });
    if (usernameExists) return res.status(400).json({ message: 'Username is already taken.' });

    users[userIndex] = {
      ...users[userIndex],
      name: name || users[userIndex].name,
      username: username || users[userIndex].username,
      email: email || users[userIndex].email,
      favoriteGenre: favoriteGenre || users[userIndex].favoriteGenre,
      notifications: notifications !== undefined ? notifications : users[userIndex].notifications,
    };

    saveUsers(users);

    // Re-issue token with updated username/avatar so socket auth stays current
    const newToken = jwt.sign(
      { id: users[userIndex].id, email: users[userIndex].email, username: users[userIndex].username, avatar: users[userIndex].avatar },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...userWithoutPassword } = users[userIndex];
    res.json({ message: 'Profile updated successfully', user: userWithoutPassword, token: newToken });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ─── Update Avatar ────────────────────────────────────────────────────────────

export const updateAvatar = (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ message: 'No avatar file provided.' });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ message: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' });
    }

    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    users[userIndex].avatar = avatarUrl;
    saveUsers(users);

    // Re-issue token with updated avatar
    const newToken = jwt.sign(
      { id: users[userIndex].id, email: users[userIndex].email, username: users[userIndex].username, avatar: avatarUrl },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...userWithoutPassword } = users[userIndex];
    res.json({ message: 'Avatar updated successfully.', user: userWithoutPassword, token: newToken });
  } catch (error) {
    console.error('Update avatar error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ─── Change Password ──────────────────────────────────────────────────────────

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'Please provide all password fields.' });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'New password and confirmation do not match.' });
    }
    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({ message: 'New password must be at least 8 characters and contain letters and numbers.' });
    }

    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[userIndex];

    if (!user.password) {
      return res.status(400).json({ message: 'This account uses Google Login and does not have a password.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password.' });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    users[userIndex].password = hashedNewPassword;
    saveUsers(users);

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

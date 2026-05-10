import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { getUsers, saveUsers } from '../utils/db.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET || 'echoduel_super_secret_key';

export const register = async (req, res) => {
  try {
    const { email, password, username, name } = req.body;
    
    if (!email || !password || !username || !name) {
      return res.status(400).json({ message: 'All fields are required.' });
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
      favoriteGenre: 'Pop Indo'
    };

    users.push(newUser);
    saveUsers(users);

    const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });

    // Exclude password before sending
    const { password: _, ...userWithoutPassword } = newUser;
    
    res.status(201).json({ token, user: userWithoutPassword });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

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

    // If user registered via Google, they might not have a password
    if (!user.password) {
      return res.status(400).json({ message: 'Please login using Google.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...userWithoutPassword } = user;
    
    res.status(200).json({ token, user: userWithoutPassword });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    
    if (!credential) {
      return res.status(400).json({ message: 'Google credential missing.' });
    }

    // Verify the Google ID token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    
    const email = payload.email;
    const name = payload.name;
    const picture = payload.picture;

    const users = getUsers();
    let user = users.find(u => u.email === email);

    if (!user) {
      // Create a new user if it doesn't exist
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
        favoriteGenre: 'Pop Indo'
      };
      users.push(user);
      saveUsers(users);
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...userWithoutPassword } = user;
    
    res.status(200).json({ token, user: userWithoutPassword });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ message: 'Google authentication failed' });
  }
};

export const updateProfile = (req, res) => {
  try {
    const { name, username, email, favoriteGenre, notifications } = req.body;
    const userId = req.user.id; // from authMiddleware

    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if new email or username is taken by another user
    const emailExists = users.find(u => u.email === email && u.id !== userId);
    const usernameExists = users.find(u => u.username === username && u.id !== userId);

    if (emailExists) return res.status(400).json({ message: 'Email is already taken.' });
    if (usernameExists) return res.status(400).json({ message: 'Username is already taken.' });

    // Update user fields
    users[userIndex] = {
      ...users[userIndex],
      name: name || users[userIndex].name,
      username: username || users[userIndex].username,
      email: email || users[userIndex].email,
      favoriteGenre: favoriteGenre || users[userIndex].favoriteGenre,
      notifications: notifications !== undefined ? notifications : users[userIndex].notifications
    };

    saveUsers(users);

    const { password: _, ...userWithoutPassword } = users[userIndex];
    res.json({ message: 'Profile updated successfully', user: userWithoutPassword });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

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

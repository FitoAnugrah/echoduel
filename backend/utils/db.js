import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir  = path.join(__dirname, '../data');
const dataFile = path.join(dataDir, 'users.json');
const chatFile = path.join(dataDir, 'chats.json');

// Ensure data directory and files exist (sync is fine at startup, before any requests)
if (!fs.existsSync(dataDir))  fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(dataFile)) fs.writeFileSync(dataFile, JSON.stringify([]));
if (!fs.existsSync(chatFile)) fs.writeFileSync(chatFile, JSON.stringify([]));

// ─── Write-lock queues ────────────────────────────────────────────────────────
// Prevents race conditions when multiple requests write to the same file
// concurrently. Each file has its own promise chain so reads are never blocked.
let userWriteQueue  = Promise.resolve();
let chatWriteQueue  = Promise.resolve();

// ─── Users ────────────────────────────────────────────────────────────────────

export const getUsers = () => {
  try {
    const data = fs.readFileSync(dataFile, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
};

export const saveUsers = (users) => {
  // Chain onto the existing queue so concurrent writes are serialised
  userWriteQueue = userWriteQueue.then(() =>
    fsPromises.writeFile(dataFile, JSON.stringify(users, null, 2), 'utf8')
  ).catch((err) => {
    console.error('❌ Failed to save users:', err);
  });
  return userWriteQueue;
};

// ─── Chats ────────────────────────────────────────────────────────────────────

export const getChats = () => {
  try {
    const data = fs.readFileSync(chatFile, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
};

export const saveChats = (chats) => {
  chatWriteQueue = chatWriteQueue.then(() =>
    fsPromises.writeFile(chatFile, JSON.stringify(chats, null, 2), 'utf8')
  ).catch((err) => {
    console.error('❌ Failed to save chats:', err);
  });
  return chatWriteQueue;
};

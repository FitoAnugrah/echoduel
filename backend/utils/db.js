import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataFile = path.join(__dirname, '../data/users.json');
const chatFile = path.join(__dirname, '../data/chats.json');

// Ensure data directory and files exist
if (!fs.existsSync(path.join(__dirname, '../data'))) {
  fs.mkdirSync(path.join(__dirname, '../data'));
}
if (!fs.existsSync(dataFile)) {
  fs.writeFileSync(dataFile, JSON.stringify([]));
}
if (!fs.existsSync(chatFile)) {
  fs.writeFileSync(chatFile, JSON.stringify([]));
}

export const getUsers = () => {
  try {
    const data = fs.readFileSync(dataFile, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
};

export const saveUsers = (users) => {
  fs.writeFileSync(dataFile, JSON.stringify(users, null, 2));
};

export const getChats = () => {
  try {
    const data = fs.readFileSync(chatFile, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
};

export const saveChats = (chats) => {
  fs.writeFileSync(chatFile, JSON.stringify(chats, null, 2));
};

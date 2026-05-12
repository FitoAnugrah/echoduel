import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataFile = path.join(__dirname, 'backend', 'data', 'users.json');

const users = JSON.parse(fs.readFileSync(dataFile, 'utf8'));

const dummyUsers = [
  { id: 'usr_dummy_1', email: 'echo1@dummy.com', username: 'Lyra', name: 'Lyra', avatar: 'https://ui-avatars.com/api/?name=Lyra&background=8b5cf6&color=ffffff', score: 14500, gamesPlayed: 32, winRate: 85, wins: 27 },
  { id: 'usr_dummy_2', email: 'echo2@dummy.com', username: 'Nova', name: 'Nova', avatar: 'https://ui-avatars.com/api/?name=Nova&background=f97316&color=ffffff', score: 12100, gamesPlayed: 28, winRate: 71, wins: 20 },
  { id: 'usr_dummy_3', email: 'echo3@dummy.com', username: 'Pulse', name: 'Pulse', avatar: 'https://ui-avatars.com/api/?name=Pulse&background=34d399&color=ffffff', score: 9800, gamesPlayed: 25, winRate: 64, wins: 16 },
  { id: 'usr_dummy_4', email: 'echo4@dummy.com', username: 'Melody', name: 'Melody', avatar: 'https://ui-avatars.com/api/?name=Melody&background=38bdf8&color=ffffff', score: 8500, gamesPlayed: 22, winRate: 59, wins: 13 },
  { id: 'usr_dummy_5', email: 'echo5@dummy.com', username: 'BeatMaster', name: 'Beat Master', avatar: 'https://ui-avatars.com/api/?name=Beat+Master&background=ec4899&color=ffffff', score: 6200, gamesPlayed: 18, winRate: 55, wins: 10 },
  { id: 'usr_dummy_6', email: 'echo6@dummy.com', username: 'Rhythm', name: 'Rhythm', avatar: 'https://ui-avatars.com/api/?name=Rhythm&background=eab308&color=ffffff', score: 4100, gamesPlayed: 15, winRate: 46, wins: 7 },
  { id: 'usr_dummy_7', email: 'echo7@dummy.com', username: 'Chord', name: 'Chord', avatar: 'https://ui-avatars.com/api/?name=Chord&background=ef4444&color=ffffff', score: 3200, gamesPlayed: 10, winRate: 40, wins: 4 },
  { id: 'usr_dummy_8', email: 'echo8@dummy.com', username: 'Tempo', name: 'Tempo', avatar: 'https://ui-avatars.com/api/?name=Tempo&background=6366f1&color=ffffff', score: 2500, gamesPlayed: 8, winRate: 37, wins: 3 },
  { id: 'usr_dummy_9', email: 'echo9@dummy.com', username: 'Harmony', name: 'Harmony', avatar: 'https://ui-avatars.com/api/?name=Harmony&background=14b8a6&color=ffffff', score: 1800, gamesPlayed: 5, winRate: 60, wins: 3 }
];

const newUsers = [...users];
for (const dummy of dummyUsers) {
  if (!newUsers.find(u => u.username === dummy.username)) {
    newUsers.push(dummy);
  }
}

fs.writeFileSync(dataFile, JSON.stringify(newUsers, null, 2));
console.log('Dummy users added successfully.');

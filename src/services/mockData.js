export const mockUser = {
    id: 'user_01',
    username: 'echo_player',
    name: 'Echo Player',
    email: 'echo.player@example.com',
    avatar: 'https://ui-avatars.com/api/?name=Echo+Player&background=A78BFA&color=ffffff',
    score: 8560,
    level: 12,
    status: 'online',
    joinDate: 'January 14, 2025',
    gamesPlayed: 198,
    winRate: 78,
    favoriteGenre: 'K-Pop',
};

export const mockUsers = [
    { id: 'user_02', username: 'lyra', name: 'Lyra', avatar: 'https://ui-avatars.com/api/?name=Lyra&background=8b5cf6&color=ffffff', online: true },
    { id: 'user_03', username: 'pulse', name: 'Pulse', avatar: 'https://ui-avatars.com/api/?name=Pulse&background=34d399&color=ffffff', online: false },
    { id: 'user_04', username: 'nova', name: 'Nova', avatar: 'https://ui-avatars.com/api/?name=Nova&background=f97316&color=ffffff', online: true },
    { id: 'user_05', username: 'beatmaster', name: 'Beat Master', avatar: 'https://ui-avatars.com/api/?name=Beat+Master&background=ec4899&color=ffffff', online: true },
    { id: 'user_06', username: 'melody', name: 'Melody', avatar: 'https://ui-avatars.com/api/?name=Melody&background=38bdf8&color=ffffff', online: false },
];

export const mockRooms = [{
        id: 'room_1',
        name: 'Neon Beat Arena',
        host: 'Lyra',
        genre: 'K-Pop',
        difficulty: 'Medium',
        maxPlayers: 4,
        currentPlayers: 2,
        mode: 'Duel',
    },
    {
        id: 'room_2',
        name: 'Retro Remix',
        host: 'Pulse',
        genre: 'Pop Barat',
        difficulty: 'Hard',
        maxPlayers: 4,
        currentPlayers: 4,
        mode: 'Ranked',
    },
    {
        id: 'room_3',
        name: 'Sunset Pop Lounge',
        host: 'Nova',
        genre: 'Pop Indo',
        difficulty: 'Easy',
        maxPlayers: 2,
        currentPlayers: 1,
        mode: 'Casual',
    },
    {
        id: 'room_4',
        name: 'Rock Riot',
        host: 'Echo Player',
        genre: 'Rock',
        difficulty: 'Medium',
        maxPlayers: 4,
        currentPlayers: 3,
        mode: 'Duel',
    },
];

export const mockFriends = [
    { id: 'user_02', name: 'Lyra', username: 'lyra', avatar: 'https://ui-avatars.com/api/?name=Lyra&background=8b5cf6&color=ffffff', online: true, score: 9120 },
    { id: 'user_03', name: 'Pulse', username: 'pulse', avatar: 'https://ui-avatars.com/api/?name=Pulse&background=34d399&color=ffffff', online: false, score: 8340 },
    { id: 'user_04', name: 'Nova', username: 'nova', avatar: 'https://ui-avatars.com/api/?name=Nova&background=f97316&color=ffffff', online: true, score: 9970 },
];

export const mockFriendRequests = {
    incoming: [
        { id: 'user_05', username: 'beatmaster', name: 'Beat Master', avatar: 'https://ui-avatars.com/api/?name=Beat+Master&background=ec4899&color=ffffff', online: true },
    ],
    outgoing: [
        { id: 'user_06', username: 'melody', name: 'Melody', avatar: 'https://ui-avatars.com/api/?name=Melody&background=38bdf8&color=ffffff', online: false, status: 'pending' },
    ],
};

export const mockConversations = [
    { id: 'user_02', username: 'lyra', avatar: 'https://ui-avatars.com/api/?name=Lyra&background=8b5cf6&color=ffffff', lastMessage: 'Ready for a quick match?', unread: 2, online: true },
    { id: 'user_03', username: 'pulse', avatar: 'https://ui-avatars.com/api/?name=Pulse&background=34d399&color=ffffff', lastMessage: 'Good game!', unread: 0, online: false },
    { id: 'user_04', username: 'nova', avatar: 'https://ui-avatars.com/api/?name=Nova&background=f97316&color=ffffff', lastMessage: 'I found a hidden track.', unread: 1, online: true },
];

export const mockChatHistory = {
    user_02: [
        { id: 'chat_1', author: 'Lyra', content: 'Ready for a quick match?', timestamp: '2:15 PM', isOwn: false, avatar: 'https://ui-avatars.com/api/?name=Lyra&background=8b5cf6&color=ffffff' },
        { id: 'chat_2', author: 'You', content: 'Absolutely, let’s go!', timestamp: '2:16 PM', isOwn: true, avatar: 'https://ui-avatars.com/api/?name=Echo+Player&background=A78BFA&color=ffffff' },
    ],
    user_03: [
        { id: 'chat_3', author: 'Pulse', content: 'Good game!', timestamp: '1:05 PM', isOwn: false, avatar: 'https://ui-avatars.com/api/?name=Pulse&background=34d399&color=ffffff' },
    ],
    user_04: [
        { id: 'chat_4', author: 'Nova', content: 'I found a hidden track in the lobby mode.', timestamp: '3:12 PM', isOwn: false, avatar: 'https://ui-avatars.com/api/?name=Nova&background=f97316&color=ffffff' },
    ],
};

export const mockMessages = [{
        id: 'msg_1',
        author: 'Lyra',
        text: 'Ready for a quick EchoDuel match?',
        timestamp: '2:15 PM',
        isOwn: false,
    },
    {
        id: 'msg_2',
        author: 'You',
        text: 'Absolutely, let’s go!',
        timestamp: '2:16 PM',
        isOwn: true,
    },
    {
        id: 'msg_3',
        author: 'Nova',
        text: 'I found a hidden track in the lobby mode.',
        timestamp: '2:18 PM',
        isOwn: false,
    },
];

export const mockLeaderboard = [
    { id: 'user_04', rank: 1, username: 'nova', name: 'Nova', avatar: 'https://ui-avatars.com/api/?name=Nova&background=f97316&color=ffffff', score: 12500, correctAnswers: 58, winRate: 92 },
    { id: 'user_01', rank: 2, username: 'echo_player', name: 'Echo Player', avatar: 'https://ui-avatars.com/api/?name=Echo+Player&background=A78BFA&color=ffffff', score: 8560, correctAnswers: 44, winRate: 78 },
    { id: 'user_02', rank: 3, username: 'lyra', name: 'Lyra', avatar: 'https://ui-avatars.com/api/?name=Lyra&background=8b5cf6&color=ffffff', score: 8320, correctAnswers: 40, winRate: 74 },
    { id: 'user_03', rank: 4, username: 'pulse', name: 'Pulse', avatar: 'https://ui-avatars.com/api/?name=Pulse&background=34d399&color=ffffff', score: 8080, correctAnswers: 38, winRate: 70 },
    { id: 'user_05', rank: 5, username: 'beatmaster', name: 'Beat Master', avatar: 'https://ui-avatars.com/api/?name=Beat+Master&background=ec4899&color=ffffff', score: 7820, correctAnswers: 34, winRate: 69 },
    { id: 'user_06', rank: 6, username: 'melody', name: 'Melody', avatar: 'https://ui-avatars.com/api/?name=Melody&background=38bdf8&color=ffffff', score: 7640, correctAnswers: 31, winRate: 66 },
];
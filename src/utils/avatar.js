export const getAvatarUrl = (avatarPath, fallbackName = 'Player') => {
  if (!avatarPath) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName)}&background=A78BFA&color=ffffff`;
  }
  if (avatarPath.startsWith('http')) {
    return avatarPath;
  }
  return `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${avatarPath}`;
};

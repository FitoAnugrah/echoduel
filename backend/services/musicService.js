export const fetchTracksByGenre = async (genre, count = 5) => {
  try {
    // We map our app genres to good search terms for iTunes
    const searchMap = {
      'Pop Indo': 'pop indonesia',
      'Pop Barat': 'pop hits',
      'K-Pop': 'kpop',
      'Rock': 'rock classics',
      'All': 'hits'
    };

    const term = searchMap[genre] || genre;
    
    // Fetch 50 songs to give us a good pool to pick random tracks from
    const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&limit=50`);
    
    if (!response.ok) {
      throw new Error(`iTunes API responded with status: ${response.status}`);
    }

    const data = await response.json();

    // Filter tracks that actually have a preview audio
    const validTracks = data.results.filter(track => track.previewUrl && track.trackName);

    // Shuffle the valid tracks array randomly
    for (let i = validTracks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [validTracks[i], validTracks[j]] = [validTracks[j], validTracks[i]];
    }

    // Pick the requested amount of tracks and format the object
    const selectedTracks = validTracks.slice(0, count).map(track => {
      // iTunes provides low-res art (100x100). We replace the string to get high-res (600x600)
      const highResArtwork = track.artworkUrl100 ? track.artworkUrl100.replace('100x100bb', '600x600bb') : '';
      
      return {
        id: track.trackId,
        trackName: track.trackName,
        artistName: track.artistName,
        audioUrl: track.previewUrl,
        coverArt: highResArtwork
      };
    });

    return selectedTracks;
  } catch (error) {
    console.error('Error fetching tracks from iTunes:', error);
    return [];
  }
};

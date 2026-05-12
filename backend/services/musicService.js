const DEEZER_TIMEOUT_MS = 8000; // 8 seconds

// Kurasi artist dibagi menjadi 3 TIER berdasarkan seberapa mainstream/populer mereka
const GENRE_ARTISTS = {
  'Pop Indo': {
    Easy: ['Sheila On 7', 'Tulus', 'Mahalini', 'Lyodra', 'Tiara Andini', 'Dewa 19', 'NOAH', 'Judika', 'Andmesh', 'Rizky Febian'],
    Medium: ['Nadin Amizah', 'Hindia', 'Pamungkas', 'Ardhito Pramono', 'Juicy Luicy', 'Kunto Aji', 'Yura Yunita', 'Sal Priadi', 'Vierra', 'Geisha', 'Gigi'],
    Hard: ['Danilla', 'Mocca', 'Sore', 'Payung Teduh', 'The Adams', 'White Shoes & The Couples Company', 'Lomba Sihir', 'Reality Club', 'Efek Rumah Kaca', 'Barasuara']
  },
  'Pop Barat': {
    Easy: ['Taylor Swift', 'Ed Sheeran', 'Ariana Grande', 'Bruno Mars', 'Justin Bieber', 'The Weeknd', 'Dua Lipa', 'Coldplay'],
    Medium: ['Lauv', 'Troye Sivan', 'LANY', 'Conan Gray', 'Bazzi', 'Jeremy Zucker', 'Alec Benjamin', 'Sabrina Carpenter'],
    Hard: ['Wallows', 'COIN', 'Dayglow', 'The Band CAMINO', 'Valley', 'Hippo Campus', 'Peach Pit', 'Declan McKenna']
  },
  'K-Pop': {
    Easy: ['BTS', 'BLACKPINK', 'TWICE', 'SEVENTEEN', 'EXO', 'NewJeans', 'Stray Kids', 'Red Velvet'],
    Medium: ['ITZY', 'TOMORROW X TOGETHER', 'ENHYPEN', 'aespa', 'IVE', 'LE SSERAFIM', 'NCT DREAM', 'ATEEZ'],
    Hard: ['Dreamcatcher', 'STAYC', 'LOONA', 'P1Harmony', 'KARD', 'ONEUS', 'EVERGLOW', 'Billlie']
  },
  'Rock': {
    Easy: ['Queen', 'Linkin Park', 'Nirvana', 'Guns N Roses', 'AC/DC', 'Metallica', 'Aerosmith', 'Green Day'],
    Medium: ['Arctic Monkeys', 'The Strokes', 'Foo Fighters', 'Muse', 'Red Hot Chili Peppers', 'The Killers', 'Radiohead', 'My Chemical Romance'],
    Hard: ['Royal Blood', 'Nothing But Thieves', 'IDLES', 'Fontaines D.C.', 'The Black Keys', 'Queens of the Stone Age', 'Deftones', 'Gojira']
  }
};

export const fetchTracks = async (genre, targetDifficulty, count = 5) => {
  console.log(`Fetching Deezer Genre: ${genre}, Difficulty: ${targetDifficulty}`);

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      // Dapatkan list artist berdasarkan Genre dan Difficulty yang dipilih
      let genreData = GENRE_ARTISTS[genre] || GENRE_ARTISTS['Pop Barat'];
      let artistsToFetch = genreData[targetDifficulty] || genreData.Easy;
      
      // Acak urutan artist dalam tier tersebut, lalu ambil maksimal 5 artist
      const shuffledArtists = [...artistsToFetch].sort(() => 0.5 - Math.random());
      const selectedArtists = shuffledArtists.slice(0, 5);
      
      // Ambil top 40 lagu dari masing-masing artist yang terpilih
      const fetchPromises = selectedArtists.map(async (artistName) => {
        const url = `https://api.deezer.com/search?q=artist:"${encodeURIComponent(artistName)}"&limit=40`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), DEEZER_TIMEOUT_MS);
        
        try {
          const response = await fetch(url, { signal: controller.signal });
          clearTimeout(timeoutId);
          if (!response.ok) return [];
          const data = await response.json();
          return data.data || [];
        } catch (e) {
          return []; // Lanjut ke artist lain jika gagal
        }
      });

      const results = await Promise.all(fetchPromises);
      const allFetchedTracks = results.flat();

      // Filter ketat agar lagu punya preview dan milik artist yang kita panggil
      let validTracks = allFetchedTracks.filter(track => {
        if (!track.preview || !track.title) return false;
        return selectedArtists.some(sa => track.artist.name.toLowerCase() === sa.toLowerCase());
      });

      // Filter duplikat berdasarkan ID
      const uniqueIds = new Set();
      validTracks = validTracks.filter(track => {
        if (uniqueIds.has(track.id)) return false;
        uniqueIds.add(track.id);
        return true;
      });

      if (validTracks.length === 0) {
        throw new Error("Gagal mengambil lagu ber-preview dari Deezer");
      }

      // Opsional: Untuk membuat mode Hard *ekstra* sulit, kita balikkan sorting berdasarkan rank
      if (targetDifficulty === 'Hard') {
        // Ambil lagu yang paling TIDAK populer dari penyanyi indie/niche tersebut
        validTracks.sort((a, b) => a.rank - b.rank); 
      } else {
        // Easy / Medium mengambil hits terbesar dari penyanyi di tier-nya
        validTracks.sort((a, b) => b.rank - a.rank);
      }

      // Fisher-Yates shuffle untuk mengambil lagu secara acak dari kumpulan (agar tidak itu-itu saja)
      for (let i = validTracks.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [validTracks[i], validTracks[j]] = [validTracks[j], validTracks[i]];
      }

      return validTracks.slice(0, count).map((track) => ({
        id: track.id,
        trackName: track.title,
        artistName: track.artist.name,
        audioUrl: track.preview,
        coverArt: track.album.cover_xl || track.album.cover_big || track.album.cover_medium || '',
        difficulty: targetDifficulty,
      }));
    } catch (error) {
      console.error("API Error Detail:", error);
      console.error("ALASAN GAGAL:", error.message);
      const isLastAttempt = attempt === 2;
      if (isLastAttempt) {
        throw new Error("Gagal mengambil lagu dari Deezer API setelah 2x percobaan");
      }
      console.warn(`⚠️ Deezer fetch attempt ${attempt} failed, retrying... (${error.message})`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
};

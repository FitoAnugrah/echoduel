const DEEZER_TIMEOUT_MS = 8000; // 8 seconds

const GENRE_ARTISTS = {
  'Pop Indo': [
    'Sheila On 7', 'Tulus', 'Mahalini', 'Lyodra', 'Tiara Andini', 'Dewa 19', 
    'NOAH', 'Judika', 'Andmesh', 'Rizky Febian', 'Nadin Amizah', 'Hindia', 
    'Pamungkas', 'Yura Yunita', 'Raisa', 'Afgan', 'Ardhito Pramono', 'Juicy Luicy',
    'Kunto Aji', 'Sal Priadi', 'Vierra', 'Geisha', 'Gigi', 'Danilla', 'Mocca', 
    'Sore', 'Payung Teduh', 'The Adams', 'White Shoes & The Couples Company', 
    'Lomba Sihir', 'Reality Club', 'Efek Rumah Kaca', 'Barasuara', 'Fourtwnty', 'Fiersa Besari'
  ],
  'Pop Barat': [
    'Taylor Swift', 'Ed Sheeran', 'Ariana Grande', 'Bruno Mars', 'Justin Bieber', 
    'The Weeknd', 'Dua Lipa', 'Coldplay', 'Billie Eilish', 'Shawn Mendes', 
    'Maroon 5', 'Katy Perry', 'Lady Gaga', 'Harry Styles', 'Lauv', 'Troye Sivan', 
    'LANY', 'Conan Gray', 'Bazzi', 'Jeremy Zucker', 'Alec Benjamin', 'Sabrina Carpenter',
    'Wallows', 'COIN', 'Dayglow', 'The Band CAMINO', 'Valley', 'Hippo Campus', 
    'Peach Pit', 'Declan McKenna', 'Rex Orange County', 'Clairo', 'girl in red'
  ],
  'K-Pop': [
    'BTS', 'BLACKPINK', 'TWICE', 'SEVENTEEN', 'EXO', 'NewJeans', 'Stray Kids', 
    'Red Velvet', 'ITZY', 'TOMORROW X TOGETHER', 'ENHYPEN', 'aespa', 'IVE', 'NCT DREAM',
    'LE SSERAFIM', 'ATEEZ', 'Dreamcatcher', 'STAYC', 'LOONA', 'P1Harmony', 'KARD', 
    'ONEUS', 'EVERGLOW', 'Billlie', 'KISS OF LIFE', 'NMIXX', 'BOYNEXTDOOR', 'RIIZE'
  ],
  'Rock': [
    'Queen', 'Linkin Park', 'Nirvana', 'Guns N Roses', 'AC/DC', 'Metallica', 
    'Aerosmith', 'Green Day', 'Arctic Monkeys', 'The Strokes', 'Foo Fighters', 
    'Muse', 'Red Hot Chili Peppers', 'The Killers', 'Radiohead', 'My Chemical Romance',
    'Royal Blood', 'Nothing But Thieves', 'IDLES', 'Fontaines D.C.', 'The Black Keys', 
    'Queens of the Stone Age', 'Deftones', 'Gojira', 'Bring Me The Horizon', 'Paramore'
  ],
  'Indonesia Populer': [
    'Bernadya', 'Juicy Luicy', 'Sal Priadi', 'Nadhif Basalamah', 'Mahalini', 
    'Tiara Andini', 'Lyodra', 'Keisya Levronka', 'Yura Yunita', 'Hindia', 
    'Nadin Amizah', 'Maliq & D\'Essentials', 'Baale', 'Kaleb J', 'Anggi Marito', 
    'Ghea Indrawari', 'Awdella', 'Idgitaf', 'Batas Senja', 'Feby Putri', 'Soegi Bornean', 
    'Lomba Sihir', 'Hal', 'Rizky Febian', 'Budi Doremi', 'Virgoun', 'Last Child',
    'JKT48', 'DJ Opus', 'DJ Nofin Asia', 'Glenn Fredly', 'Tulus', 'Vierra', 
    'Vierratale', 'Wali', 'Kangen Band'
  ],
  'Global Populer': [
    'Taylor Swift', 'The Weeknd', 'Drake', 'Bad Bunny', 'BTS', 'Ed Sheeran', 
    'Ariana Grande', 'Post Malone', 'Dua Lipa', 'Justin Bieber', 'Billie Eilish', 
    'Eminem', 'Rihanna', 'Bruno Mars', 'Coldplay', 'Shakira', 'Beyoncé', 
    'Lady Gaga', 'Harry Styles', 'Kendrick Lamar', 'Travis Scott', 'Adele',
    'Imagine Dragons', 'Maroon 5', 'Katy Perry', 'Olivia Rodrigo', 'Doja Cat',
    'SZA', 'Miley Cyrus', 'Lana Del Rey', 'David Guetta', 'Calvin Harris',
    'BLACKPINK', 'NewJeans', 'Rosalía', 'J Balvin'
  ],
  'Jazz': [
    'Michael Bublé', 'Frank Sinatra', 'Norah Jones', 'Louis Armstrong', 'Ella Fitzgerald',
    'Diana Krall', 'Jamie Cullum', 'Miles Davis', 'John Coltrane', 'Tompi', 
    'Maliq & D\'Essentials', 'Indra Lesmana', 'Ardhito Pramono', 'Barry Likumahuwa', 'Syaharani'
  ],
  'Hip Hop': [
    'Eminem', 'Drake', 'Kendrick Lamar', 'Travis Scott', 'Post Malone', 'Snoop Dogg', 
    'Jay-Z', 'Kanye West', 'Tupac', 'J. Cole', 'Rich Brian', 'Ramengvrl', 'Saykoji', 
    'Tuan Tigabelas', 'Laze', 'Warren Hue', 'Iwa K'
  ],
  'Hip Dut': [
    'NDX A.K.A.', 'Pendhoza', 'Jogja Hip Hop Foundation', 'Bravesboy', 'Ndarboy Genk',
    'Guyon Waton', 'Denny Caknan', 'Happy Asmara', 'Feel Koplo', 'Aftershine', 
    'GildCoustic', 'Wawes', 'OM Wawes', 'Didi Kempot'
  ],
  'Alt Rock Indo': [
    'Efek Rumah Kaca', 'Barasuara', 'The Adams', 'Seringai', 'Burgerkill', 'Koil',
    'The S.I.G.I.T', 'Kelompok Penerbang Roket', 'Padi', 'Cokelat', 'Nidji', 
    'Endank Soekamti', 'Superman Is Dead', 'Gigi', 'Slank', 'Kangen Band', 'Reality Club',
    'Fourtwnty', 'Fiersa Besari', 'Jason Ranti', 'Iwan Fals'
  ]
};

export const fetchTracks = async (genre, targetDifficulty, count = 5) => {
  console.log(`Fetching Deezer Genre: ${genre}, Difficulty: ${targetDifficulty}`);

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      // Cek apakah genre ada di preset kita
      let selectedArtists = [];
      let limitPerArtist = 40;

      if (GENRE_ARTISTS[genre]) {
        // Jika berupa genre preset, ambil 15 artis acak
        const shuffledArtists = [...GENRE_ARTISTS[genre]].sort(() => 0.5 - Math.random());
        selectedArtists = shuffledArtists.slice(0, 15);
      } else {
        // Jika tidak ada di preset, anggap string tersebut adalah NAMA ARTIS spesifik
        // Hapus prefix "Artist: " jika ada (untuk UI formatter)
        const artistName = genre.replace(/^Artist:\s*/i, '').trim();
        selectedArtists = [artistName];
        limitPerArtist = 100; // Ambil lebih banyak lagu karena hanya 1 artis
      }
      
      // Ambil lagu dari artis-artis yang terpilih
      const fetchPromises = selectedArtists.map(async (artistName) => {
        const url = `https://api.deezer.com/search?q=artist:"${encodeURIComponent(artistName)}"&limit=${limitPerArtist}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), DEEZER_TIMEOUT_MS);
        
        try {
          const response = await fetch(url, { signal: controller.signal });
          clearTimeout(timeoutId);
          if (!response.ok) return [];
          const data = await response.json();
          return data.data || [];
        } catch (e) {
          return [];
        }
      });

      const results = await Promise.all(fetchPromises);
      const allFetchedTracks = results.flat();

      // Filter ketat agar lagu punya preview dan milik artist yang kita panggil
      let validTracks = allFetchedTracks.filter(track => {
        if (!track.preview || !track.title || !track.rank) return false;
        
        // Jika mode spesifik artist, berikan sedikit kelonggaran (karena Deezer kadang mengembalikan feat. artist)
        // Kita cek apakah nama artis pencarian ada di dalam nama artis lagu
        return selectedArtists.some(sa => track.artist.name.toLowerCase().includes(sa.toLowerCase()));
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

      // Urutkan lagu berdasarkan Popularitas (Rank) dari TERTINGGI ke TERENDAH
      validTracks.sort((a, b) => b.rank - a.rank);

      const totalTracks = validTracks.length;
      let poolStart = 0;
      let poolEnd = totalTracks;

      // Logika Difficulty berdasarkan Popularitas Lagu:
      // - Easy: Ambil dari 30% lagu paling populer (Rank Tertinggi)
      // - Medium: Ambil dari 40% lagu di pertengahan
      // - Hard: Ambil dari 30% lagu paling tidak populer (Rank Terendah)
      if (targetDifficulty === 'Easy') {
        poolEnd = Math.max(count, Math.floor(totalTracks * 0.3));
      } else if (targetDifficulty === 'Medium') {
        poolStart = Math.floor(totalTracks * 0.3);
        poolEnd = Math.max(poolStart + count, Math.floor(totalTracks * 0.7));
      } else if (targetDifficulty === 'Hard') {
        poolStart = Math.floor(totalTracks * 0.7);
        poolEnd = totalTracks;
      }

      // Potong array sesuai tingkat kesulitan
      let difficultyPool = validTracks.slice(poolStart, poolEnd);

      // Jika pool terlalu kecil (kurang dari jumlah ronde), ambil cadangan dari pool sebelumnya
      if (difficultyPool.length < count) {
        difficultyPool = validTracks; // Fallback gunakan semua jika tidak cukup
      }

      // Acak lagu-lagu di dalam pool yang terpilih
      for (let i = difficultyPool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [difficultyPool[i], difficultyPool[j]] = [difficultyPool[j], difficultyPool[i]];
      }

      return difficultyPool.slice(0, count).map((track) => ({
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

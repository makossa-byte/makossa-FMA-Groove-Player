import type { Track } from '../types';

// IMPORTANT: To use the live FMA API, you need an API key.
// Request one here: https://freemusicarchive.org/api
// Once you have your key, replace the placeholder below.
const FMA_API_KEY = 'YOUR_FMA_API_KEY_HERE';
const API_BASE_URL = 'https://freemusicarchive.org/api/get/tracks.json';

const mockTracks: Track[] = [
  {
    track_id: '107031',
    track_title: 'Do it',
    artist_name: 'Monplaisir',
    album_title: 'single',
    track_duration: '00:03:07',
    track_image_file: 'https://freemusicarchive.org/image/?file=images%2Falbums%2FMonplaisir_-_single_-_20190116191929316.jpg&width=290&height=290&type=album',
    track_listen_url: 'https://storage.googleapis.com/automotive-media/The_Messenger.mp3',
    genres: ['Electronic', 'Pop']
  },
  {
    track_id: '102141',
    track_title: 'Running',
    artist_name: 'Jahzzar',
    album_title: 'Hi-Fi',
    track_duration: '00:03:04',
    track_image_file: 'https://freemusicarchive.org/image/?file=images%2Falbums%2FJahzzar_-_Hi-Fi_-_20181017163855503.jpg&width=290&height=290&type=album',
    track_listen_url: 'https://storage.googleapis.com/automotive-media/Jazz_In_Paris.mp3',
    genres: ['Electronic', 'Instrumental']
  },
  {
    track_id: '173256',
    track_title: 'Action',
    artist_name: 'Coma-Media',
    album_title: 'Action',
    track_duration: '00:02:11',
    track_image_file: 'https://freemusicarchive.org/image/?file=images%2Falbums%2FComa-Media_-_Action_-_20220202102143891.jpg&width=290&height=290&type=album',
    track_listen_url: 'https://storage.googleapis.com/media-session/big-buck-bunny/prelude.mp3',
    genres: ['Rock', 'Cinematic']
  },
  {
    track_id: '107029',
    track_title: 'OK',
    artist_name: 'Monplaisir',
    album_title: 'single',
    track_duration: '00:03:00',
    track_image_file: 'https://freemusicarchive.org/image/?file=images%2Falbums%2FMonplaisir_-_single_-_20190116191929316.jpg&width=290&height=290&type=album',
    track_listen_url: 'https://storage.googleapis.com/automotive-media/All_That_Jazz.mp3',
    genres: ['Electronic', 'Pop']
  },
  {
    track_id: '173243',
    track_title: 'Powerful trap',
    artist_name: 'Coma-Media',
    album_title: 'Powerful trap',
    track_duration: '00:02:43',
    track_image_file: 'https://freemusicarchive.org/image/?file=images%2Falbums%2FComa-Media_-_Powerful_trap_-_20220201111621644.jpg&width=290&height=290&type=album',
    track_listen_url: 'https://storage.googleapis.com/media-session/elephants-dream/the-wires.mp3',
    genres: ['Hip-Hop', 'Instrumental']
  },
  {
    track_id: '172826',
    track_title: 'Upbeat and Happy',
    artist_name: 'Lesfm',
    album_title: 'Upbeat and Happy',
    track_duration: '00:02:14',
    track_image_file: 'https://freemusicarchive.org/image/?file=images%2Falbums%2FLesfm_-_Upbeat_and_Happy_-_2022010492543884.jpg&width=290&height=290&type=album',
    track_listen_url: 'https://storage.googleapis.com/media-session/sintel/sintel-short.mp3',
    genres: ['Pop', 'Instrumental']
  }
];

// This function currently returns mock data.
// To use the live API, replace the mock logic with the commented-out fetch call.
export const searchTracks = async ({ query, genre }: { query: string; genre: string }): Promise<Track[]> => {
  console.log(`Searching for query: "${query}" in genre: "${genre}"`);

  // --- MOCK DATA IMPLEMENTATION ---
  return new Promise((resolve) => {
    setTimeout(() => {
      let results: Track[] = [...mockTracks];
      const lowerCaseQuery = query.toLowerCase();
      const lowerCaseGenre = genre.toLowerCase();

      // 1. Filter by genre if one is selected
      if (lowerCaseGenre && lowerCaseGenre !== "all genres") {
        results = results.filter(track =>
          track.genres.some(g => g.toLowerCase() === lowerCaseGenre)
        );
      }

      // 2. Filter by keyword on the remaining tracks
      if (lowerCaseQuery) {
        results = results.filter(
          (track) =>
            track.track_title.toLowerCase().includes(lowerCaseQuery) ||
            track.artist_name.toLowerCase().includes(lowerCaseQuery)
        );
      }
      
      resolve(results);
    }, 500); // Simulate network delay
  });
  
  /*
  // --- LIVE API IMPLEMENTATION ---
  if (FMA_API_KEY === 'YOUR_FMA_API_KEY_HERE') {
    console.warn('FMA API key is not set. Returning mock data.');
    return mockTracks; // Fallback to mock data
  }
  
  const params = new URLSearchParams({
    api_key: FMA_API_KEY,
    limit: '20'
  });
  if (genre) {
    params.set('genres', genre);
  }
  if (query) {
    params.set('q', query);
  }
  
  const url = `${API_BASE_URL}?${params.toString()}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    const data = await response.json();
    
    if(data.dataset && Array.isArray(data.dataset)){
        return data.dataset.map((item: any) => ({
            track_id: item.track_id,
            track_title: item.track_title,
            artist_name: item.artist_name,
            album_title: item.album_title,
            track_duration: item.track_duration,
            track_image_file: item.track_image_file,
            track_listen_url: item.track_listen_url,
            genres: (item.track_genres || []).map((g: any) => g.genre_title)
        }));
    }
    return [];

  } catch (error) {
    console.error("Error fetching from FMA API:", error);
    return [];
  }
  */
};


const mockLyricsDb: Record<string, string> = {
  '107031': `(Verse 1)
Got the rhythm in my feet
And I'm walking down the street
Sun is shining, feeling neat
Can't be beat, can't be beat

(Chorus)
Just do it, do it, do it
There's really nothing to it
Just get up and go through it
Yeah, do it, do it, do it`,
  '102141': `(Instrumental)`,
  '173256': `(Epic instrumental buildup)

(Sudden stop)

(Explosion of sound)`,
  '172826': `(Verse 1)
Woke up this morning, sky was bright
Everything's gonna be alright
Got a smile on my face, a spring in my step
Yeah, today's a good day, you can bet

(Chorus)
Feeling upbeat and happy
Nothing's gonna get me down
Singing a cheerful snappy
Tune all over town!`
};

export const fetchLyrics = (trackId: string): Promise<string | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockLyricsDb[trackId] || null);
    }, 800); // Simulate network delay for fetching lyrics
  });
};
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { TrackList } from './components/TrackList';
import { Player } from './components/Player';
import { QueuePanel } from './components/QueuePanel';
import { searchTracks } from './services/fmaService';
import type { Track } from './types';

const App: React.FC = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [trackProgress, setTrackProgress] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.8);
  const [isQueueVisible, setIsQueueVisible] = useState<boolean>(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);
  const isSeeking = useRef(false);

  const currentTrack = currentTrackIndex !== null ? playlist[currentTrackIndex] : null;

  const loadInitialTracks = useCallback(async () => {
    setIsLoading(true);
    try {
      const initialTracks = await searchTracks('electronic', 'genre');
      setTracks(initialTracks);
      // We start with an empty queue, user can build it or start playing from search
      if (playlist.length === 0) {
        setPlaylist(initialTracks);
        setCurrentTrackIndex(0);
      }
    } catch (error) {
      console.error('Failed to load initial tracks:', error);
      setPlaybackError("Failed to load initial music.");
    } finally {
      setIsLoading(false);
    }
  }, [playlist.length]);

  useEffect(() => {
    // Only load initial tracks if the playlist is empty to not override user's queue
    if (playlist.length === 0) {
        loadInitialTracks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  useEffect(() => {
    if (audioRef.current) {
        audioRef.current.volume = volume;
    }
  }, [volume]);
  
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      if (audio.readyState > 0) {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            if (error.name !== 'AbortError') {
              console.error("Error playing audio:", error);
              setPlaybackError("Playback failed. Please try another track.");
              setIsPlaying(false);
            }
          });
        }
      }
    } else {
      audio.pause();
    }
  }, [isPlaying, currentTrack?.track_id]);

  const handleSearch = async (query: string, searchBy: 'keyword' | 'genre' = 'keyword') => {
    setIsLoading(true);
    setTracks([]);
    try {
      const results = await searchTracks(query, searchBy);
      setTracks(results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const playTrack = (track: Track) => {
    setPlaybackError(null);
    const indexInPlaylist = playlist.findIndex(t => t.track_id === track.track_id);
    
    if (indexInPlaylist !== -1) {
        setCurrentTrackIndex(indexInPlaylist);
    } else {
        const newTrackIndex = currentTrackIndex === null ? 0 : currentTrackIndex + 1;
        const newPlaylist = [
            ...playlist.slice(0, newTrackIndex),
            track,
            ...playlist.slice(newTrackIndex)
        ];
        setPlaylist(newPlaylist);
        setCurrentTrackIndex(newTrackIndex);
    }
    setIsPlaying(true);
  };

  const playTrackFromQueue = (index: number) => {
    if(index >= 0 && index < playlist.length) {
      setPlaybackError(null);
      setCurrentTrackIndex(index);
      setIsPlaying(true);
      setIsQueueVisible(false);
    }
  };

  const addToQueue = (track: Track) => {
    if (!playlist.find(t => t.track_id === track.track_id)) {
      const newPlaylist = [...playlist, track];
      setPlaylist(newPlaylist);
      if (currentTrackIndex === null) {
        setPlaybackError(null);
        setCurrentTrackIndex(0);
        setIsPlaying(true);
      }
    }
  };

  const removeFromQueue = (trackId: string) => {
    const trackToRemoveIndex = playlist.findIndex(t => t.track_id === trackId);
    if (trackToRemoveIndex === -1) return;

    if (currentTrack?.track_id === trackId) {
        if (playlist.length === 1) {
            setCurrentTrackIndex(null);
            setIsPlaying(false);
        } else if (currentTrackIndex === trackToRemoveIndex) {
            const nextIndex = trackToRemoveIndex % (playlist.length - 1);
            setCurrentTrackIndex(nextIndex);
        }
    } else if (currentTrackIndex !== null && trackToRemoveIndex < currentTrackIndex) {
        setCurrentTrackIndex(prevIndex => prevIndex! - 1);
    }

    setPlaylist(prev => prev.filter(t => t.track_id !== trackId));
  };
  
  const clearQueue = () => {
    setPlaybackError(null);
    setPlaylist([]);
    setCurrentTrackIndex(null);
    setIsPlaying(false);
    setIsQueueVisible(false);
  };

  const shufflePlaylist = () => {
    if (playlist.length <= 1) return;
    setPlaybackError(null);

    const currentPlayingTrack = currentTrack;
    
    const shuffled = [...playlist].sort(() => Math.random() - 0.5);

    if (currentPlayingTrack) {
        const newIndex = shuffled.findIndex(t => t.track_id === currentPlayingTrack.track_id);
        setCurrentTrackIndex(newIndex);
    } else {
        setCurrentTrackIndex(0);
    }
    
    setPlaylist(shuffled);
  };

  const handleReorderPlaylist = (startIndex: number, endIndex: number) => {
    if (startIndex === endIndex) return;
    setPlaybackError(null);

    const newPlaylist = [...playlist];
    const [movedTrack] = newPlaylist.splice(startIndex, 1);
    newPlaylist.splice(endIndex, 0, movedTrack);

    let newCurrentTrackIndex = currentTrackIndex;
    if (currentTrackIndex !== null) {
        if (currentTrackIndex === startIndex) {
            newCurrentTrackIndex = endIndex;
        } else if (startIndex < currentTrackIndex && endIndex >= currentTrackIndex) {
            newCurrentTrackIndex--;
        } else if (startIndex > currentTrackIndex && endIndex <= currentTrackIndex) {
            newCurrentTrackIndex++;
        }
    }
    
    setPlaylist(newPlaylist);
    setCurrentTrackIndex(newCurrentTrackIndex);
  };

  const togglePlayPause = () => {
    if (currentTrack) {
        setPlaybackError(null);
        setIsPlaying(!isPlaying);
    }
  };

  const playNext = useCallback(() => {
    setPlaybackError(null);
    if (playlist.length === 0) {
      setIsPlaying(false);
      return;
    }
    const nextIndex = currentTrackIndex === null ? 0 : (currentTrackIndex + 1) % playlist.length;
    setCurrentTrackIndex(nextIndex);
    setIsPlaying(true);
  }, [playlist.length, currentTrackIndex]);

  const playPrev = () => {
    if (playlist.length > 0) {
      setPlaybackError(null);
      setCurrentTrackIndex((prevIndex) => {
        if (prevIndex === null) return 0;
        return (prevIndex - 1 + playlist.length) % playlist.length;
      });
      setIsPlaying(true);
    }
  };
  
  const onTimeUpdate = () => {
    if (audioRef.current && !isSeeking.current) {
        setTrackProgress(audioRef.current.currentTime);
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
        const newTime = Number(e.target.value);
        setTrackProgress(newTime);
        audioRef.current.currentTime = newTime;
    }
  };

  const handleSeekStart = () => { isSeeking.current = true; }
  const handleSeekEnd = () => { isSeeking.current = false; }
  const toggleQueue = () => setIsQueueVisible(prev => !prev);
  
  return (
    <div className="bg-slate-900 text-slate-200 min-h-screen flex flex-col font-sans">
      <Header onSearch={handleSearch} />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-32">
         <TrackList 
            tracks={tracks} 
            isLoading={isLoading} 
            onPlayTrack={playTrack}
            onAddToQueue={addToQueue}
            onTogglePlayPause={togglePlayPause}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            playlist={playlist}
         />
      </main>

      <QueuePanel
        isOpen={isQueueVisible}
        playlist={playlist}
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onClose={toggleQueue}
        onRemoveTrack={removeFromQueue}
        onPlayTrack={playTrackFromQueue}
        onClearQueue={clearQueue}
        onShufflePlaylist={shufflePlaylist}
        onReorderPlaylist={handleReorderPlaylist}
      />
      
      {currentTrack && (
        <Player 
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          progress={trackProgress}
          duration={audioRef.current?.duration || 0}
          volume={volume}
          onPlayPause={togglePlayPause}
          onNext={playNext}
          onPrev={playPrev}
          onVolumeChange={(e) => setVolume(Number(e.target.value))}
          onProgressChange={handleProgressChange}
          onSeekStart={handleSeekStart}
          onSeekEnd={handleSeekEnd}
          onToggleQueue={toggleQueue}
          playbackError={playbackError}
        />
      )}

      <audio 
        key={currentTrack?.track_id}
        ref={audioRef}
        src={currentTrack?.track_listen_url}
        onTimeUpdate={onTimeUpdate}
        onEnded={playNext}
        onLoadedData={() => {
            setPlaybackError(null);
            if (isPlaying) {
              const playPromise = audioRef.current?.play();
              if (playPromise !== undefined) {
                  playPromise.catch(error => {
                      console.error("Error playing audio onLoadedData:", error);
                      setPlaybackError("Could not play this track.");
                      setIsPlaying(false);
                  });
              }
            }
        }}
        onError={() => {
            console.error("Audio element error for src:", currentTrack?.track_listen_url);
            setPlaybackError("Error: Track could not be loaded.");
            setIsPlaying(false);
        }}
      />
    </div>
  );
};

export default App;
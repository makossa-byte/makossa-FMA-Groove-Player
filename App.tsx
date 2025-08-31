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
  const [repeatMode, setRepeatMode] = useState<'none' | 'all' | 'one'>('all');
  const [replayTrigger, setReplayTrigger] = useState(0);

  const audioRef = useRef<HTMLAudioElement>(null);
  const lastVolumeRef = useRef<number>(0.8);
  const isSeeking = useRef(false);

  const currentTrack = currentTrackIndex !== null ? playlist[currentTrackIndex] : null;

  const clearPlaybackError = useCallback(() => {
    setPlaybackError(null);
  }, []);

  const loadInitialTracks = useCallback(async () => {
    setIsLoading(true);
    try {
      const initialTracks = await searchTracks({ query: '', genre: 'Electronic' });
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
  }, [loadInitialTracks, playlist.length]);
  
  useEffect(() => {
    if (audioRef.current) {
        audioRef.current.volume = volume;
    }
  }, [volume]);
  
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          // AbortError is common when a new play request interrupts an old one. We can safely ignore it.
          if (error.name !== 'AbortError') {
            console.error("Error playing audio:", error);
            setPlaybackError("Playback failed. Please try another track.");
            setIsPlaying(false);
          }
        });
      }
    } else {
      audio.pause();
    }
  }, [isPlaying, currentTrack, replayTrigger]);

  const handleAudioError = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !audio.error) return;

    let message = 'An unknown playback error occurred.';
    switch (audio.error.code) {
      case audio.error.MEDIA_ERR_NETWORK:
        message = 'A network error occurred.';
        break;
      case audio.error.MEDIA_ERR_DECODE:
        message = 'Audio decoding error.';
        break;
      case audio.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
        message = 'Error: Track could not be loaded.';
        break;
    }
    console.error("Audio Element Error:", audio.error.message);
    setPlaybackError(message);
    setIsPlaying(false);
  }, []);

  const handleSearch = async ({ query, genre }: { query: string; genre: string }) => {
    setIsLoading(true);
    setTracks([]);
    try {
      const results = await searchTracks({ query, genre });
      setTracks(results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const playTrack = (track: Track) => {
    clearPlaybackError();
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
    clearPlaybackError();
    if(index >= 0 && index < playlist.length) {
      setCurrentTrackIndex(index);
      setIsPlaying(true);
      setIsQueueVisible(false);
    }
  };

  const addToQueue = (track: Track) => {
    clearPlaybackError();
    if (!playlist.find(t => t.track_id === track.track_id)) {
      const newPlaylist = [...playlist, track];
      setPlaylist(newPlaylist);
      if (currentTrackIndex === null) {
        setCurrentTrackIndex(0);
        setIsPlaying(true);
      }
    }
  };

  const removeFromQueue = (trackId: string) => {
    clearPlaybackError();
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
    clearPlaybackError();
    setPlaylist([]);
    setCurrentTrackIndex(null);
    setIsPlaying(false);
    setIsQueueVisible(false);
  };

  const shufflePlaylist = () => {
    if (playlist.length <= 1) return;
    clearPlaybackError();

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
    clearPlaybackError();

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
        clearPlaybackError();
        setIsPlaying(!isPlaying);
    }
  };

  const playNext = useCallback(() => {
    clearPlaybackError();
    if (playlist.length === 0) {
      setIsPlaying(false);
      return;
    }
    const nextIndex = currentTrackIndex === null ? 0 : (currentTrackIndex + 1) % playlist.length;
    setCurrentTrackIndex(nextIndex);
    setIsPlaying(true);
  }, [playlist.length, currentTrackIndex, clearPlaybackError]);

  const playPrev = useCallback(() => {
    clearPlaybackError();
    if (playlist.length > 0) {
      setCurrentTrackIndex((prevIndex) => {
        if (prevIndex === null) return 0;
        return (prevIndex - 1 + playlist.length) % playlist.length;
      });
      setIsPlaying(true);
    }
  }, [playlist.length, clearPlaybackError]);

  const toggleRepeatMode = useCallback(() => {
    clearPlaybackError();
    setRepeatMode(prevMode => {
      if (prevMode === 'none') return 'all';
      if (prevMode === 'all') return 'one';
      return 'none';
    });
  }, [clearPlaybackError]);

  const handleTrackEnd = useCallback(() => {
    if (repeatMode === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        setReplayTrigger(t => t + 1);
      }
    } else if (repeatMode === 'all') {
        playNext();
    } else { // 'none'
        if (currentTrackIndex !== null && currentTrackIndex < playlist.length - 1) {
            playNext();
        } else {
            setIsPlaying(false);
        }
    }
  }, [repeatMode, playNext, currentTrackIndex, playlist.length]);
  
  const onTimeUpdate = () => {
    if (audioRef.current && !isSeeking.current) {
        setTrackProgress(audioRef.current.currentTime);
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    clearPlaybackError();
    if (audioRef.current) {
        const newTime = Number(e.target.value);
        setTrackProgress(newTime);
        audioRef.current.currentTime = newTime;
    }
  };
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    clearPlaybackError();
    const newVolume = Number(e.target.value);
    setVolume(newVolume);
    if (newVolume > 0) {
        lastVolumeRef.current = newVolume;
    }
  };

  const toggleMute = () => {
    clearPlaybackError();
    if (volume > 0) {
        lastVolumeRef.current = volume;
        setVolume(0);
    } else {
        setVolume(lastVolumeRef.current > 0 ? lastVolumeRef.current : 0.5);
    }
  };

  const handleSeekStart = () => { 
    clearPlaybackError();
    isSeeking.current = true; 
  }
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
          onVolumeChange={handleVolumeChange}
          onProgressChange={handleProgressChange}
          onSeekStart={handleSeekStart}
          onSeekEnd={handleSeekEnd}
          onToggleQueue={toggleQueue}
          onToggleMute={toggleMute}
          repeatMode={repeatMode}
          onToggleRepeatMode={toggleRepeatMode}
          playbackError={playbackError}
        />
      )}

      <audio 
        key={currentTrack?.track_id}
        ref={audioRef}
        src={currentTrack?.track_listen_url}
        onTimeUpdate={onTimeUpdate}
        onEnded={handleTrackEnd}
        onError={handleAudioError}
      />
    </div>
  );
};

export default App;
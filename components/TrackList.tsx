import React from 'react';
import type { Track } from '../types';
import { TrackItem } from './TrackItem';

interface TrackListProps {
  tracks: Track[];
  isLoading: boolean;
  onPlayTrack: (track: Track) => void;
  onAddToQueue: (track: Track) => void;
  onTogglePlayPause: () => void;
  currentTrack: Track | null;
  isPlaying: boolean;
  playlist: Track[];
}

export const TrackList: React.FC<TrackListProps> = ({ tracks, isLoading, onPlayTrack, onAddToQueue, onTogglePlayPause, currentTrack, isPlaying, playlist }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  if (tracks.length === 0) {
    return <p className="text-center text-slate-400 mt-8">No tracks found. Try a different search.</p>;
  }

  return (
    <div className="space-y-3">
      {tracks.map((track) => (
        <TrackItem 
            key={track.track_id} 
            track={track} 
            onPlay={onPlayTrack} 
            onAddToQueue={onAddToQueue}
            onTogglePlayPause={onTogglePlayPause}
            isCurrent={currentTrack?.track_id === track.track_id}
            isPlaying={isPlaying && currentTrack?.track_id === track.track_id}
            isInQueue={playlist.some(pTrack => pTrack.track_id === track.track_id)}
        />
      ))}
    </div>
  );
};
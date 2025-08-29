import React, { useState } from 'react';
import type { Track } from '../types';
import { PlayIcon } from './icons/PlayIcon';
import { PauseIcon } from './icons/PauseIcon';

interface TrackItemProps {
  track: Track;
  onPlay: (track: Track) => void;
  onAddToQueue: (track: Track) => void;
  onTogglePlayPause: () => void;
  isCurrent: boolean;
  isPlaying: boolean;
  isInQueue: boolean;
}

export const TrackItem: React.FC<TrackItemProps> = ({ track, onPlay, onAddToQueue, onTogglePlayPause, isCurrent, isPlaying, isInQueue }) => {
  const [justAdded, setJustAdded] = useState(false);

  const handlePlayClick = () => {
    if (isCurrent) {
      onTogglePlayPause();
    } else {
      onPlay(track);
    }
  };
  
  const handleAddToQueueClick = () => {
    if (isInQueue) return;
    onAddToQueue(track);
    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
    }, 2000);
  };

  const isButtonDisabled = isInQueue || justAdded;
  const buttonText = justAdded ? 'Added!' : (isInQueue ? 'In Queue' : '+ Queue');

  return (
    <div className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${isCurrent ? 'bg-slate-700/50' : 'bg-slate-800/50 hover:bg-slate-800'}`}>
      <button
        onClick={handlePlayClick}
        aria-label={`Play ${track.track_title}`}
        className="flex-shrink-0 mr-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500 transition"
      >
        <img 
          src={track.track_image_file || 'https://picsum.photos/64'} 
          alt={track.album_title}
          className="w-16 h-16 rounded-md object-cover"
        />
      </button>
      <div className="flex-grow min-w-0">
        <h3 className={`font-semibold truncate ${isCurrent ? 'text-sky-400' : 'text-slate-100'}`}>{track.track_title}</h3>
        <p className="text-sm text-slate-400 truncate">{track.artist_name}</p>
      </div>
      <div className="flex items-center space-x-2 ml-4">
        <span className="text-sm text-slate-400 hidden sm:block">{track.track_duration}</span>
        <button 
          onClick={handlePlayClick}
          className="p-2 rounded-full bg-slate-700 hover:bg-sky-500 text-slate-200 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500"
          aria-label={isCurrent && isPlaying ? 'Pause' : 'Play'}
        >
          {isCurrent && isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>
        <button
          onClick={handleAddToQueueClick}
          disabled={isButtonDisabled}
          className="w-24 text-center px-3 py-2 text-sm font-medium rounded-md bg-slate-700 hover:bg-slate-600 text-slate-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};
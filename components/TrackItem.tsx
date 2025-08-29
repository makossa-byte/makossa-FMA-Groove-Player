import React, { useState, useEffect } from 'react';
import type { Track } from '../types';
import { PlayIcon } from './icons/PlayIcon';
import { PauseIcon } from './icons/PauseIcon';
import { fetchLyrics } from '../services/fmaService';

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
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);

  useEffect(() => {
    let isActive = true;

    if (isCurrent) {
      setIsLoadingLyrics(true);
      setLyrics(null);
      fetchLyrics(track.track_id).then(fetchedLyrics => {
        if (isActive) {
          setLyrics(fetchedLyrics);
          setIsLoadingLyrics(false);
        }
      }).catch(() => {
        if (isActive) {
          setLyrics(null);
          setIsLoadingLyrics(false);
        }
      });
    } else {
      setLyrics(null);
      setIsLoadingLyrics(false);
    }

    return () => {
      isActive = false;
    };
  }, [isCurrent, track.track_id]);

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
    <div className={`rounded-lg transition-all duration-300 ${isCurrent ? 'bg-slate-700/50' : 'bg-slate-800/50 hover:bg-slate-800'}`}>
      <div className="flex items-center p-3">
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
      
      {/* Lyrics Section */}
      <div className={`transition-[max-height] duration-500 ease-in-out max-h-0 overflow-hidden ${isCurrent ? 'max-h-56' : ''}`}>
        <div className="px-4 pb-4">
            <div className="border-t border-slate-700/50 pt-3">
                <h4 className="text-sm font-semibold text-slate-300 mb-2">Lyrics</h4>
                {isLoadingLyrics ? (
                    <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-slate-500"></div>
                    </div>
                ) : lyrics ? (
                    <div className="text-sm text-slate-400 whitespace-pre-wrap pr-2 max-h-32 overflow-y-auto">
                        {lyrics}
                    </div>
                ) : (
                    <p className="text-sm text-slate-500 italic">Lyrics not available for this track.</p>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};
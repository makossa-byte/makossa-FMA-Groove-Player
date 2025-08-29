import React from 'react';
import type { Track } from '../types';
import { PlayIcon } from './icons/PlayIcon';
import { PauseIcon } from './icons/PauseIcon';
import { NextIcon } from './icons/NextIcon';
import { PrevIcon } from './icons/PrevIcon';
import { VolumeUpIcon } from './icons/VolumeUpIcon';
import { QueueListIcon } from './icons/QueueListIcon';
import { ErrorIcon } from './icons/ErrorIcon';

interface PlayerProps {
  currentTrack: Track;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  playbackError: string | null;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onProgressChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSeekStart: () => void;
  onSeekEnd: () => void;
  onToggleQueue: () => void;
}

const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '00:00';
    const floorSeconds = Math.floor(seconds);
    const min = Math.floor(floorSeconds / 60);
    const sec = floorSeconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

export const Player: React.FC<PlayerProps> = ({ 
    currentTrack, isPlaying, progress, duration, volume, playbackError,
    onPlayPause, onNext, onPrev, onVolumeChange, onProgressChange,
    onSeekStart, onSeekEnd, onToggleQueue
}) => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-slate-800/80 backdrop-blur-lg z-20 border-t border-slate-700">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-24">
          
          {/* Track Info */}
          <div className="w-1/4 flex items-center min-w-0">
            {playbackError ? (
                <div className="flex items-center text-red-400">
                    <ErrorIcon />
                    <span className="ml-3 font-semibold truncate">{playbackError}</span>
                </div>
            ) : (
                <>
                    <img 
                      src={currentTrack.track_image_file || 'https://picsum.photos/64'} 
                      alt={currentTrack.album_title}
                      className="w-16 h-16 rounded-md object-cover mr-4 hidden sm:block"
                    />
                    <div className="min-w-0">
                      <h4 className="font-semibold text-slate-100 truncate">{currentTrack.track_title}</h4>
                      <p className="text-sm text-slate-400 truncate">{currentTrack.artist_name}</p>
                    </div>
                </>
            )}
          </div>

          {/* Player Controls */}
          <div className="w-1/2 flex flex-col items-center justify-center">
            <div className="flex items-center space-x-4">
              <button onClick={onPrev} className="p-2 text-slate-400 hover:text-white transition-colors" aria-label="Previous track"><PrevIcon /></button>
              <button onClick={onPlayPause} className="p-3 bg-sky-500 text-white rounded-full shadow-lg hover:bg-sky-400 transition-colors" aria-label={isPlaying ? 'Pause' : 'Play'}>
                {isPlaying ? <PauseIcon /> : <PlayIcon />}
              </button>
              <button onClick={onNext} className="p-2 text-slate-400 hover:text-white transition-colors" aria-label="Next track"><NextIcon /></button>
            </div>
            <div className="w-full flex items-center space-x-2 mt-2">
                <span className="text-xs text-slate-400 w-10 text-right">{formatTime(progress)}</span>
                <input 
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={progress}
                    onChange={onProgressChange}
                    onMouseDown={onSeekStart}
                    onMouseUp={onSeekEnd}
                    onTouchStart={onSeekStart}
                    onTouchEnd={onSeekEnd}
                    className="w-full h-1.5 bg-slate-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:bg-sky-500 [&::-webkit-slider-thumb]:rounded-full"
                    style={{ backgroundSize: `${(progress / duration) * 100}% 100%` }}
                />
                <span className="text-xs text-slate-400 w-10">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Volume Control & Queue Toggle */}
          <div className="w-1/4 flex items-center justify-end">
             <button onClick={onToggleQueue} className="p-2 text-slate-400 hover:text-white transition-colors" aria-label="Toggle queue">
                <QueueListIcon />
             </button>
             <div className="items-center hidden md:flex">
                <VolumeUpIcon />
                <input 
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={onVolumeChange}
                    className="w-24 h-1.5 ml-2 bg-slate-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:bg-sky-500 [&::-webkit-slider-thumb]:rounded-full"
                />
             </div>
          </div>

        </div>
      </div>
    </footer>
  );
};
import React, { useRef, useState } from 'react';
import type { Track } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { TrashIcon } from './icons/TrashIcon';
import { PlayIcon } from './icons/PlayIcon';
import { PauseIcon } from './icons/PauseIcon';
import { ShuffleIcon } from './icons/ShuffleIcon';
import { DragHandleIcon } from './icons/DragHandleIcon';

interface QueuePanelProps {
  isOpen: boolean;
  playlist: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  onClose: () => void;
  onRemoveTrack: (trackId: string) => void;
  onPlayTrack: (index: number) => void;
  onClearQueue: () => void;
  onShufflePlaylist: () => void;
  onReorderPlaylist: (startIndex: number, endIndex: number) => void;
}

export const QueuePanel: React.FC<QueuePanelProps> = ({
  isOpen,
  playlist,
  currentTrack,
  isPlaying,
  onClose,
  onRemoveTrack,
  onPlayTrack,
  onClearQueue,
  onShufflePlaylist,
  onReorderPlaylist
}) => {
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLLIElement>, index: number) => {
    dragItem.current = index;
    setDraggingIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnter = (e: React.DragEvent<HTMLLIElement>, index: number) => {
    dragOverItem.current = index;
  };
  
  const handleDragEnd = () => {
    if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
        onReorderPlaylist(dragItem.current, dragOverItem.current);
    }
    dragItem.current = null;
    dragOverItem.current = null;
    setDraggingIndex(null);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLLIElement>) => {
    e.preventDefault(); // This is necessary to allow dropping
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-slate-900/50 z-30 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Panel */}
      <aside className={`fixed top-0 right-0 w-full sm:w-80 md:w-96 h-full bg-slate-800 shadow-2xl z-40 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <header className="p-4 border-b border-slate-700 flex items-center justify-between sticky top-0 bg-slate-800/80 backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-semibold text-slate-100">Up Next</h2>
            {playlist.length > 1 && (
              <button onClick={onShufflePlaylist} className="p-2 text-slate-400 hover:text-sky-400 transition-colors" aria-label="Shuffle playlist">
                <ShuffleIcon />
              </button>
            )}
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors" aria-label="Close queue">
            <CloseIcon />
          </button>
        </header>

        <div className="flex-grow overflow-y-auto">
          {playlist.length === 0 ? (
            <p className="text-slate-400 text-center p-8">The queue is empty.</p>
          ) : (
            <ul>
              {playlist.map((track, index) => {
                const isCurrent = track.track_id === currentTrack?.track_id;
                return (
                  <li 
                    key={`${track.track_id}-${index}`} 
                    className={`flex items-center p-3 transition-all duration-200 group ${isCurrent ? 'bg-slate-700/50' : 'hover:bg-slate-700/30'} ${draggingIndex === index ? 'opacity-50' : 'opacity-100'}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragEnter={(e) => handleDragEnter(e, index)}
                    onDragEnd={handleDragEnd}
                    onDragOver={handleDragOver}
                    >
                    <div className="flex-shrink-0 cursor-grab touch-none mr-2 text-slate-500" aria-label="Drag to reorder">
                      <DragHandleIcon />
                    </div>
                    <button
                      onClick={() => onPlayTrack(index)}
                      aria-label={`Play ${track.track_title}`}
                      className={`flex-shrink-0 mr-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500 transition-all duration-300 ${isCurrent ? 'ring-2 ring-sky-400' : ''}`}
                    >
                      <img
                        src={track.track_image_file || 'https://picsum.photos/64'}
                        alt={track.album_title}
                        className="w-16 h-16 rounded-md object-cover"
                      />
                    </button>
                    <div className="flex-grow min-w-0 cursor-pointer" onClick={() => onPlayTrack(index)}>
                      <h3 className={`font-medium truncate ${isCurrent ? 'text-sky-400' : 'text-slate-200'}`}>{track.track_title}</h3>
                      <p className="text-sm text-slate-400 truncate">{track.artist_name}</p>
                      {track.genres && track.genres.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 mt-1.5">
                          {track.genres.slice(0, 2).map((genre) => (
                            <span
                              key={genre}
                              className="px-2 py-0.5 text-xs font-medium rounded-full bg-slate-600 text-slate-300"
                            >
                              {genre}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="w-6 h-6 mx-2 flex items-center justify-center text-sky-400">
                      {isCurrent && (isPlaying ? <PauseIcon /> : <PlayIcon />)}
                    </div>
                    <button 
                      onClick={() => onRemoveTrack(track.track_id)}
                      className="ml-2 p-2 text-slate-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                      aria-label={`Remove ${track.track_title} from queue`}
                    >
                      <TrashIcon />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {playlist.length > 0 && (
          <footer className="p-4 border-t border-slate-700 sticky bottom-0 bg-slate-800/80 backdrop-blur-sm">
            <button
              onClick={onClearQueue}
              className="w-full px-4 py-2 text-sm font-bold rounded-md bg-slate-700 hover:bg-red-600 text-slate-200 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Clear Queue
            </button>
          </footer>
        )}
      </aside>
    </>
  );
};
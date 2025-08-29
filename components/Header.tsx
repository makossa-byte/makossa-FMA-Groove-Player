import React, { useState } from 'react';

interface HeaderProps {
  onSearch: (query: string, searchBy: 'keyword' | 'genre') => void;
}

const GENRES = ['Electronic', 'Pop', 'Rock', 'Hip-Hop', 'Instrumental', 'Cinematic'];

export const Header: React.FC<HeaderProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query, 'keyword');
  };

  const handleGenreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setQuery(''); // Clear text input when a genre is selected
    onSearch(e.target.value, 'genre');
  }

  return (
    <header className="bg-slate-900/70 backdrop-blur-lg sticky top-0 z-10 shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-sky-400">
              FMA Groove Player
            </h1>
          </div>
          <div className="flex-1 flex items-center justify-center px-2 lg:ml-6 lg:justify-end">
            <div className="max-w-lg w-full lg:max-w-xs">
              <form onSubmit={handleSubmit} className="relative">
                <input
                  id="search"
                  name="search"
                  className="block w-full pl-10 pr-3 py-2 border border-transparent rounded-md leading-5 bg-slate-800 text-slate-300 placeholder-slate-400 focus:outline-none focus:bg-slate-700 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm transition"
                  placeholder="Search artist or title..."
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
              </form>
            </div>
            <div className="ml-4">
                <label htmlFor="genre-select" className="sr-only">Filter by genre</label>
                <select 
                    id="genre-select"
                    onChange={handleGenreChange}
                    className="block w-full pl-3 pr-10 py-2 border border-transparent rounded-md leading-5 bg-slate-800 text-slate-300 focus:outline-none focus:bg-slate-700 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm transition"
                    aria-label="Filter by genre"
                >
                    <option value="">All Genres</option>
                    {GENRES.map(genre => (
                        <option key={genre} value={genre}>{genre}</option>
                    ))}
                </select>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
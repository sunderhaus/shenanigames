'use client';

import Link from 'next/link';
import HamburgerMenu from '../HamburgerMenu';

interface GameLibraryHeaderProps {
  totalGames: number;
  filteredCount: number;
  showingFiltered: boolean;
  onAddGame: () => void;
  onImportCSV: () => void;
  onExportCSV: () => void;
  onExportJSON: () => void;
  onShowStats: () => void;
  onClearLibrary: () => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

export default function GameLibraryHeader({
  totalGames,
  filteredCount,
  showingFiltered,
  onAddGame,
  onImportCSV,
  onExportCSV,
  onExportJSON,
  onShowStats,
  onClearLibrary,
  viewMode,
  onViewModeChange
}: GameLibraryHeaderProps) {
  return (
    <div className="mb-6">
      {/* Header with hamburger menu */}
      <div className="mb-4 flex items-center">
        <div className="w-16 flex justify-start">
          <HamburgerMenu />
        </div>
        <div className="flex-1 text-center">
          <h1 className="text-2xl font-bold">Shenanigames</h1>
          <p className="text-sm text-gray-600">Game Library</p>
        </div>
        <div className="w-16"></div>
      </div>

      {/* Main header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Title and stats */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Game Library</h1>
            <p className="text-gray-600">
              {showingFiltered ? (
                <>
                  Showing {filteredCount} of {totalGames} games
                </>
              ) : (
                <>
                  {totalGames} {totalGames === 1 ? 'game' : 'games'} in your library
                </>
              )}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* View mode toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => onViewModeChange('grid')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2zM9 4a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1V4zM9 10a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2zM15 4a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1V4zM15 10a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                onClick={() => onViewModeChange('list')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={onShowStats}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                📊 Stats
              </button>
              
              <button
                onClick={onImportCSV}
                className="px-4 py-2 text-sm font-medium text-green-700 bg-green-100 border border-green-300 rounded-md hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                📥 Import CSV
              </button>

              <button
                onClick={onExportCSV}
                className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-300 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                📤 CSV
              </button>
              
              <button
                onClick={onExportJSON}
                className="px-4 py-2 text-sm font-medium text-purple-700 bg-purple-100 border border-purple-300 rounded-md hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                📦 JSON
              </button>

              <button
                onClick={onAddGame}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                ➕ Add Game
              </button>
              
              {/* Clear Library - Dangerous action, separated */}
              {totalGames > 0 && (
                <button
                  onClick={onClearLibrary}
                  className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 border border-red-300 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                  title="Clear all games from library"
                >
                  🗑️ Clear All
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Navigation breadcrumb */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <nav className="text-sm text-gray-500">
            <Link href="/" className="hover:text-gray-700">Tables</Link>
            <span className="mx-2">•</span>
            <span className="text-gray-900 font-medium">Game Library</span>
            <span className="mx-2">•</span>
            <Link href="/collections" className="hover:text-gray-700">Collections</Link>
            <span className="mx-2">•</span>
            <Link href="/results" className="hover:text-gray-700">Results</Link>
          </nav>
        </div>
      </div>
    </div>
  );
}

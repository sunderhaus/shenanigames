'use client';

import { useState, useEffect } from 'react';
import { useGameLibrary } from '@/store/game-library-store';
import { GameFilter, GameSort } from '@/types/game-library-types';
import GameLibraryHeader from '@/components/game-library/GameLibraryHeader';
import GameLibraryFilters from '@/components/game-library/GameLibraryFilters';
import GameLibraryGrid from '@/components/game-library/GameLibraryGrid';
import GameLibraryStats from '@/components/game-library/GameLibraryStats';
import AddGameModal from '@/components/game-library/AddGameModal';
import ImportCSVModal from '@/components/game-library/ImportCSVModal';

export default function GameLibraryPage() {
  const [isClient, setIsClient] = useState(false);
  const [showAddGame, setShowAddGame] = useState(false);
  const [showImportCSV, setShowImportCSV] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const {
    gameList,
    filteredGames,
    totalGames,
    currentFilter,
    currentSort,
    setFilter,
    setSort,
    clearFilters
  } = useGameLibrary();

  // Set isClient to true after component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleFilterChange = (newFilter: Partial<GameFilter>) => {
    setFilter({ ...currentFilter, ...newFilter });
  };

  const handleSortChange = (newSort: GameSort) => {
    setSort(newSort);
  };

  const handleClearFilters = () => {
    clearFilters();
  };

  const displayedGames = Object.keys(currentFilter).length > 0 ? filteredGames : gameList;

  if (!isClient) {
    return (
      <div className="min-h-screen p-4 bg-gray-100 flex items-center justify-center">
        <div className="text-lg">Loading Game Library...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-gray-100">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <GameLibraryHeader
          totalGames={totalGames}
          filteredCount={displayedGames.length}
          showingFiltered={Object.keys(currentFilter).length > 0}
          onAddGame={() => setShowAddGame(true)}
          onImportCSV={() => setShowImportCSV(true)}
          onShowStats={() => setShowStats(true)}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className="lg:w-80">
            <GameLibraryFilters
              currentFilter={currentFilter}
              currentSort={currentSort}
              onFilterChange={handleFilterChange}
              onSortChange={handleSortChange}
              onClearFilters={handleClearFilters}
              gameList={gameList}
            />

            {/* Stats Panel */}
            {showStats && (
              <div className="mt-6">
                <GameLibraryStats onClose={() => setShowStats(false)} />
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {displayedGames.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <div className="text-gray-500 mb-4">
                  {Object.keys(currentFilter).length > 0 ? (
                    <>
                      <h3 className="text-lg font-medium mb-2">No games match your filters</h3>
                      <p>Try adjusting your search criteria or clearing filters.</p>
                    </>
                  ) : (
                    <>
                      <h3 className="text-lg font-medium mb-2">Your game library is empty</h3>
                      <p>Add games manually or import from a CSV file to get started.</p>
                    </>
                  )}
                </div>
                <div className="space-x-4">
                  <button
                    onClick={() => setShowAddGame(true)}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Add First Game
                  </button>
                  <button
                    onClick={() => setShowImportCSV(true)}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Import from CSV
                  </button>
                  {Object.keys(currentFilter).length > 0 && (
                    <button
                      onClick={handleClearFilters}
                      className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <GameLibraryGrid
                games={displayedGames}
                viewMode={viewMode}
              />
            )}
          </div>
        </div>

        {/* Modals */}
        {showAddGame && (
          <AddGameModal
            onClose={() => setShowAddGame(false)}
          />
        )}

        {showImportCSV && (
          <ImportCSVModal
            onClose={() => setShowImportCSV(false)}
          />
        )}
      </div>
    </div>
  );
}

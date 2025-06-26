'use client';

import { useState, useEffect } from 'react';
import { useGameLibrary } from '@/store/game-library-store';
import { useSessionGameStore } from '../store/session-store';
import { LibraryGame } from '@/types/game-library-types';
import { X, Search } from 'lucide-react';

interface LibraryGameSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  targetTableId?: string; // If provided, will place game directly on this table
}

export default function LibraryGameSelector({ isOpen, onClose, targetTableId }: LibraryGameSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);

  const { getActiveGames } = useGameLibrary();
  const { placeLibraryGame, tables } = useSessionGameStore();
  
  const activeGames = getActiveGames();

  // Filter games based on search and category
  const filteredGames = activeGames.filter(game => {
    const matchesSearch = searchTerm === '' || 
      game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      game.designer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      game.category?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === '' || game.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Get unique categories for filter
  const categories = Array.from(new Set(activeGames.map(g => g.category).filter(Boolean))).sort();

  // Get empty tables for selection
  const emptyTables = tables.filter(table => !table.gameId);

  const handleGameSelect = (gameId: string) => {
    setSelectedGameId(gameId);
  };

  const handlePlaceGame = (tableId: string) => {
    if (!selectedGameId) return;
    
    placeLibraryGame(selectedGameId, tableId);
    onClose();
    setSelectedGameId(null);
  };

  const handlePlaceOnTargetTable = () => {
    if (!selectedGameId || !targetTableId) return;
    
    placeLibraryGame(selectedGameId, targetTableId);
    onClose();
    setSelectedGameId(null);
  };

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      setSelectedCategory('');
      setSelectedGameId(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-screen overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {targetTableId ? 'Select Game for Table' : 'Add Game from Library'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 rounded"
            >
              <X size={20} />
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Choose a game from your library to add to a table
          </p>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search games by title, designer, or category..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="sm:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Games List */}
          <div className="flex-1 overflow-y-auto p-6">
            {filteredGames.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">
                  {activeGames.length === 0 
                    ? "No active games found in your library."
                    : "No games match your search criteria."
                  }
                </p>
                {activeGames.length === 0 && (
                  <a
                    href="/library"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    Visit Game Library to add games
                  </a>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredGames.map(game => {
                  const isSelected = selectedGameId === game.id;
                  
                  return (
                    <div
                      key={game.id}
                      onClick={() => handleGameSelect(game.id)}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        {/* Game Image */}
                        {game.image && (
                          <img
                            src={game.image}
                            alt={game.title}
                            className="w-16 h-16 object-cover rounded flex-shrink-0"
                          />
                        )}
                        
                        {/* Game Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate mb-1">
                            {game.title}
                          </h3>
                          
                          <p className="text-sm text-gray-600 mb-1">
                            {game.minPlayers || 1}-{game.maxPlayers} players
                          </p>
                          
                          {game.category && (
                            <p className="text-xs text-gray-500 mb-1">
                              {game.category}
                            </p>
                          )}
                          
                          {game.complexity && (
                            <p className="text-xs text-gray-500 mb-1">
                              {'★'.repeat(game.complexity)}/5 Complexity
                            </p>
                          )}
                          
                          {game.playingTime && (
                            <p className="text-xs text-gray-500">
                              {game.playingTime}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Table Selection Sidebar */}
          {selectedGameId && (
            <div className="w-80 border-l border-gray-200 p-6 bg-gray-50">
              <h3 className="font-medium text-gray-900 mb-4">
                {targetTableId ? 'Confirm Placement' : 'Select Table'}
              </h3>
              
              {targetTableId ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Place the selected game on the target table?
                  </p>
                  <button
                    onClick={handlePlaceOnTargetTable}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Place Game on Table
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {emptyTables.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      No empty tables available. All tables already have games.
                    </p>
                  ) : (
                    <>
                      <p className="text-sm text-gray-600 mb-3">
                        Choose which table to place the game on:
                      </p>
                      {emptyTables.map((table, index) => (
                        <button
                          key={table.id}
                          onClick={() => handlePlaceGame(table.id)}
                          className="w-full text-left px-3 py-2 border border-gray-300 rounded-md hover:bg-white hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Table {tables.findIndex(t => t.id === table.id) + 1}</span>
                            <span className="text-xs text-gray-500">Empty</span>
                          </div>
                        </button>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {selectedGameId ? "Game selected. Choose a table to place it on." : "Select a game to continue."}
            </div>
            
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

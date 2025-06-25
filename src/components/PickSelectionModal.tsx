'use client';

import { useState, useEffect } from 'react';
import { useGameLibrary } from '@/store/game-library-store';
import { useSessionGameStore } from '@/store/session-store';
import { Player } from '@/types/types';
import { LibraryGame } from '@/types/game-library-types';

interface PickSelectionModalProps {
  player: Player;
  onClose: () => void;
}

export default function PickSelectionModal({ player, onClose }: PickSelectionModalProps) {
  const [selectedGameIds, setSelectedGameIds] = useState<string[]>(player.picks);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const { getActiveGames } = useGameLibrary();
  const { updatePlayerPicks } = useSessionGameStore();
  
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

  const handleAddGame = (gameId: string) => {
    setSelectedGameIds(prev => {
      if (prev.length < 2) {
        // Add game to selection (max 2, duplicates allowed)
        return [...prev, gameId];
      }
      return prev; // Don't add if already at max
    });
  };

  const handleRemoveGame = (gameId: string) => {
    setSelectedGameIds(prev => {
      // Remove the first occurrence of this game from selection
      const index = prev.indexOf(gameId);
      if (index !== -1) {
        return prev.filter((id, i) => i !== index);
      }
      return prev;
    });
  };

  const handleSave = () => {
    updatePlayerPicks(player.id, selectedGameIds);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const canSave = selectedGameIds.length === 2;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-screen overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Select Game Picks for {player.name}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Choose exactly 2 games from your library. Selected: {selectedGameIds.length}/2
          </p>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search games by title, designer, or category..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

        {/* Games Grid */}
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
                const selectionCount = selectedGameIds.filter(id => id === game.id).length;
                const isSelected = selectionCount > 0;
                const canAdd = selectedGameIds.length < 2;
                const canRemove = isSelected;
                
                return (
                  <div
                    key={game.id}
                    className={`border rounded-lg p-4 transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200'
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
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-medium text-gray-900 truncate">
                            {game.title}
                          </h3>
                          {isSelected && (
                            <div className="ml-2 text-blue-600 flex-shrink-0 flex items-center text-sm font-medium">
                              {selectionCount === 1 ? 'Pick 1' : `Pick 1 & 2`}
                            </div>
                          )}
                        </div>
                        
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
                          <p className="text-xs text-gray-500 mb-3">
                            {game.playingTime}
                          </p>
                        )}
                        
                        {/* Action Buttons */}
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleAddGame(game.id)}
                            disabled={!canAdd}
                            className={`px-3 py-1 text-xs font-medium rounded ${
                              canAdd
                                ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                            title={canAdd ? 'Add as pick' : 'Maximum 2 picks selected'}
                          >
                            + Add Pick
                          </button>
                          
                          {isSelected && (
                            <button
                              onClick={() => handleRemoveGame(game.id)}
                              className="px-3 py-1 text-xs font-medium rounded bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500"
                              title="Remove one pick"
                            >
                              - Remove
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {selectedGameIds.length === 0 && "Select 2 games to continue"}
              {selectedGameIds.length === 1 && "Select 1 more game"}
              {selectedGameIds.length === 2 && "Ready to save selections"}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!canSave}
                className={`px-4 py-2 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  canSave
                    ? 'text-white bg-blue-600 hover:bg-blue-700'
                    : 'text-gray-400 bg-gray-200 cursor-not-allowed'
                }`}
              >
                Save Picks ({selectedGameIds.length}/2)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

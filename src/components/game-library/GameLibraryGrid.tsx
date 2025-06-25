'use client';

import { useState } from 'react';
import { LibraryGame } from '@/types/game-library-types';
import { useGameLibrary } from '@/store/game-library-store';
import EditGameModal from './EditGameModal';

interface GameLibraryGridProps {
  games: LibraryGame[];
  viewMode: 'grid' | 'list';
}

export default function GameLibraryGrid({ games, viewMode }: GameLibraryGridProps) {
  const [editingGame, setEditingGame] = useState<LibraryGame | null>(null);
  const { deleteGame, toggleGameActive } = useGameLibrary();

  const handleDelete = (game: LibraryGame) => {
    if (window.confirm(`Are you sure you want to delete "${game.title}"?`)) {
      deleteGame(game.id);
    }
  };

  const handleToggleActive = (game: LibraryGame) => {
    toggleGameActive(game.id);
  };

  const GameCard = ({ game, isListView = false }: { game: LibraryGame; isListView?: boolean }) => (
    <div className={`bg-white rounded-lg shadow-md p-4 ${!game.isActive ? 'opacity-60' : ''} ${
      isListView ? 'flex items-center justify-between' : ''
    }`}>
      <div className={`flex ${isListView ? 'items-center space-x-4' : 'flex-col space-y-3'}`}>
        {/* Game image and title */}
        <div className={`flex ${isListView ? 'items-center space-x-4' : 'items-start space-x-3'}`}>
          {game.image && (
            <img 
              src={game.image} 
              alt={game.title} 
              className={`object-cover rounded ${
                isListView ? 'w-12 h-12' : 'w-16 h-16'
              }`} 
            />
          )}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <h4 className="text-lg font-semibold">{game.title}</h4>
              {!game.isActive && (
                <span className="ml-2 px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded">
                  Inactive
                </span>
              )}
            </div>
            <p className="text-gray-600 text-sm">
              {game.minPlayers || 1}-{game.maxPlayers} players
            </p>
            {game.complexity && (
              <p className="text-gray-600 text-sm">
                {'★'.repeat(game.complexity)}/5 Complexity
              </p>
            )}
            {game.category && (
              <p className="text-gray-500 text-xs">{game.category}</p>
            )}
          </div>
        </div>

        {/* Game details (only in grid view) */}
        {!isListView && (
          <>
            {game.description && (
              <p className="text-gray-500 text-sm line-clamp-2">{game.description}</p>
            )}
            
            {game.tags && game.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {game.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                    {tag}
                  </span>
                ))}
                {game.tags.length > 3 && (
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                    +{game.tags.length - 3}
                  </span>
                )}
              </div>
            )}

            {(game.designer || game.yearPublished) && (
              <div className="text-xs text-gray-500">
                {game.designer && <p>Designer: {game.designer}</p>}
                {game.yearPublished && <p>Year: {game.yearPublished}</p>}
              </div>
            )}
          </>
        )}
      </div>

      {/* Action buttons */}
      <div className={`flex ${isListView ? 'space-x-2' : 'space-x-3 mt-4'}`}>
        <button
          onClick={() => handleToggleActive(game)}
          className={`px-3 py-1 text-sm rounded ${
            game.isActive
              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
              : 'bg-green-100 text-green-700 hover:bg-green-200'
          }`}
        >
          {game.isActive ? 'Deactivate' : 'Activate'}
        </button>
        <button
          onClick={() => setEditingGame(game)}
          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
        >
          Edit
        </button>
        <button
          onClick={() => handleDelete(game)}
          className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
        >
          Delete
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {games.map(game => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {games.map(game => (
            <GameCard key={game.id} game={game} isListView={true} />
          ))}
        </div>
      )}

      {/* Edit Game Modal */}
      {editingGame && (
        <EditGameModal
          game={editingGame}
          onClose={() => setEditingGame(null)}
        />
      )}
    </div>
  );
}


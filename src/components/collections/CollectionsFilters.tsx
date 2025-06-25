'use client';

import { CollectionPlayer } from '@/types/game-collection-types';

interface CollectionsFiltersProps {
  players: CollectionPlayer[];
  selectedPlayer: string;
  onPlayerChange: (playerId: string) => void;
  onDeletePlayer: (playerId: string, playerName: string) => void;
}

export default function CollectionsFilters({
  players,
  selectedPlayer,
  onPlayerChange,
  onDeletePlayer
}: CollectionsFiltersProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter by Player</h3>
      
      <div className="space-y-2">
        {/* All Players Option */}
        <button
          onClick={() => onPlayerChange('all')}
          className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
            selectedPlayer === 'all'
              ? 'bg-blue-100 text-blue-800 border border-blue-200'
              : 'hover:bg-gray-100 text-gray-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg">👥</span>
              <span className="font-medium">All Players</span>
            </div>
            <span className="text-sm text-gray-500">
              {players.length} {players.length === 1 ? 'player' : 'players'}
            </span>
          </div>
        </button>

        {/* Individual Players */}
        {players.map((player) => (
          <div
            key={player.id}
            className={`group rounded-md border transition-colors ${
              selectedPlayer === player.id
                ? 'bg-blue-100 border-blue-200'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <button
              onClick={() => onPlayerChange(player.id)}
              className="w-full text-left px-3 py-2 focus:outline-none"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{player.icon}</span>
                  <div>
                    <span className={`font-medium ${
                      selectedPlayer === player.id ? 'text-blue-800' : 'text-gray-900'
                    }`}>
                      {player.name}
                    </span>
                    {!player.isActive && (
                      <span className="ml-2 px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm ${
                    selectedPlayer === player.id ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {/* Item count would be calculated */}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeletePlayer(player.id, player.name);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-700 rounded transition-opacity focus:opacity-100 focus:outline-none"
                    title={`Delete ${player.name}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </button>
          </div>
        ))}
      </div>

      {players.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          <p className="text-sm">No players found</p>
          <p className="text-xs mt-1">Add players to start building collections</p>
        </div>
      )}
    </div>
  );
}

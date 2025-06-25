'use client';

import { useGameCollections } from '@/store/game-collection-store';

interface CollectionStatsProps {
  onClose: () => void;
}

export default function CollectionStats({ onClose }: CollectionStatsProps) {
  const { getStats } = useGameCollections();
  const stats = getStats();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Collection Statistics</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 focus:outline-none"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-4">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-600 font-medium">Total Items</p>
            <p className="text-2xl font-bold text-blue-900">{stats.totalItems}</p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-sm text-green-600 font-medium">Unique Games</p>
            <p className="text-2xl font-bold text-green-900">{stats.uniqueGamesInCollections}</p>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <p className="text-sm text-purple-600 font-medium">Active Players</p>
            <p className="text-2xl font-bold text-purple-900">{stats.activePlayers}</p>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg">
            <p className="text-sm text-orange-600 font-medium">Avg Items/Player</p>
            <p className="text-2xl font-bold text-orange-900">{stats.averageItemsPerPlayer.toFixed(1)}</p>
          </div>
        </div>

        {/* Top Collectors */}
        {stats.topCollectors.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Top Collectors</h4>
            <div className="space-y-2">
              {stats.topCollectors.slice(0, 5).map((collector, index) => (
                <div key={collector.playerId} className="flex items-center justify-between text-sm">
                  <span className="text-gray-900">
                    #{index + 1} {collector.playerName}
                  </span>
                  <span className="font-medium text-gray-600">
                    {collector.gameCount} {collector.gameCount === 1 ? 'item' : 'items'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Game Distribution */}
        {Object.keys(stats.gameDistribution).length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Most Collected Games</h4>
            <div className="space-y-2">
              {Object.entries(stats.gameDistribution)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([gameId, count]) => (
                  <div key={gameId} className="flex items-center justify-between text-sm">
                    <span className="text-gray-900 truncate">{gameId}</span>
                    <span className="font-medium text-gray-600">
                      {count} {count === 1 ? 'copy' : 'copies'}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {stats.totalItems === 0 && (
          <div className="text-center text-gray-500 py-8">
            <p className="text-sm">No collection data available</p>
            <p className="text-xs mt-1">Add some items to see statistics</p>
          </div>
        )}
      </div>
    </div>
  );
}

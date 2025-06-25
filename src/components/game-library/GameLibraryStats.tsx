'use client';

import { useGameLibrary } from '@/store/game-library-store';

interface GameLibraryStatsProps {
  onClose: () => void;
}

export default function GameLibraryStats({ onClose }: GameLibraryStatsProps) {
  const { getStats, exportToCSV, exportToJSON } = useGameLibrary();
  const stats = getStats();

  const handleExportCSV = () => {
    const csvData = exportToCSV();
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `game-library-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const jsonData = exportToJSON();
    if (jsonData) {
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `game-library-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Library Statistics</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      <div className="space-y-6">
        {/* Overall stats */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Overview</h4>
          <div className="grid grid-cols-1 gap-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Games:</span>
              <span className="font-medium">{stats.totalGames}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Active Games:</span>
              <span className="font-medium text-green-600">{stats.activeGames}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Inactive Games:</span>
              <span className="font-medium text-gray-500">{stats.inactiveGames}</span>
            </div>
          </div>
        </div>

        {/* Categories */}
        {Object.keys(stats.categoryCounts).length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Categories</h4>
            <div className="space-y-2">
              {Object.entries(stats.categoryCounts)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([category, count]) => (
                  <div key={category} className="flex justify-between">
                    <span className="text-gray-600">{category}:</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              {Object.keys(stats.categoryCounts).length > 5 && (
                <div className="text-xs text-gray-500">
                  +{Object.keys(stats.categoryCounts).length - 5} more categories
                </div>
              )}
            </div>
          </div>
        )}

        {/* Player count distribution */}
        {Object.keys(stats.playerCountDistribution).length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Max Players</h4>
            <div className="space-y-2">
              {Object.entries(stats.playerCountDistribution)
                .sort(([a,], [b,]) => parseInt(a) - parseInt(b))
                .map(([players, count]) => (
                  <div key={players} className="flex justify-between">
                    <span className="text-gray-600">{players} players:</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Complexity distribution */}
        {Object.keys(stats.complexityDistribution).length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Complexity</h4>
            <div className="space-y-2">
              {Object.entries(stats.complexityDistribution)
                .sort(([a,], [b,]) => parseInt(a) - parseInt(b))
                .map(([complexity, count]) => (
                  <div key={complexity} className="flex justify-between">
                    <span className="text-gray-600">
                      {complexity}/5 {'★'.repeat(parseInt(complexity))}:
                    </span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Top tags */}
        {Object.keys(stats.tagCounts).length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Popular Tags</h4>
            <div className="space-y-2">
              {Object.entries(stats.tagCounts)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 8)
                .map(([tag, count]) => (
                  <div key={tag} className="flex justify-between">
                    <span className="text-gray-600">{tag}:</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              {Object.keys(stats.tagCounts).length > 8 && (
                <div className="text-xs text-gray-500">
                  +{Object.keys(stats.tagCounts).length - 8} more tags
                </div>
              )}
            </div>
          </div>
        )}

        {/* Export actions */}
        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-900 mb-3">Export Library</h4>
          <div className="space-y-2">
            <button
              onClick={handleExportCSV}
              className="w-full px-3 py-2 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              📄 Export as CSV
            </button>
            <button
              onClick={handleExportJSON}
              className="w-full px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              💾 Export as JSON (Backup)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

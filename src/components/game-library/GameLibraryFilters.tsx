'use client';

import { useState } from 'react';
import { GameFilter, GameSort, LibraryGame } from '@/types/game-library-types';

interface GameLibraryFiltersProps {
  currentFilter: GameFilter;
  currentSort: GameSort;
  onFilterChange: (filter: Partial<GameFilter>) => void;
  onSortChange: (sort: GameSort) => void;
  onClearFilters: () => void;
  gameList: LibraryGame[];
}

export default function GameLibraryFilters({
  currentFilter,
  currentSort,
  onFilterChange,
  onSortChange,
  onClearFilters,
  gameList
}: GameLibraryFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Extract unique values for filter options
  const categories = Array.from(new Set(gameList.map(g => g.category).filter(Boolean))).sort();
  const allTags = Array.from(new Set(gameList.flatMap(g => g.tags || []))).sort();
  const complexities = Array.from(new Set(gameList.map(g => g.complexity).filter((c): c is number => typeof c === 'number'))).sort((a, b) => a - b);

  const hasActiveFilters = Object.keys(currentFilter).length > 0;

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-semibold mb-3">Search & Filter</h3>
        
        <div className="space-y-4">
          {/* Search input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Games
            </label>
            <input
              type="text"
              value={currentFilter.search || ''}
              onChange={(e) => onFilterChange({ search: e.target.value || undefined })}
              placeholder="Search by title, designer, publisher..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={currentFilter.category || ''}
              onChange={(e) => onFilterChange({ category: e.target.value || undefined })}
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

          {/* Active/Inactive filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={currentFilter.isActive === undefined ? '' : currentFilter.isActive.toString()}
              onChange={(e) => {
                const value = e.target.value;
                onFilterChange({ 
                  isActive: value === '' ? undefined : value === 'true' 
                });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Games</option>
              <option value="true">Active Only</option>
              <option value="false">Inactive Only</option>
            </select>
          </div>

          {/* Advanced filters toggle */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            {showAdvanced ? '▼ Hide Advanced Filters' : '▶ Show Advanced Filters'}
          </button>

          {/* Advanced filters */}
          {showAdvanced && (
            <div className="space-y-4 pt-4 border-t border-gray-200">
              {/* Player count filters */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Players
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={currentFilter.minPlayers || ''}
                    onChange={(e) => onFilterChange({ 
                      minPlayers: e.target.value ? parseInt(e.target.value) : undefined 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Players
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={currentFilter.maxPlayers || ''}
                    onChange={(e) => onFilterChange({ 
                      maxPlayers: e.target.value ? parseInt(e.target.value) : undefined 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Complexity filter */}
              {complexities.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Complexity
                  </label>
                  <div className="space-y-2">
                    {complexities.map(complexity => (
                      <label key={complexity} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={currentFilter.complexity?.includes(complexity) || false}
                          onChange={(e) => {
                            const current = currentFilter.complexity || [];
                            const updated = e.target.checked
                              ? [...current, complexity]
                              : current.filter(c => c !== complexity);
                            onFilterChange({ 
                              complexity: updated.length > 0 ? updated : undefined 
                            });
                          }}
                          className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm">
                          {complexity}/5 {'★'.repeat(complexity)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags filter */}
              {allTags.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <div className="max-h-32 overflow-y-auto space-y-2 border border-gray-200 rounded p-2">
                    {allTags.map(tag => (
                      <label key={tag} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={currentFilter.tags?.includes(tag) || false}
                          onChange={(e) => {
                            const current = currentFilter.tags || [];
                            const updated = e.target.checked
                              ? [...current, tag]
                              : current.filter(t => t !== tag);
                            onFilterChange({ 
                              tags: updated.length > 0 ? updated : undefined 
                            });
                          }}
                          className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm">{tag}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Clear filters button */}
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Clear All Filters
            </button>
          )}
        </div>
      </div>

      {/* Sorting */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-semibold mb-3">Sort By</h3>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort Field
            </label>
            <select
              value={currentSort.by}
              onChange={(e) => onSortChange({ 
                ...currentSort, 
                by: e.target.value as GameSort['by'] 
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="title">Title</option>
              <option value="dateAdded">Date Added</option>
              <option value="maxPlayers">Max Players</option>
              <option value="complexity">Complexity</option>
              <option value="yearPublished">Year Published</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort Order
            </label>
            <select
              value={currentSort.order}
              onChange={(e) => onSortChange({ 
                ...currentSort, 
                order: e.target.value as GameSort['order'] 
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

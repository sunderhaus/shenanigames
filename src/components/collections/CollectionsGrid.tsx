'use client';

import { CollectionItem, CollectionPlayer } from '@/types/game-collection-types';

interface CollectionsGridProps {
  items: CollectionItem[];
  players: Record<string, CollectionPlayer>;
  gameList: Array<{
    id: string;
    title: string;
    image?: string;
  }>;
  viewMode: 'grid' | 'list';
  onEditItem: (item: CollectionItem) => void;
  onDeleteItem: (itemId: string) => void;
}

export default function CollectionsGrid({
  items,
  players,
  gameList,
  viewMode,
  onEditItem,
  onDeleteItem,
}: CollectionsGridProps) {
  return (
    <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : ''} gap-6`}>
      {items.map((item) => {
        const player = players[item.playerId];
        const game = gameList.find((g) => g.id === item.gameId);

        return (
          <div key={item.id} className="border rounded-lg bg-white shadow-md">
            <div className="flex justify-between p-4">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{player.icon}</span>
                <span className="font-medium text-gray-900">{player.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onEditItem(item)}
                  className="text-blue-600 hover:text-blue-800 focus:outline-none"
                  title="Edit Item"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 17l-4 4m0 0l4-4m-4 4l0-12h8l0 12m-4 0l8-8"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => onDeleteItem(item.id)}
                  className="text-red-600 hover:text-red-800 focus:outline-none"
                  title="Delete Item"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
            {game?.image && (
              <img
                src={game.image}
                alt={game.title}
                className="w-full h-48 object-cover object-center"
              />
            )}
            <div className="p-4">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {game?.title || 'Unknown Game'}
              </h3>
              <div className="text-sm text-gray-700">
                Condition: {item.condition || 'unknown'}
                <br />
                Acquired on: {item.dateAcquired?.toLocaleDateString() || 'unknown'}
                {item.notes && (
                  <>
                    <br />
                    Notes: {item.notes}
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}


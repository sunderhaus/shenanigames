'use client';

import { useState, useEffect } from 'react';
import { CollectionItem, CollectionPlayer } from '@/types/game-collection-types';

interface AddItemModalProps {
  item?: CollectionItem | null;
  players: CollectionPlayer[];
  games: Array<{
    id: string;
    title: string;
    image?: string;
  }>;
  selectedPlayerId?: string;
  onSave: (itemData: Partial<CollectionItem>) => void;
  onClose: () => void;
}

export default function AddItemModal({
  item,
  players,
  games,
  selectedPlayerId,
  onSave,
  onClose
}: AddItemModalProps) {
  const [formData, setFormData] = useState({
    gameId: item?.gameId || '',
    playerId: item?.playerId || selectedPlayerId || '',
    condition: item?.condition || 'good' as 'mint' | 'good' | 'fair' | 'poor',
    notes: item?.notes || '',
    dateAcquired: item?.dateAcquired 
      ? item.dateAcquired.toISOString().split('T')[0] 
      : new Date().toISOString().split('T')[0]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.gameId) newErrors.gameId = 'Please select a game';
    if (!formData.playerId) newErrors.playerId = 'Please select a player';
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      onSave({
        ...formData,
        dateAcquired: new Date(formData.dateAcquired)
      });
    }
  };

  const selectedGame = games.find(g => g.id === formData.gameId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {item ? 'Edit Collection Item' : 'Add Collection Item'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Game Selection */}
            <div>
              <label htmlFor="gameId" className="block text-sm font-medium text-gray-700 mb-1">
                Game *
              </label>
              <select
                id="gameId"
                value={formData.gameId}
                onChange={(e) => setFormData({ ...formData, gameId: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.gameId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select a game...</option>
                {games.map((game) => (
                  <option key={game.id} value={game.id}>
                    {game.title}
                  </option>
                ))}
              </select>
              {errors.gameId && (
                <p className="text-red-500 text-sm mt-1">{errors.gameId}</p>
              )}
            </div>

            {/* Game Preview */}
            {selectedGame?.image && (
              <div className="border rounded-lg overflow-hidden">
                <img
                  src={selectedGame.image}
                  alt={selectedGame.title}
                  className="w-full h-32 object-cover"
                />
                <p className="p-2 text-sm font-medium text-gray-900">{selectedGame.title}</p>
              </div>
            )}

            {/* Player Selection */}
            <div>
              <label htmlFor="playerId" className="block text-sm font-medium text-gray-700 mb-1">
                Player *
              </label>
              <select
                id="playerId"
                value={formData.playerId}
                onChange={(e) => setFormData({ ...formData, playerId: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.playerId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select a player...</option>
                {players.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.icon} {player.name}
                  </option>
                ))}
              </select>
              {errors.playerId && (
                <p className="text-red-500 text-sm mt-1">{errors.playerId}</p>
              )}
            </div>

            {/* Condition */}
            <div>
              <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1">
                Condition
              </label>
              <select
                id="condition"
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="mint">Mint</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>

            {/* Date Acquired */}
            <div>
              <label htmlFor="dateAcquired" className="block text-sm font-medium text-gray-700 mb-1">
                Date Acquired
              </label>
              <input
                type="date"
                id="dateAcquired"
                value={formData.dateAcquired}
                onChange={(e) => setFormData({ ...formData, dateAcquired: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Optional notes about this item..."
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {item ? 'Update Item' : 'Add Item'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { CollectionPlayer } from '@/types/game-collection-types';

interface AddPlayerModalProps {
  onSave: (playerData: Partial<CollectionPlayer>) => void;
  onClose: () => void;
}

const availableIcons = [
  '🐯', '🐼', '🦁', '🦊', '🐻', '🦉', '🐺', '🐸', '🐙', '🦀',
  '🐨', '🐰', '🦝', '🦔', '🐧', '🦆', '🐢', '🦖', '🐲', '🎮',
  '🎯', '🎲', '🎪', '🎨', '🎭', '🎸', '🎺', '🎹', '🎤', '🎧'
];

export default function AddPlayerModal({
  onSave,
  onClose
}: AddPlayerModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    icon: '🎮',
    isActive: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Please enter a player name';
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      onSave({
        name: formData.name.trim(),
        icon: formData.icon,
        isActive: formData.isActive
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Add New Player
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Player Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Player Name *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter player name..."
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Icon Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Player Icon
              </label>
              <div className="grid grid-cols-10 gap-2 max-h-32 overflow-y-auto border border-gray-200 rounded-md p-2">
                {availableIcons.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon })}
                    className={`text-lg p-2 rounded hover:bg-gray-100 transition-colors ${
                      formData.icon === icon ? 'bg-blue-100 border-2 border-blue-500' : 'border border-gray-200'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Selected: <span className="text-lg">{formData.icon}</span>
              </p>
            </div>

            {/* Active Status */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Active player</span>
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Inactive players won't appear in session management but will keep their collections
              </p>
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
                Add Player
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

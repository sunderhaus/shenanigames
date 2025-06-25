'use client';

import { useState } from 'react';
import { useGameLibrary } from '@/store/game-library-store';

interface AddGameModalProps {
  onClose: () => void;
}

export default function AddGameModal({ onClose }: AddGameModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    maxPlayers: 4,
    minPlayers: 1,
    link: '',
    image: '',
    description: '',
    playingTime: '',
    complexity: '',
    category: '',
    designer: '',
    publisher: '',
    yearPublished: '',
    tags: ''
  });

  const { addGame } = useGameLibrary();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Please enter a game title.');
      return;
    }

    const gameData = {
      title: formData.title.trim(),
      maxPlayers: formData.maxPlayers,
      minPlayers: formData.minPlayers,
      link: formData.link.trim() || undefined,
      image: formData.image.trim() || undefined,
      description: formData.description.trim() || undefined,
      playingTime: formData.playingTime.trim() || undefined,
      complexity: formData.complexity ? parseInt(formData.complexity) : undefined,
      category: formData.category.trim() || undefined,
      designer: formData.designer.trim() || undefined,
      publisher: formData.publisher.trim() || undefined,
      yearPublished: formData.yearPublished ? parseInt(formData.yearPublished) : undefined,
      tags: formData.tags.trim() ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : undefined
    };

    addGame(gameData);
    onClose();
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-screen overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Add New Game</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Required fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Game Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                placeholder="e.g., Strategy, Party, Card Game"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Player counts */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Players
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={formData.minPlayers}
                onChange={(e) => handleChange('minPlayers', parseInt(e.target.value) || 1)}
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
                value={formData.maxPlayers}
                onChange={(e) => handleChange('maxPlayers', parseInt(e.target.value) || 4)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Game details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Playing Time
              </label>
              <input
                type="text"
                value={formData.playingTime}
                onChange={(e) => handleChange('playingTime', e.target.value)}
                placeholder="e.g., 60-90 minutes"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Complexity (1-5)
              </label>
              <select
                value={formData.complexity}
                onChange={(e) => handleChange('complexity', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select complexity</option>
                <option value="1">1 - Very Light</option>
                <option value="2">2 - Light</option>
                <option value="3">3 - Medium</option>
                <option value="4">4 - Heavy</option>
                <option value="5">5 - Very Heavy</option>
              </select>
            </div>
          </div>

          {/* Designer and Publisher */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Designer
              </label>
              <input
                type="text"
                value={formData.designer}
                onChange={(e) => handleChange('designer', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Publisher
              </label>
              <input
                type="text"
                value={formData.publisher}
                onChange={(e) => handleChange('publisher', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Year Published
            </label>
            <input
              type="number"
              min="1800"
              max={new Date().getFullYear()}
              value={formData.yearPublished}
              onChange={(e) => handleChange('yearPublished', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Links and media */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              BoardGameGeek Link
            </label>
            <input
              type="url"
              value={formData.link}
              onChange={(e) => handleChange('link', e.target.value)}
              placeholder="https://boardgamegeek.com/boardgame/..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image URL
            </label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => handleChange('image', e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => handleChange('tags', e.target.value)}
              placeholder="strategy, worker-placement, euro"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Action buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add Game
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

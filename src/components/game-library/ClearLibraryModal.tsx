'use client';

import { useState } from 'react';
import { useGameLibrary } from '@/store/game-library-store';

interface ClearLibraryModalProps {
  onClose: () => void;
  totalGames: number;
}

export default function ClearLibraryModal({ onClose, totalGames }: ClearLibraryModalProps) {
  const [confirmText, setConfirmText] = useState('');
  const [isClearing, setIsClearing] = useState(false);
  const { clearLibrary } = useGameLibrary();

  const CONFIRM_TEXT = 'DELETE ALL GAMES';
  const isConfirmValid = confirmText === CONFIRM_TEXT;

  const handleClearLibrary = async () => {
    if (!isConfirmValid) return;
    
    setIsClearing(true);
    try {
      clearLibrary();
      onClose();
    } catch (error) {
      console.error('Error clearing library:', error);
    } finally {
      setIsClearing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-red-600">⚠️ Clear Game Library</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={isClearing}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <span className="text-red-400 text-xl">🚨</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    This action cannot be undone
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>
                      You are about to permanently delete all <strong>{totalGames} games</strong> from your library.
                      This will remove all game data, including:
                    </p>
                    <ul className="mt-2 list-disc list-inside space-y-1">
                      <li>Game titles and information</li>
                      <li>Custom descriptions and notes</li>
                      <li>Tags and categories</li>
                      <li>All metadata and settings</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                To confirm, type <strong className="font-mono text-red-600">{CONFIRM_TEXT}</strong> in the box below:
              </p>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={CONFIRM_TEXT}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                disabled={isClearing}
                autoFocus
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <div className="flex items-center">
                <span className="text-yellow-600 mr-2">💡</span>
                <p className="text-sm text-yellow-800">
                  <strong>Tip:</strong> Consider exporting your library to CSV or JSON before clearing it.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isClearing}
              className="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleClearLibrary}
              disabled={!isConfirmValid || isClearing}
              className="px-4 py-2 text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isClearing ? 'Clearing...' : 'Clear Library'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

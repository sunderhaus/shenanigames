'use client';

import { useState, useEffect } from 'react';
import { GameSession, Player } from '../types/types';
import { useSessionGameStore } from '../store/session-store';

interface GameSessionEditorProps {
  tableId: string;
  roundIndex: number;
  currentSession?: GameSession;
  seatedPlayers: Player[];
  gameTitle: string;
  onClose: () => void;
}

export default function GameSessionEditor({
  tableId,
  roundIndex,
  currentSession,
  seatedPlayers,
  gameTitle,
  onClose
}: GameSessionEditorProps) {
  const updateGameSession = useSessionGameStore(state => state.updateGameSession);

  // Form state
  const [winnerId, setWinnerId] = useState<string>(currentSession?.winnerId || '');
  const [gameStartedAt, setGameStartedAt] = useState<string>('');
  const [gameEndedAt, setGameEndedAt] = useState<string>('');

  // Initialize form with current session data
  useEffect(() => {
    if (currentSession?.gameStartedAt) {
      const startDate = currentSession.gameStartedAt instanceof Date 
        ? currentSession.gameStartedAt 
        : new Date(currentSession.gameStartedAt);
      setGameStartedAt(formatDateTimeForInput(startDate));
    }
    if (currentSession?.gameEndedAt) {
      const endDate = currentSession.gameEndedAt instanceof Date 
        ? currentSession.gameEndedAt 
        : new Date(currentSession.gameEndedAt);
      setGameEndedAt(formatDateTimeForInput(endDate));
    }
  }, [currentSession]);

  // Helper function to format Date for datetime-local input
  const formatDateTimeForInput = (date: Date): string => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Helper function to parse datetime-local input to Date
  const parseDateTimeInput = (value: string): Date | undefined => {
    if (!value) return undefined;
    return new Date(value);
  };

  // Handle form submission
  const handleSave = () => {
    const sessionUpdate: Partial<GameSession> = {};

    // Update winner
    if (winnerId !== (currentSession?.winnerId || '')) {
      sessionUpdate.winnerId = winnerId || undefined;
    }

    // Update start time
    const newStartTime = parseDateTimeInput(gameStartedAt);
    const currentStartTime = currentSession?.gameStartedAt 
      ? (currentSession.gameStartedAt instanceof Date 
          ? currentSession.gameStartedAt 
          : new Date(currentSession.gameStartedAt))
      : null;
    
    if (newStartTime?.getTime() !== currentStartTime?.getTime()) {
      sessionUpdate.gameStartedAt = newStartTime;
    }

    // Update end time
    const newEndTime = parseDateTimeInput(gameEndedAt);
    const currentEndTime = currentSession?.gameEndedAt 
      ? (currentSession.gameEndedAt instanceof Date 
          ? currentSession.gameEndedAt 
          : new Date(currentSession.gameEndedAt))
      : null;
    
    if (newEndTime?.getTime() !== currentEndTime?.getTime()) {
      sessionUpdate.gameEndedAt = newEndTime;
    }

    // Only update if there are changes
    if (Object.keys(sessionUpdate).length > 0) {
      updateGameSession(tableId, roundIndex, sessionUpdate);
    }

    onClose();
  };

  // Quick action to set current time
  const setCurrentTime = (field: 'start' | 'end') => {
    const now = formatDateTimeForInput(new Date());
    if (field === 'start') {
      setGameStartedAt(now);
    } else {
      setGameEndedAt(now);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full max-h-96 overflow-y-auto">
        <h3 className="text-xl font-bold mb-4">Game Session Details</h3>
        <p className="text-gray-600 mb-4">{gameTitle}</p>

        <div className="space-y-4">
          {/* Winner Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Winner
            </label>
            <select
              value={winnerId}
              onChange={(e) => setWinnerId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">No winner selected</option>
              {seatedPlayers.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.icon} {player.name}
                </option>
              ))}
            </select>
          </div>

          {/* Game Start Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Game Started
            </label>
            <div className="flex gap-2">
              <input
                type="datetime-local"
                value={gameStartedAt}
                onChange={(e) => setGameStartedAt(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setCurrentTime('start')}
                className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                title="Set current time"
              >
                Now
              </button>
            </div>
          </div>

          {/* Game End Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Game Ended
            </label>
            <div className="flex gap-2">
              <input
                type="datetime-local"
                value={gameEndedAt}
                onChange={(e) => setGameEndedAt(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setCurrentTime('end')}
                className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                title="Set current time"
              >
                Now
              </button>
            </div>
          </div>

          {/* Game Pick Time (Read-only) */}
          {currentSession?.gamePickedAt && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Game Picked
              </label>
              <input
                type="text"
                value={(() => {
                  const pickDate = currentSession.gamePickedAt instanceof Date 
                    ? currentSession.gamePickedAt 
                    : new Date(currentSession.gamePickedAt);
                  return pickDate.toLocaleString();
                })()}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
              />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

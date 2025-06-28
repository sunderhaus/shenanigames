'use client';

import React, { useState, useEffect } from 'react';
import { X, Users, Clock, Trophy } from 'lucide-react';
import { useGameLibrary } from '@/store/game-library-store';
import { useGameCollections } from '@/store/game-collection-store';
import { useSessionGameStore } from '@/store/session-store';
import { useSessionManager } from '@/store/session-manager';
import { GameSession } from '@/types/types';
import { SessionType } from '@/types/session-types';

interface AddTableModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddTableModal: React.FC<AddTableModalProps> = ({ isOpen, onClose }) => {
  const [selectedGameId, setSelectedGameId] = useState('');
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [winnerId, setWinnerId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [notes, setNotes] = useState('');

  const { gameList } = useGameLibrary();
  const { playerList } = useGameCollections();
  const { placeGame, joinGame, updateGameSession, tables, loadCurrentSession } = useSessionGameStore();
  const { updateCurrentSessionState } = useSessionManager();

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedGameId('');
      setSelectedPlayers([]);
      setWinnerId('');
      setStartTime('');
      setEndTime('');
      setNotes('');
    }
  }, [isOpen]);

  const selectedGame = gameList.find(game => game.id === selectedGameId);
  const availablePlayers = playerList.filter(player => player.isActive);

  const handlePlayerToggle = (playerId: string) => {
    setSelectedPlayers(prev => 
      prev.includes(playerId) 
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    );
  };

  const handleSubmit = () => {
    if (!selectedGameId) {
      alert('Please select a game.');
      return;
    }

    if (selectedGame && selectedPlayers.length > selectedGame.maxPlayers) {
      alert(`Too many players! ${selectedGame.title} supports a maximum of ${selectedGame.maxPlayers} players.`);
      return;
    }

    if (winnerId && !selectedPlayers.includes(winnerId)) {
      alert('Winner must be one of the selected players.');
      return;
    }

    if (!selectedGame) {
      alert('Selected game not found.');
      return;
    }

    // Get current session state
    const currentState = useSessionGameStore.getState();
    
    // Create a new table ID
    const newTableId = `table-${Date.now()}`;
    
    // Convert Library game to Session game format
    const sessionGame = {
      id: selectedGame.id,
      title: selectedGame.title,
      maxPlayers: selectedGame.maxPlayers,
      link: selectedGame.link,
      image: selectedGame.image
    };
    
    // Convert Collection players to Session players format
    const sessionPlayers = selectedPlayers.map(playerId => {
      const collectionPlayer = availablePlayers.find(p => p.id === playerId);
      return {
        id: playerId,
        name: collectionPlayer?.name || 'Unknown Player',
        icon: collectionPlayer?.icon || '🎮',
        selectionsMade: 0,
        picks: [],
        actionTakenInCurrentRound: false,
        optedOutOfRound: false
      };
    });
    
    // Create the new table
    const newTable = {
      id: newTableId,
      gameId: selectedGame.id,
      seatedPlayerIds: selectedPlayers,
      placedByPlayerId: undefined, // No picker in freeform sessions
      gameSession: {
        gamePickedAt: new Date(),
        ...(winnerId && { winnerId }),
        ...(startTime && { gameStartedAt: new Date(startTime) }),
        ...(endTime && { gameEndedAt: new Date(endTime) })
      }
    };
    
    // Update the session state directly
    const updatedState = {
      ...currentState,
      // Add the game to allGames and availableGames if not already there
      allGames: currentState.allGames.some(g => g.id === selectedGame.id) 
        ? currentState.allGames 
        : [...currentState.allGames, sessionGame],
      availableGames: currentState.availableGames.some(g => g.id === selectedGame.id)
        ? currentState.availableGames
        : [...currentState.availableGames, sessionGame],
      // Add new players to the session (keep existing players)
      players: [
        ...currentState.players,
        ...sessionPlayers.filter(sp => !currentState.players.some(p => p.id === sp.id))
      ],
      // Add the new table
      tables: [...currentState.tables, newTable],
      // Update rounds to include the new table state
      rounds: currentState.rounds.map((round, index) => 
        index === currentState.currentRoundIndex
          ? {
              ...round,
              tableStates: [...round.tableStates, {
                id: newTable.id,
                gameId: newTable.gameId,
                seatedPlayerIds: [...newTable.seatedPlayerIds],
                placedByPlayerId: undefined,
                gameSession: newTable.gameSession
              }]
            }
          : round
      )
    };
    
    // Save the updated state (sessionType is now preserved automatically)
    updateCurrentSessionState(updatedState);
    
    // Directly set the session store state to ensure immediate UI synchronization
    useSessionGameStore.setState(updatedState);

    // Wait until the next paint to close, ensuring all state updates are complete
    requestAnimationFrame(() => onClose());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Add New Table</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {/* Game Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Game *
              </label>
              <select
                value={selectedGameId}
                onChange={(e) => setSelectedGameId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose a game...</option>
                {gameList
                  .filter(game => game.isActive)
                  .sort((a, b) => a.title.localeCompare(b.title))
                  .map(game => (
                    <option key={game.id} value={game.id}>
                      {game.title} (Max {game.maxPlayers} players)
                    </option>
                  ))
                }
              </select>
              {selectedGame && (
                <p className="mt-1 text-sm text-gray-500">
                  Maximum {selectedGame.maxPlayers} players
                </p>
              )}
            </div>

            {/* Player Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="inline w-4 h-4 mr-1" />
                Select Players ({selectedPlayers.length} selected)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3">
                {availablePlayers.map(player => (
                  <label
                    key={player.id}
                    className={`flex items-center p-2 rounded cursor-pointer transition-colors ${
                      selectedPlayers.includes(player.id)
                        ? 'bg-blue-100 border border-blue-300'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedPlayers.includes(player.id)}
                      onChange={() => handlePlayerToggle(player.id)}
                      className="mr-2"
                    />
                    <span className="mr-1">{player.icon}</span>
                    <span className="text-sm">{player.name}</span>
                  </label>
                ))}
              </div>
              {selectedGame && selectedPlayers.length > selectedGame.maxPlayers && (
                <p className="mt-1 text-sm text-red-600">
                  Too many players selected! Maximum: {selectedGame.maxPlayers}
                </p>
              )}
            </div>

            {/* Winner Selection */}
            {selectedPlayers.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Trophy className="inline w-4 h-4 mr-1" />
                  Winner (optional)
                </label>
                <select
                  value={winnerId}
                  onChange={(e) => setWinnerId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No winner selected</option>
                  {selectedPlayers.map(playerId => {
                    const player = availablePlayers.find(p => p.id === playerId);
                    return player ? (
                      <option key={playerId} value={playerId}>
                        {player.icon} {player.name}
                      </option>
                    ) : null;
                  })}
                </select>
              </div>
            )}

            {/* Time Tracking */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline w-4 h-4 mr-1" />
                  Start Time (optional)
                </label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline w-4 h-4 mr-1" />
                  End Time (optional)
                </label>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this game session..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedGameId}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Table
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTableModal;

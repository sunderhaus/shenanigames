'use client';

import React, { useState, useEffect } from 'react';
import { X, Users, Clock, Trophy, Edit } from 'lucide-react';
import { useGameLibrary } from '@/store/game-library-store';
import { useGameCollections } from '@/store/game-collection-store';
import { useSessionGameStore } from '@/store/session-store';
import { useSessionManager } from '@/store/session-manager';
import { GameSession, Player, Table } from '@/types/types';

interface FreeformTableEditorProps {
  table: Table;
  onClose: () => void;
}

const FreeformTableEditor: React.FC<FreeformTableEditorProps> = ({ table, onClose }) => {
  const [selectedGameId, setSelectedGameId] = useState(table.gameId || '');
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([...table.seatedPlayerIds]);
  const [winnerId, setWinnerId] = useState(table.gameSession?.winnerId || '');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [notes, setNotes] = useState('');

  const { gameList } = useGameLibrary();
  const { playerList } = useGameCollections();
  const { loadCurrentSession } = useSessionGameStore();
  const { updateCurrentSessionState } = useSessionManager();

  // Initialize form with current table data
  useEffect(() => {
    if (table.gameSession?.gameStartedAt) {
      const startDate = table.gameSession.gameStartedAt instanceof Date
        ? table.gameSession.gameStartedAt
        : new Date(table.gameSession.gameStartedAt);
      setStartTime(formatDateTimeForInput(startDate));
    }
    if (table.gameSession?.gameEndedAt) {
      const endDate = table.gameSession.gameEndedAt instanceof Date
        ? table.gameSession.gameEndedAt
        : new Date(table.gameSession.gameEndedAt);
      setEndTime(formatDateTimeForInput(endDate));
    }
  }, [table]);

  const formatDateTimeForInput = (date: Date): string => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

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
    if (!selectedGameId || selectedPlayers.length === 0) {
      alert('Please select a game and at least one player.');
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

    // Get current session state
    const currentState = useSessionGameStore.getState();
    
    // Convert Library game to Session game format if game changed
    const sessionGame = selectedGame ? {
      id: selectedGame.id,
      title: selectedGame.title,
      maxPlayers: selectedGame.maxPlayers,
      link: selectedGame.link,
      image: selectedGame.image
    } : null;
    
    // Convert Collection players to Session players format for new players
    const newPlayerIds = selectedPlayers.filter(id => !currentState.players.some(p => p.id === id));
    const newSessionPlayers = newPlayerIds.map(playerId => {
      const collectionPlayer = availablePlayers.find(p => p.id === playerId);
      return {
        id: playerId,
        name: collectionPlayer?.name || 'Unknown Player',
        icon: collectionPlayer?.icon || '🎮',
        selectionsMade: 0,
        picks: [],
        actionTakenInCurrentRound: false
      };
    });
    
    // Update the table
    const updatedTables = currentState.tables.map(t => {
      if (t.id === table.id) {
        return {
          ...t,
          gameId: selectedGameId,
          seatedPlayerIds: selectedPlayers,
          placedByPlayerId: selectedPlayers[0], // First player is the placer
          gameSession: {
            gamePickedAt: t.gameSession?.gamePickedAt || new Date(),
            ...(winnerId && { winnerId }),
            ...(startTime && { gameStartedAt: new Date(startTime) }),
            ...(endTime && { gameEndedAt: new Date(endTime) })
          }
        };
      }
      return t;
    });
    
    // Update the session state
    const updatedState = {
      ...currentState,
      // Add the game to allGames and availableGames if not already there and game changed
      allGames: sessionGame && !currentState.allGames.some(g => g.id === selectedGameId)
        ? [...currentState.allGames, sessionGame]
        : currentState.allGames,
      availableGames: sessionGame && !currentState.availableGames.some(g => g.id === selectedGameId)
        ? [...currentState.availableGames, sessionGame]
        : currentState.availableGames,
      // Add new players if they're not already in the session
      players: [...currentState.players, ...newSessionPlayers],
      // Update tables
      tables: updatedTables,
      // Update rounds to reflect table changes
      rounds: currentState.rounds.map((round, index) => 
        index === currentState.currentRoundIndex
          ? {
              ...round,
              tableStates: round.tableStates.map(ts => 
                ts.id === table.id
                  ? {
                      id: table.id,
                      gameId: selectedGameId,
                      seatedPlayerIds: [...selectedPlayers],
                      placedByPlayerId: selectedPlayers[0],
                      gameSession: {
                        gamePickedAt: table.gameSession?.gamePickedAt || new Date(),
                        ...(winnerId && { winnerId }),
                        ...(startTime && { gameStartedAt: new Date(startTime) }),
                        ...(endTime && { gameEndedAt: new Date(endTime) })
                      }
                    }
                  : ts
              )
            }
          : round
      )
    };
    
    // Save the updated state
    updateCurrentSessionState(updatedState);
    
    // Force a refresh to update the UI
    setTimeout(() => {
      loadCurrentSession();
    }, 100);

    onClose();
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this table? This action cannot be undone.')) {
      const currentState = useSessionGameStore.getState();
      
      // Remove the table
      const updatedTables = currentState.tables.filter(t => t.id !== table.id);
      
      // Update rounds to remove this table state
      const updatedRounds = currentState.rounds.map(round => ({
        ...round,
        tableStates: round.tableStates.filter(ts => ts.id !== table.id)
      }));
      
      const updatedState = {
        ...currentState,
        tables: updatedTables,
        rounds: updatedRounds
      };
      
      updateCurrentSessionState(updatedState);
      
      // Force a refresh to update the UI
      setTimeout(() => {
        loadCurrentSession();
      }, 100);
      
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-96 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0">
          <h3 className="text-base font-semibold text-gray-900">
            <Edit className="inline w-4 h-4 mr-2" />
            Edit Table
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-4 py-3 min-h-0">
          <div className="space-y-3">
            {/* Game Selection */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Select Game *
              </label>
              <select
                value={selectedGameId}
                onChange={(e) => setSelectedGameId(e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Choose a game...</option>
                {gameList
                  .filter(game => game.isActive)
                  .sort((a, b) => a.title.localeCompare(b.title))
                  .map(game => (
                    <option key={game.id} value={game.id}>
                      {game.title} (Max {game.maxPlayers})
                    </option>
                  ))
                }
              </select>
              {selectedGame && (
                <p className="mt-0.5 text-xs text-gray-500">
                  Max {selectedGame.maxPlayers} players
                </p>
              )}
            </div>

            {/* Player Selection */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                <Users className="inline w-3 h-3 mr-1" />
                Players * ({selectedPlayers.length} selected)
              </label>
              <div className="grid grid-cols-1 gap-1 max-h-24 overflow-y-auto border border-gray-200 rounded-md p-1.5">
                {availablePlayers.map(player => (
                  <label
                    key={player.id}
                    className={`flex items-center px-2 py-1 rounded cursor-pointer transition-colors text-sm ${
                      selectedPlayers.includes(player.id)
                        ? 'bg-blue-100 border border-blue-300'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedPlayers.includes(player.id)}
                      onChange={() => handlePlayerToggle(player.id)}
                      className="mr-2 h-3 w-3"
                    />
                    <span className="mr-1">{player.icon}</span>
                    <span className="text-xs">{player.name}</span>
                  </label>
                ))}
              </div>
              {selectedGame && selectedPlayers.length > selectedGame.maxPlayers && (
                <p className="mt-0.5 text-xs text-red-600">
                  Too many players! Max: {selectedGame.maxPlayers}
                </p>
              )}
            </div>

            {/* Winner Selection */}
            {selectedPlayers.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <Trophy className="inline w-3 h-3 mr-1" />
                  Winner (optional)
                </label>
                <select
                  value={winnerId}
                  onChange={(e) => setWinnerId(e.target.value)}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
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
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <Clock className="inline w-3 h-3 mr-1" />
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <Clock className="inline w-3 h-3 mr-1" />
                  End Time
                </label>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this game session..."
                rows={2}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="flex justify-between px-4 py-3 border-t bg-gray-50 flex-shrink-0">
          {/* Delete button on the left */}
          <button
            onClick={handleDelete}
            className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
          >
            Delete
          </button>
          
          {/* Save/Cancel buttons on the right */}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedGameId || selectedPlayers.length === 0}
              className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreeformTableEditor;

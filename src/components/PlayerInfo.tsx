'use client';

import { useState, useEffect } from 'react';
import { useSessionGameStore } from '../store/session-store';
import { Player, Game, SessionStage } from '../types/types';
import DraggablePlayer from './DraggablePlayer';
import TurnOrderEditor, { TurnOrderForm } from './TurnOrderEditor';
import PickSelectionModal from './PickSelectionModal';
import DraggableGame from './DraggableGame';
import { useGameLibrary } from '@/store/game-library-store';

export default function PlayerInfo() {
  const [isEditingTurnOrder, setIsEditingTurnOrder] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [editPlayerName, setEditPlayerName] = useState('');
  const [editPlayerIcon, setEditPlayerIcon] = useState('');
  const [newPlayerIcon, setNewPlayerIcon] = useState('');
  const [showPlayerActions, setShowPlayerActions] = useState<string | null>(null);
  const [showIconPicker, setShowIconPicker] = useState<'new' | 'edit' | null>(null);
  const [pickSelectionPlayer, setPickSelectionPlayer] = useState<Player | null>(null);

  const players = useSessionGameStore(state => state.players);
  const turnOrder = useSessionGameStore(state => state.turnOrder);
  const currentPlayerTurnIndex = useSessionGameStore(state => state.currentPlayerTurnIndex);
  const draftingComplete = useSessionGameStore(state => state.draftingComplete);
  const availableGames = useSessionGameStore(state => state.availableGames);
  const tables = useSessionGameStore(state => state.tables);
  const stage = useSessionGameStore(state => state.stage);
  const passTurn = useSessionGameStore(state => state.passTurn);
  const addPlayer = useSessionGameStore(state => state.addPlayer);
  const removePlayer = useSessionGameStore(state => state.removePlayer);
  const updatePlayer = useSessionGameStore(state => state.updatePlayer);

  // Set isClient to true after component mounts (client-side only)
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Close player actions menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showPlayerActions) {
        setShowPlayerActions(null);
      }
    };

    if (showPlayerActions) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showPlayerActions]);

  // Get the current player's ID
  const currentPlayerId = turnOrder[currentPlayerTurnIndex];

  // Create a map of players by ID for easy lookup
  const playersById = players.reduce((acc, player) => {
    acc[player.id] = player;
    return acc;
  }, {} as Record<string, Player>);

  // Check if all players have taken actions in the current round
  const allPlayersHaveActed = players.every(player => player.actionTakenInCurrentRound);

  // Available icons for players
  const availableIcons = ['🐯', '🐼', '🦁', '🦊', '🐸', '🐱', '🐶', '🐺', '🦝', '🐰', '🐹', '🐭', '🐷', '🐮', '🐵', '🐨', '🐻', '🦔', '🐢', '🐝'];
  const usedIcons = players.map(p => p.icon);
  const unusedIcons = availableIcons.filter(icon => !usedIcons.includes(icon));

  // Player management functions
  const handleAddPlayer = () => {
    if (newPlayerName.trim()) {
      const playerId = addPlayer(newPlayerName.trim(), newPlayerIcon || undefined);
      if (playerId) {
        setNewPlayerName('');
        setNewPlayerIcon('');
        setIsAddingPlayer(false);
        setShowIconPicker(null);
      } else {
        alert('Failed to add player. Name might already exist.');
      }
    }
  };

  const handleRemovePlayer = (playerId: string) => {
    if (window.confirm('Are you sure you want to remove this player?')) {
      const success = removePlayer(playerId);
      if (!success) {
        alert('Cannot remove player. They might be seated at a table or be the last player.');
      }
      setShowPlayerActions(null);
    }
  };

  const handleUpdatePlayer = (playerId: string) => {
    if (editPlayerName.trim()) {
      const updates: { name?: string; icon?: string } = { name: editPlayerName.trim() };
      if (editPlayerIcon) {
        updates.icon = editPlayerIcon;
      }
      const success = updatePlayer(playerId, updates);
      if (success) {
        setEditingPlayerId(null);
        setEditPlayerName('');
        setEditPlayerIcon('');
        setShowIconPicker(null);
      } else {
        alert('Failed to update player. Name might already exist.');
      }
    }
  };

  const startEditingPlayer = (player: Player) => {
    setEditingPlayerId(player.id);
    setEditPlayerName(player.name);
    setEditPlayerIcon(player.icon);
    setShowPlayerActions(null);
  };

  const cancelEditingPlayer = () => {
    setEditingPlayerId(null);
    setEditPlayerName('');
    setEditPlayerIcon('');
    setShowIconPicker(null);
  };

  const cancelAddingPlayer = () => {
    setIsAddingPlayer(false);
    setNewPlayerName('');
    setNewPlayerIcon('');
    setShowIconPicker(null);
  };

  const togglePlayerActions = (playerId: string) => {
    setShowPlayerActions(showPlayerActions === playerId ? null : playerId);
  };

  const selectIcon = (icon: string, type: 'new' | 'edit') => {
    if (type === 'new') {
      setNewPlayerIcon(icon);
    } else {
      setEditPlayerIcon(icon);
    }
    setShowIconPicker(null);
  };

  // Remaining picks functionality
  const currentPlayer = isClient ? players.find(p => p.id === currentPlayerId) : null;
  const isSetupStage = stage === SessionStage.SETUP;
  const allTablesHaveGames = tables.every(table => table.gameId !== null);

  // Check if library selection should be shown
  const shouldShowLibrarySelection = () => {
    if (!isClient) return false;
    
    // Get all players who are not seated at any table
    const unseatedPlayers = players.filter(player => 
      !tables.some(table => table.seatedPlayerIds.includes(player.id))
    );
    
    // If no unseated players, don't show library selection
    if (unseatedPlayers.length === 0) return false;
    
    // Check if ALL unseated players have exhausted their picks
    const allUnseatedPlayersExhausted = unseatedPlayers.every(player => 
      player.picks.length === 0
    );
    
    return allUnseatedPlayersExhausted;
  };

  // Create games array based on player picks, including duplicates
  const filteredGames = isClient && currentPlayer 
    ? currentPlayer.picks.map(pickId => {
        const game = availableGames.find(g => g.id === pickId);
        return game;
      }).filter(Boolean) as Game[]
    : [];

  return (
    <div className="bg-white p-3 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-bold">Players</h2>

        <div>
          <TurnOrderEditor 
            isEditing={isEditingTurnOrder} 
            setIsEditing={setIsEditingTurnOrder} 
          />
        </div>
      </div>

      <div className="space-y-1">
        {isEditingTurnOrder ? (
          <div className="mt-1">
            <TurnOrderForm 
              players={players}
              turnOrder={turnOrder}
              updateTurnOrder={useSessionGameStore.getState().updateTurnOrder}
              currentPlayerTurnIndex={currentPlayerTurnIndex}
              setIsEditing={setIsEditingTurnOrder}
            />
          </div>
        ) : (
          <div className="flex flex-col space-y-1">
            {isClient && turnOrder.map((playerId, index) => {
              const player = playersById[playerId];
              const isCurrentPlayer = index === currentPlayerTurnIndex;
              const isEditing = editingPlayerId === player.id;

              if (isEditing) {
                return (
                  <div key={player.id} className="p-2 border rounded-lg bg-blue-50">
                    <div className="flex items-center space-x-2 mb-2">
                      <button
                        onClick={() => setShowIconPicker('edit')}
                        className="w-8 h-8 text-lg border rounded hover:bg-gray-100 flex items-center justify-center"
                        title="Change icon"
                      >
                        {editPlayerIcon || player.icon}
                      </button>
                      <input
                        type="text"
                        value={editPlayerName}
                        onChange={(e) => setEditPlayerName(e.target.value)}
                        className="flex-1 px-2 py-1 border rounded"
                        placeholder="Player name"
                        autoFocus
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleUpdatePlayer(player.id)}
                        className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEditingPlayer}
                        className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div key={player.id} className="relative">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <DraggablePlayer 
                        player={player}
                        isCurrentPlayer={isCurrentPlayer}
                        showPassButton={isCurrentPlayer && !draftingComplete}
                        onPassTurn={passTurn}
                        allPlayersHaveActed={allPlayersHaveActed}
                      />
                    </div>
                    <button
                      onClick={() => togglePlayerActions(player.id)}
                      className="ml-2 p-1 text-gray-400 hover:text-gray-600 rounded"
                      title="Player actions"
                    >
                      ⋮
                    </button>
                  </div>
                  
                  {showPlayerActions === player.id && (
                    <div className="absolute right-0 top-full mt-1 bg-white border rounded shadow-lg z-20 min-w-32">
                      <button
                        onClick={() => {
                          setPickSelectionPlayer(player);
                          setShowPlayerActions(null);
                        }}
                        className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
                      >
                        Select Picks ({player.picks.length}/2)
                      </button>
                      <button
                        onClick={() => startEditingPlayer(player)}
                        className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleRemovePlayer(player.id)}
                        className="block w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
            
            {/* Add player section */}
            {isAddingPlayer ? (
              <div className="p-2 border rounded-lg bg-green-50">
                <div className="flex items-center space-x-2 mb-2">
                  <button
                    onClick={() => setShowIconPicker('new')}
                    className="w-8 h-8 text-lg border rounded hover:bg-gray-100 flex items-center justify-center"
                    title="Select icon"
                  >
                    {newPlayerIcon || '👤'}
                  </button>
                  <input
                    type="text"
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    className="flex-1 px-2 py-1 border rounded"
                    placeholder="Player name"
                    autoFocus
                    onKeyPress={(e) => e.key === 'Enter' && handleAddPlayer()}
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleAddPlayer}
                    className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                  >
                    Add
                  </button>
                  <button
                    onClick={cancelAddingPlayer}
                    className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingPlayer(true)}
                className="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 text-sm"
              >
                + Add Player
              </button>
            )}
          </div>
        )}

        {isClient && draftingComplete && (
          <div className="mt-2 p-2 bg-green-100 text-green-800 rounded">
            Drafting complete! All players have passed.
          </div>
        )}
      </div>

      {/* Remaining Picks Section */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {isClient && currentPlayer ? (
              isSetupStage 
                ? `${currentPlayer.name}'s Picked Games`
                : `${currentPlayer.name}'s Remaining Picks`
            ) : (
              isSetupStage 
                ? "Player's Picked Games"
                : "Player's Remaining Picks"
            )}
          </h3>
          {isClient && currentPlayer && (
            <button
              onClick={() => setPickSelectionPlayer(currentPlayer)}
              className="px-3 py-1 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-300 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              title={stage === SessionStage.SETUP ? 'Select picks' : 'Update picks'}
            >
              ✏️ {stage === SessionStage.SETUP ? 'Select' : 'Edit'} Picks
            </button>
          )}
        </div>

        {isClient && allTablesHaveGames && (
          <div className="mb-4 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">
                  This rounds picks have been selected. Continue to the next round to see a player's remaining picks.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Show current player's remaining picks for all stages */}
        {filteredGames.length === 0 ? (
          isSetupStage ? (
            // During SETUP stage, show pick selection button when no picks
            currentPlayer && (
              <button
                onClick={() => setPickSelectionPlayer(currentPlayer)}
                className="w-full p-4 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50 transition-colors"
              >
                <div className="flex flex-col items-center space-y-2">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="font-medium">Select Games for {currentPlayer.name}</span>
                  <span className="text-sm opacity-75">Choose 2 games to continue</span>
                </div>
              </button>
            )
          ) : (
            <p className="text-gray-500">No games available</p>
          )
        ) : (
          <div className="space-y-2">
            {filteredGames.map((game: Game, index) => (
              <div key={`${game.id}-${index}`}>
                <DraggableGame game={game} pickIndex={index} disabled={allTablesHaveGames} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Icon picker modal */}
      {showIconPicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg max-w-md w-full max-h-96 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-3">Select an Icon</h3>
            
            {/* Show unused icons first */}
            {unusedIcons.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Available Icons</h4>
                <div className="grid grid-cols-8 gap-2">
                  {unusedIcons.map((icon, index) => (
                    <button
                      key={index}
                      onClick={() => selectIcon(icon, showIconPicker)}
                      className="w-10 h-10 text-xl border rounded hover:bg-gray-100 flex items-center justify-center"
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Show all icons */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">All Icons</h4>
              <div className="grid grid-cols-8 gap-2">
                {availableIcons.map((icon, index) => {
                  const isUsed = usedIcons.includes(icon);
                  return (
                    <button
                      key={index}
                      onClick={() => selectIcon(icon, showIconPicker)}
                      className={`w-10 h-10 text-xl border rounded flex items-center justify-center ${
                        isUsed 
                          ? 'bg-gray-100 text-gray-400 border-gray-300' 
                          : 'hover:bg-gray-100 border-gray-300'
                      }`}
                      title={isUsed ? 'Already in use' : ''}
                    >
                      {icon}
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => setShowIconPicker(null)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pick Selection Modal */}
      {pickSelectionPlayer && (
        <PickSelectionModal
          player={pickSelectionPlayer}
          onClose={() => setPickSelectionPlayer(null)}
        />
      )}
    </div>
  );
}

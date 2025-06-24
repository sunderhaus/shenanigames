'use client';

import { useGameStore } from '../store/store';
import { Player } from '../types/types';

export default function PlayerInfo() {
  const players = useGameStore(state => state.players);
  const turnOrder = useGameStore(state => state.turnOrder);
  const currentPlayerTurnIndex = useGameStore(state => state.currentPlayerTurnIndex);
  const draftingComplete = useGameStore(state => state.draftingComplete);
  const passTurn = useGameStore(state => state.passTurn);
  
  // Get the current player's ID
  const currentPlayerId = turnOrder[currentPlayerTurnIndex];
  
  // Create a map of players by ID for easy lookup
  const playersById = players.reduce((acc, player) => {
    acc[player.id] = player;
    return acc;
  }, {} as Record<string, Player>);
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Players</h2>
        
        {!draftingComplete && (
          <button 
            className="pass-button"
            onClick={() => passTurn()}
            disabled={draftingComplete}
          >
            Pass Turn
          </button>
        )}
      </div>
      
      <div className="space-y-2">
        <h3 className="font-medium text-sm text-gray-500">Turn Order:</h3>
        
        <div className="flex flex-wrap gap-2">
          {turnOrder.map((playerId, index) => {
            const player = playersById[playerId];
            const isCurrentPlayer = index === currentPlayerTurnIndex;
            
            return (
              <div 
                key={player.id}
                className={`player-token ${isCurrentPlayer ? 'current-player' : ''}`}
                // In a full implementation, this would be connected to a drag-and-drop library
                draggable={isCurrentPlayer && !draftingComplete}
              >
                <span>{player.name}</span>
                <span className="ml-1">({player.selectionsMade}/2)</span>
              </div>
            );
          })}
        </div>
        
        {draftingComplete && (
          <div className="mt-4 p-2 bg-green-100 text-green-800 rounded">
            Drafting complete! All players have passed.
          </div>
        )}
      </div>
    </div>
  );
}
'use client';

import { useSessionGameStore } from '../store/session-store';
import { useState, useEffect } from 'react';
import DraggablePlayer from './DraggablePlayer';

export default function ActivePlayerFooter() {
  // Use useState to manage client-side state
  const [isClient, setIsClient] = useState(false);

  // Get state from the store
  const players = useSessionGameStore(state => state.players);
  const turnOrder = useSessionGameStore(state => state.turnOrder);
  const currentPlayerTurnIndex = useSessionGameStore(state => state.currentPlayerTurnIndex);
  const draftingComplete = useSessionGameStore(state => state.draftingComplete);
  const passTurn = useSessionGameStore(state => state.passTurn);
  const tables = useSessionGameStore(state => state.tables);

  // Check if all tables have games
  const allTablesHaveGames = tables.every(table => table.gameId !== null);


  // Set isClient to true after component mounts (client-side only)
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Get the current player
  const currentPlayerId = turnOrder[currentPlayerTurnIndex];
  const currentPlayer = isClient ? players.find(p => p.id === currentPlayerId) : null;

  // Check if all players have taken actions in the current round
  const allPlayersHaveActed = players.every(player => player.actionTakenInCurrentRound);

  if (!isClient || !currentPlayer) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-md z-20">
      <div className="container mx-auto">
        {/* Active Player */}
        <div className="p-3">
          <div className="flex justify-between items-center">
            <div className="text-sm font-medium text-gray-500">Current Player:</div>
            <DraggablePlayer 
              player={currentPlayer}
              isCurrentPlayer={true}
              showPassButton={!draftingComplete}
              onPassTurn={passTurn}
              allPlayersHaveActed={allPlayersHaveActed}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

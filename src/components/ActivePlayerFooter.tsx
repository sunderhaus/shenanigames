'use client';

import { useGameStore } from '../store/store';
import { useState, useEffect } from 'react';
import DraggablePlayer from './DraggablePlayer';
import PlayersRemainingPicks from './PlayersRemainingPicks';

export default function ActivePlayerFooter() {
  // Use useState to manage client-side state
  const [isClient, setIsClient] = useState(false);

  // Get state from the store
  const players = useGameStore(state => state.players);
  const turnOrder = useGameStore(state => state.turnOrder);
  const currentPlayerTurnIndex = useGameStore(state => state.currentPlayerTurnIndex);
  const draftingComplete = useGameStore(state => state.draftingComplete);
  const passTurn = useGameStore(state => state.passTurn);
  const tables = useGameStore(state => state.tables);

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
    <div className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-md z-20 ${allTablesHaveGames ? 'has-warning' : ''}`}>
      <div className="container mx-auto">
        {/* Players Remaining Picks */}
        <div className="px-3 pt-3 pb-2 border-b border-gray-200">
          <PlayersRemainingPicks isFooter={true} />
        </div>

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

'use client';

import { useSessionGameStore } from '../store/session-store';
import { useSessionManager } from '../store/session-manager';
import { SessionType } from '../types/session-types';
import { useState, useEffect } from 'react';
import DraggablePlayer from './DraggablePlayer';
import PlayersRemainingPicks from './PlayersRemainingPicks';

interface ActivePlayerFooterProps {
  onAddTableClick?: () => void;
}

export default function ActivePlayerFooter({ onAddTableClick }: ActivePlayerFooterProps = {}) {
  // Use useState to manage client-side state
  const [isClient, setIsClient] = useState(false);

  // Get state from the store
  const players = useSessionGameStore(state => state.players);
  const turnOrder = useSessionGameStore(state => state.turnOrder);
  const currentPlayerTurnIndex = useSessionGameStore(state => state.currentPlayerTurnIndex);
  const draftingComplete = useSessionGameStore(state => state.draftingComplete);
  const passTurn = useSessionGameStore(state => state.passTurn);
  const optOutRound = useSessionGameStore(state => state.optOutRound);
  const tables = useSessionGameStore(state => state.tables);
  
  // Get session type to determine if footer should be shown
  const { getCurrentSession } = useSessionManager();
  const currentSession = getCurrentSession();
  const sessionType = currentSession?.metadata.sessionType || SessionType.PICKS;

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

// Show Add new table button for freeform sessions in mobile view
  if (sessionType === SessionType.FREEFORM) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-md z-20">
        <div className="container mx-auto p-3">
          <button
            onClick={onAddTableClick}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            + Add New Table
          </button>
        </div>
      </div>
    );
  }

  if (!isClient || !currentPlayer) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-md z-20">
      <div className="container mx-auto">
        {/* Remaining Picks */}
        <div className="p-3 border-b border-gray-200">
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
              onOptOut={optOutRound}
              allPlayersHaveActed={allPlayersHaveActed}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

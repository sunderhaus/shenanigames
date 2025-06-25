'use client';

import { useSessionGameStore } from '../store/session-store';
import { Game } from '../types/types';
import DraggableGame from './DraggableGame';
import { useEffect, useState } from 'react';

interface PlayersRemainingPicksProps {
  isFooter?: boolean;
}

export default function PlayersRemainingPicks({ isFooter = false }: PlayersRemainingPicksProps) {
  // Use useState to manage client-side state
  const [isClient, setIsClient] = useState(false);

  // Get state from the store
  const availableGames = useSessionGameStore(state => state.availableGames);
  const players = useSessionGameStore(state => state.players);
  const turnOrder = useSessionGameStore(state => state.turnOrder);
  const currentPlayerTurnIndex = useSessionGameStore(state => state.currentPlayerTurnIndex);
  const tables = useSessionGameStore(state => state.tables);

  // Set isClient to true after component mounts (client-side only)
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check if all tables have games
  const allTablesHaveGames = tables.every(table => table.gameId !== null);

  // Get the current player
  const currentPlayerId = turnOrder[currentPlayerTurnIndex];
  const currentPlayer = isClient ? players.find(p => p.id === currentPlayerId) : null;

  // Create games array based on player picks, including duplicates
  const filteredGames = isClient && currentPlayer 
    ? currentPlayer.picks.map(pickId => {
        const game = availableGames.find(g => g.id === pickId);
        return game;
      }).filter(Boolean) as Game[]
    : [];

  return (
    <div className={`bg-white ${isFooter ? 'p-0' : 'p-4 rounded-lg shadow-md'}`}>
      {!isFooter && (
        <h2 className="text-xl font-bold mb-4">
          {isClient && currentPlayer ? `${currentPlayer.name}'s Remaining Picks` : "Player's Remaining Picks"}
        </h2>
      )}

      {isClient && allTablesHaveGames && (
        <div className={`${isFooter ? 'mb-2 p-2 text-xs' : 'mb-4 p-4'} bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded`}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className={`${isFooter ? 'h-4 w-4' : 'h-5 w-5'} text-yellow-500`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className={`${isFooter ? 'text-xs' : 'text-sm'} font-medium`}>
                This rounds picks have been selected. Continue to the next round to see a player's remaining picks.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Hide game images in footer when all tables have games */}
      {isFooter && allTablesHaveGames ? (
        null
      ) : filteredGames.length === 0 ? (
        <p className="text-gray-500 text-center">All picks exhausted.</p>
      ) : (
        <div className={isFooter ? 'flex overflow-x-auto pb-2 space-x-2' : 'space-y-2'}>
          {filteredGames.map((game: Game, index) => (
            <div 
              key={`${game.id}-${index}`} 
              className={isFooter 
                ? filteredGames.length <= 2 
                  ? 'flex-1 min-w-0' // Equal width for 1-2 games
                  : 'flex-shrink-0 w-40' // Fixed width for 3+ games with horizontal scroll
                : ''
              }
            >
              <DraggableGame game={game} pickIndex={index} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

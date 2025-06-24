'use client';

import { useGameStore } from '../store/store';
import { Game } from '../types/types';
import DraggableGame from './DraggableGame';
import { useEffect, useState } from 'react';

export default function PlayersRemainingPicks() {
  const availableGames = useGameStore(state => state.availableGames);
  const players = useGameStore(state => state.players);
  const turnOrder = useGameStore(state => state.turnOrder);
  const currentPlayerTurnIndex = useGameStore(state => state.currentPlayerTurnIndex);
  const tables = useGameStore(state => state.tables);

  // Check if all tables have games
  const allTablesHaveGames = tables.every(table => table.gameId !== null);

  // Get the current player
  const currentPlayerId = turnOrder[currentPlayerTurnIndex];
  const currentPlayer = players.find(p => p.id === currentPlayerId);

  // Filter games to only show those in the current player's picks
  const filteredGames = currentPlayer 
    ? availableGames.filter(game => currentPlayer.picks.includes(game.id))
    : availableGames;

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">{currentPlayer ? `${currentPlayer.name}'s Remaining Picks` : "Player's Remaining Picks"}</h2>

      {allTablesHaveGames && (
        <div className="mb-4 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">
                All tables have games placed on them. No more games can be placed until the next round.
              </p>
            </div>
          </div>
        </div>
      )}

      {filteredGames.length === 0 ? (
        <p className="text-gray-500">No games available</p>
      ) : (
        <div className="space-y-2">
          {filteredGames.map((game: Game) => (
            <DraggableGame key={game.id} game={game} />
          ))}
        </div>
      )}
    </div>
  );
}

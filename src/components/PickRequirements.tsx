'use client';

import { useSessionGameStore } from '@/store/session-store';
import { useGameLibrary } from '@/store/game-library-store';
import { SessionStage } from '@/types/types';

export default function PickRequirements() {
  const players = useSessionGameStore(state => state.players);
  const stage = useSessionGameStore(state => state.stage);
  const { getGameById } = useGameLibrary();

  // Only show pick requirements during SETUP stage
  if (stage !== SessionStage.SETUP) {
    return null;
  }

  // Check if all players have exactly 2 picks
  const allPlayersHavePicks = players.every(player => player.picks.length === 2);
  const playersWithoutPicks = players.filter(player => player.picks.length < 2);

  if (allPlayersHavePicks) {
    return null; // Don't show anything if all players have picks
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-amber-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-amber-800">
            Player Picks Required
          </h3>
          <div className="mt-2 text-sm text-amber-700">
            <p className="mb-2">
              Before the game can begin, all players must select exactly 2 games from the library.
            </p>
            
            {playersWithoutPicks.length > 0 && (
              <div>
                <p className="font-medium mb-1">Players who still need to select picks:</p>
                <ul className="list-disc list-inside space-y-1">
                  {playersWithoutPicks.map(player => (
                    <li key={player.id}>
                      <span className="font-medium">{player.name}</span> - 
                      <span className="ml-1">
                        {player.picks.length === 0 ? 'No picks selected' : `${player.picks.length}/2 picks selected`}
                      </span>
                      {player.picks.length > 0 && (
                        <span className="ml-2 text-xs">
                          ({player.picks.map(gameId => getGameById(gameId)?.title || 'Unknown Game').join(', ')})
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <p className="mt-3 text-xs">
              💡 Use the "⋮" menu next to each player's name to select their picks from the game library.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

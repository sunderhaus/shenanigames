'use client';

import { useSessionGameStore } from '../store/session-store';
import { useSessionManager } from '../store/session-manager';
import { Game } from '../types/types';
import { SessionType } from '../types/session-types';
import DraggableGame from './DraggableGame';

export default function AvailableGamesList() {
  const availableGames = useSessionGameStore(state => state.availableGames);
  const players = useSessionGameStore(state => state.players);
  const turnOrder = useSessionGameStore(state => state.turnOrder);
  const currentPlayerTurnIndex = useSessionGameStore(state => state.currentPlayerTurnIndex);
  
  // Get session type
  const { getCurrentSession } = useSessionManager();
  const currentSession = getCurrentSession();
  const sessionType = currentSession?.metadata.sessionType || SessionType.PICKS;

  // Get the current player
  const currentPlayerId = turnOrder[currentPlayerTurnIndex];
  const currentPlayer = players.find(p => p.id === currentPlayerId);

  // Filter games based on session type
  let filteredGames: Game[] = [];
  let headerText = 'Available Games';
  
  if (sessionType === SessionType.FREEFORM) {
    // In Freeform mode, show all available games
    filteredGames = availableGames;
    headerText = '🎲 All Games (Freeform)';
  } else {
    // In Picks mode, show only the current player's picks
    filteredGames = currentPlayer 
      ? availableGames.filter(game => currentPlayer.picks.includes(game.id))
      : availableGames;
    headerText = `🎯 ${currentPlayer ? currentPlayer.name + "'s" : 'Your'} Picks`;
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">{headerText}</h2>

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

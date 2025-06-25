'use client';

import { useSessionGameStore } from '../store/session-store';
import { Game } from '../types/types';
import DraggableGame from './DraggableGame';

export default function AvailableGamesList() {
  const availableGames = useSessionGameStore(state => state.availableGames);
  const players = useSessionGameStore(state => state.players);
  const turnOrder = useSessionGameStore(state => state.turnOrder);
  const currentPlayerTurnIndex = useSessionGameStore(state => state.currentPlayerTurnIndex);

  // Get the current player
  const currentPlayerId = turnOrder[currentPlayerTurnIndex];
  const currentPlayer = players.find(p => p.id === currentPlayerId);

  // Filter games to only show those in the current player's picks
  const filteredGames = currentPlayer 
    ? availableGames.filter(game => currentPlayer.picks.includes(game.id))
    : availableGames;

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Available Games</h2>

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

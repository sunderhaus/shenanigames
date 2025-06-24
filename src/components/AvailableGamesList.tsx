'use client';

import { useGameStore } from '../store/store';
import { Game } from '../types/types';
import DraggableGame from './DraggableGame';

export default function AvailableGamesList() {
  const availableGames = useGameStore(state => state.availableGames);

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Available Games</h2>

      {availableGames.length === 0 ? (
        <p className="text-gray-500">No games available</p>
      ) : (
        <div className="space-y-2">
          {availableGames.map((game: Game) => (
            <DraggableGame key={game.id} game={game} />
          ))}
        </div>
      )}
    </div>
  );
}

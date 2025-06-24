'use client';

import { useGameStore } from '../store/store';
import { Game } from '../types/types';

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
            <div 
              key={game.id} 
              className="game-card"
              // In a full implementation, this would be connected to a drag-and-drop library
              draggable
            >
              <div className="flex items-center">
                {game.image && (
                  <img 
                    src={game.image} 
                    alt={game.title} 
                    className="w-12 h-12 object-cover rounded mr-2"
                  />
                )}
                <div>
                  <h3 className="font-medium">{game.title}</h3>
                  <p className="text-sm text-gray-500">Max Players: {game.maxPlayers}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
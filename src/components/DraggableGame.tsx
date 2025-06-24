import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Game } from '../types/types';
import { DraggableType, DraggableItem } from './DragAndDropProvider';
import { useGameStore } from '../store/store';

interface DraggableGameProps {
  game: Game;
}

const DraggableGame: React.FC<DraggableGameProps> = ({ game }) => {
  const turnOrder = useGameStore(state => state.turnOrder);
  const currentPlayerTurnIndex = useGameStore(state => state.currentPlayerTurnIndex);
  const draftingComplete = useGameStore(state => state.draftingComplete);
  const players = useGameStore(state => state.players);

  // Get the current player
  const currentPlayerId = turnOrder[currentPlayerTurnIndex];
  const currentPlayer = players.find(p => p.id === currentPlayerId);

  // Get tables to check if player has already assigned picks
  const tables = useGameStore(state => state.tables);

  // Check if the current player has already assigned any of their picks to a table
  const hasAssignedPicks = currentPlayer && tables.some(table => 
    table.gameId !== null && 
    currentPlayer.picks.includes(table.gameId) && 
    table.seatedPlayerIds.includes(currentPlayer.id)
  );

  // Determine if the game is draggable
  // A game is draggable if:
  // 1. It's the current player's turn
  // 2. Drafting is not complete
  // 3. The current player hasn't already assigned their picks to a table
  // 4. The game is in the player's picks
  const isInPlayerPicks = currentPlayer && currentPlayer.picks.includes(game.id);
  const isDraggable = !draftingComplete && currentPlayer && !hasAssignedPicks && isInPlayerPicks;

  // Set up draggable
  const draggableItem: DraggableItem = {
    id: game.id,
    type: DraggableType.GAME
  };

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: game.id,
    data: draggableItem,
    disabled: !isDraggable
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 1000 : 1,
    opacity: isDragging ? 0.8 : 1,
    cursor: isDraggable ? 'grab' : 'not-allowed'
  } : {
    cursor: isDraggable ? 'grab' : 'not-allowed'
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`game-card ${isDraggable ? 'draggable' : 'not-draggable'} ${isDragging ? 'dragging' : ''}`}
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
  );
};

export default DraggableGame;

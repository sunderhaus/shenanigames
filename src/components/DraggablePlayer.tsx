import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Player } from '../types/types';
import { DraggableType, DraggableItem } from './DragAndDropProvider';
import { useGameStore } from '../store/store';

interface DraggablePlayerProps {
  player: Player;
  isCurrentPlayer: boolean;
  showPassButton?: boolean;
  onPassTurn?: () => void;
}

const DraggablePlayer: React.FC<DraggablePlayerProps> = ({ 
  player, 
  isCurrentPlayer, 
  showPassButton = false, 
  onPassTurn 
}) => {
  const draftingComplete = useGameStore(state => state.draftingComplete);

  // Determine if the player is draggable
  // A player is draggable if:
  // 1. It's the current player's turn (isCurrentPlayer)
  // 2. Drafting is not complete
  const isDraggable = isCurrentPlayer && !draftingComplete;

  // Set up draggable
  const draggableItem: DraggableItem = {
    id: player.id,
    type: DraggableType.PLAYER
  };

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: player.id,
    data: draggableItem,
    disabled: !isDraggable
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 1000 : 1,
    opacity: isDragging ? 0.8 : 1,
    cursor: isDraggable ? 'grab' : 'default'
  } : {
    cursor: isDraggable ? 'grab' : 'default'
  };

  const handlePassTurn = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPassTurn) {
      onPassTurn();
    }
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`player-tile flex justify-between items-center p-2 border rounded-lg ${
        isCurrentPlayer ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
      } ${isDraggable ? 'draggable' : 'not-draggable'} ${isDragging ? 'dragging' : ''} ${
        player.actionTakenInCurrentRound ? 'action-taken' : ''
      } ${player.actionTakenInCurrentRound && showPassButton ? 'hide-checkmark' : ''}`}
    >
      <div className="flex items-center">
        <div className={`player-token mr-2 ${isCurrentPlayer ? 'current-player' : ''}`}>
          <span>{player.name.charAt(0)}</span>
        </div>
        <span className="font-medium">{player.name}</span>
      </div>

      {showPassButton && (
        <button 
          className="pass-button text-sm px-2 py-1"
          onClick={handlePassTurn}
        >
          Pass
        </button>
      )}
    </div>
  );
};

export default DraggablePlayer;

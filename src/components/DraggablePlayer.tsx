import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Player } from '../types/types';
import { DraggableType, DraggableItem } from './DragAndDropProvider';
import { useGameStore } from '../store/store';

interface DraggablePlayerProps {
  player: Player;
  isCurrentPlayer: boolean;
}

const DraggablePlayer: React.FC<DraggablePlayerProps> = ({ player, isCurrentPlayer }) => {
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

  return (
    <div 
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`player-token ${isCurrentPlayer ? 'current-player' : ''} ${isDraggable ? 'draggable' : 'not-draggable'} ${isDragging ? 'dragging' : ''}`}
    >
      <span>{player.name}</span>
    </div>
  );
};

export default DraggablePlayer;

import React, { useState } from 'react';
import { useGameStore } from '../store/store';
import { Player } from '../types/types';
import { DraggableType, DraggableItem } from './DragAndDropProvider';
import { useDraggable, useDroppable, DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Component for a draggable player in the turn order editor
const SortablePlayer: React.FC<{ player: Player, id: string }> = ({ player, id }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
    backgroundColor: '#f3f4f6',
    padding: '6px 10px',
    margin: '2px 0',
    borderRadius: '4px',
    border: '1px solid #e5e7eb',
    cursor: 'grab',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <span><span className="mr-2">{player.icon}</span>{player.name}</span>
      <span className="text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      </span>
    </div>
  );
};

// Main turn order editor component
interface TurnOrderEditorProps {
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
}

// Component for the reordering form
export const TurnOrderForm: React.FC<{
  players: Player[];
  turnOrder: string[];
  updateTurnOrder: (newTurnOrder: string[]) => void;
  currentPlayerTurnIndex: number;
  setIsEditing: (isEditing: boolean) => void;
}> = ({ players, turnOrder, updateTurnOrder, currentPlayerTurnIndex, setIsEditing }) => {
  // Create a map of players by ID for easy lookup
  const playersById = players.reduce((acc, player) => {
    acc[player.id] = player;
    return acc;
  }, {} as Record<string, Player>);

  // Get the ordered list of players based on turnOrder
  const orderedPlayers = turnOrder.map(id => playersById[id]).filter(Boolean);

  // Handle drag end event to reorder players
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    if (active.id !== over.id) {
      const oldIndex = turnOrder.indexOf(active.id as string);
      const newIndex = turnOrder.indexOf(over.id as string);

      const newTurnOrder = [...turnOrder];
      newTurnOrder.splice(oldIndex, 1);
      newTurnOrder.splice(newIndex, 0, active.id as string);

      updateTurnOrder(newTurnOrder);
    }
  };

  return (
    <div className="bg-white rounded-lg p-3">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">Reorder Players</h3>
        <button 
          onClick={() => setIsEditing(false)}
          className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded"
        >
          Done
        </button>
      </div>

      <p className="text-sm text-gray-600 mb-2">
        Drag and drop players to change the turn order.
      </p>

      <DndContext 
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={turnOrder}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-1">
            {orderedPlayers.map((player, index) => (
              <div key={player.id} className={index === currentPlayerTurnIndex ? "border-l-4 border-blue-500 pl-2" : ""}>
                <SortablePlayer player={player} id={player.id} />
              </div>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

const TurnOrderEditor: React.FC<TurnOrderEditorProps> = ({ isEditing, setIsEditing }) => {
  // Simple button component that toggles the edit mode
  return (
    <button 
      onClick={() => setIsEditing(!isEditing)}
      className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded flex items-center justify-center"
      aria-label="Edit Turn Order"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
      </svg>
    </button>
  );
};

export default TurnOrderEditor;

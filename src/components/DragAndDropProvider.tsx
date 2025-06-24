import React from 'react';
import { DndContext, DragEndEvent, DragStartEvent, DragOverEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { useGameStore } from '../store/store';

// Define the types of draggable items
export enum DraggableType {
  GAME = 'game',
  PLAYER = 'player',
  TURN_ORDER_PLAYER = 'turn_order_player'
}

// Define the structure of draggable items
export interface DraggableItem {
  id: string;
  type: DraggableType;
}

interface DragAndDropProviderProps {
  children: React.ReactNode;
}

export const DragAndDropProvider: React.FC<DragAndDropProviderProps> = ({ children }) => {
  const placeGame = useGameStore(state => state.placeGame);
  const joinGame = useGameStore(state => state.joinGame);
  const turnOrder = useGameStore(state => state.turnOrder);
  const currentPlayerTurnIndex = useGameStore(state => state.currentPlayerTurnIndex);
  const draftingComplete = useGameStore(state => state.draftingComplete);

  // Get the current player's ID
  const currentPlayerId = turnOrder[currentPlayerTurnIndex];

  // Configure sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Require a drag distance of 5px before activating
      activationConstraint: {
        distance: 5,
      },
    })
  );

  // Handle drag start event
  const handleDragStart = (event: DragStartEvent) => {
    // You can add logic here if needed when drag starts
    console.log('Drag started:', event);
  };

  // Handle drag over event for visual feedback
  const handleDragOver = (event: DragOverEvent) => {
    // You can add logic here for visual feedback during drag
    console.log('Drag over:', event);
  };

  // Handle drag end event
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return; // Dropped outside a droppable area

    // Extract the draggable item data
    const draggableItem = active.data.current as DraggableItem;

    // Extract the table ID from the over element
    const tableId = over.id as string;

    // Handle different types of draggable items
    if (draggableItem.type === DraggableType.GAME) {
      // A game was dropped on a table
      placeGame(draggableItem.id, tableId, currentPlayerId);
    } else if (draggableItem.type === DraggableType.PLAYER) {
      // A player was dropped on a table
      // Check if the dropped player is the current player
      if (draggableItem.id === currentPlayerId) {
        joinGame(tableId, currentPlayerId);
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      {children}
    </DndContext>
  );
};

export default DragAndDropProvider;

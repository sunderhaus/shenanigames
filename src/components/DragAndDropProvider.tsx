import React from 'react';
import { DndContext, DragEndEvent, DragStartEvent, DragOverEvent, useSensor, useSensors, PointerSensor, TouchSensor } from '@dnd-kit/core';
import { useSessionGameStore } from '../store/session-store';
import { SessionStage } from '../types/types';

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
  const placeGame = useSessionGameStore(state => state.placeGame);
  const joinGame = useSessionGameStore(state => state.joinGame);
  const turnOrder = useSessionGameStore(state => state.turnOrder);
  const currentPlayerTurnIndex = useSessionGameStore(state => state.currentPlayerTurnIndex);
  const draftingComplete = useSessionGameStore(state => state.draftingComplete);
  const players = useSessionGameStore(state => state.players);

  // Get the current player's ID
  const currentPlayerId = turnOrder[currentPlayerTurnIndex];

  // Configure sensors for drag detection
  const sensors = useSensors(
    // Pointer sensor for mouse/desktop interactions
    useSensor(PointerSensor, {
      // Require a drag distance of 5px before activating
      activationConstraint: {
        distance: 5,
      },
    }),
    // Touch sensor for mobile interactions with long press
    useSensor(TouchSensor, {
      // Require a long press of 250ms before activating
      activationConstraint: {
        delay: 250,
        tolerance: 5,
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

  // Check if the session is ready for game actions
  const canPerformGameActions = () => {
    const state = useSessionGameStore.getState();
    // Game actions are allowed in FIRST_ROUND, SUBSEQUENT_ROUNDS stages
    return state.stage === SessionStage.FIRST_ROUND || state.stage === SessionStage.SUBSEQUENT_ROUNDS;
  };

  // Handle drag end event
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return; // Dropped outside a droppable area

    // Check if the session stage allows game actions
    if (!canPerformGameActions()) {
      console.log('Cannot perform game actions in current session stage');
      return;
    }

    // Extract the draggable item data
    const draggableItem = active.data.current as DraggableItem;

    // Extract the table ID from the over element
    const tableId = over.id as string;

    // Handle different types of draggable items
    if (draggableItem.type === DraggableType.GAME) {
      // A game was dropped on a table
      // Extract the actual game ID and pick index from the unique draggable ID
      let gameId = draggableItem.id;
      let pickIndex: number | undefined = undefined;
      
      if (draggableItem.id.includes('-pick-')) {
        const parts = draggableItem.id.split('-pick-');
        gameId = parts[0];
        pickIndex = parseInt(parts[1], 10);
      }
      
      placeGame(gameId, tableId, currentPlayerId, pickIndex);
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

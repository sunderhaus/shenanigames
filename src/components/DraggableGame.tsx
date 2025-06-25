import React, { useState, useEffect } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Game } from '../types/types';
import { DraggableType, DraggableItem } from './DragAndDropProvider';
import { useSessionGameStore } from '../store/session-store';

interface DraggableGameProps {
  game: Game;
}

const DraggableGame: React.FC<DraggableGameProps> = ({ game }) => {
  const turnOrder = useSessionGameStore(state => state.turnOrder);
  const currentPlayerTurnIndex = useSessionGameStore(state => state.currentPlayerTurnIndex);
  const draftingComplete = useSessionGameStore(state => state.draftingComplete);
  const players = useSessionGameStore(state => state.players);
  const placeGame = useSessionGameStore(state => state.placeGame);

  // State to track clicks for double-click detection
  const [lastClickTime, setLastClickTime] = useState<number | null>(null);
  // State to track if the game was recently clicked (for visual feedback)
  const [recentlyClicked, setRecentlyClicked] = useState(false);

  // Get the current player
  const currentPlayerId = turnOrder[currentPlayerTurnIndex];
  const currentPlayer = players.find(p => p.id === currentPlayerId);

  // Get tables to check if player has already assigned picks
  const tables = useSessionGameStore(state => state.tables);
  const rounds = useSessionGameStore(state => state.rounds);
  const currentRoundIndex = useSessionGameStore(state => state.currentRoundIndex);

  // Handle click on the game card
  const handleGameClick = () => {
    const now = Date.now();

    // Check if this is a double-click (two clicks within 300ms)
    if (lastClickTime && now - lastClickTime < 300) {
      // Only allow placing if the game is a valid target for the current player
      if (isDraggable && currentPlayerId) {
        // Find an available table (one without a game assigned)
        const availableTable = tables.find(table => table.gameId === null);

        if (availableTable) {
          // Place the game on the available table
          placeGame(game.id, availableTable.id, currentPlayerId);
        }
      }
      // Reset the last click time after a double-click
      setLastClickTime(null);
      setRecentlyClicked(false);
    } else {
      // Update the last click time for single clicks
      setLastClickTime(now);

      // Set recently clicked for visual feedback
      if (isDraggable) {
        setRecentlyClicked(true);

        // Reset recently clicked after 300ms (the double-click threshold)
        setTimeout(() => {
          setRecentlyClicked(false);
        }, 300);
      }
    }
  };

  // Clear the click state when the component unmounts or when the game changes
  useEffect(() => {
    return () => {
      setLastClickTime(null);
      setRecentlyClicked(false);
    };
  }, [game.id]);

  // Check if the current player has already assigned any of their picks to a table
  const hasAssignedPicks = currentPlayer && tables.some(table => 
    table.gameId !== null && 
    currentPlayer.picks.includes(table.gameId) && 
    table.seatedPlayerIds.includes(currentPlayer.id)
  );

  // Check if the game was used in a previous round
  const isGameUsedInPreviousRound = rounds.slice(0, currentRoundIndex).some(round => 
    round.tableStates.some(tableState => tableState.gameId === game.id)
  );

  // Determine if the game is draggable
  // A game is draggable if:
  // 1. It's the current player's turn
  // 2. Drafting is not complete
  // 3. The current player hasn't already assigned their picks to a table
  // 4. The game is in the player's picks
  // 5. The game wasn't used in a previous round
  const isInPlayerPicks = currentPlayer && currentPlayer.picks.includes(game.id);
  const isDraggable = !draftingComplete && currentPlayer && !hasAssignedPicks && isInPlayerPicks && !isGameUsedInPreviousRound;

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

  // Get the recently clicked class
  const getRecentlyClickedClass = () => {
    return recentlyClicked ? 'recently-clicked' : '';
  };

  // Determine the tooltip text based on the game state
  const getTooltipText = () => {
    if (isDraggable) {
      return "Double-click to place on an available table";
    } else if (draftingComplete) {
      return "Drafting is complete";
    } else if (hasAssignedPicks) {
      return "You have already assigned your picks";
    } else if (!isInPlayerPicks) {
      return "This game is not in your picks";
    } else if (isGameUsedInPreviousRound) {
      return "This game was used in a previous round";
    } else {
      return "Not your turn";
    }
  };

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 1000 : 1,
    opacity: isDragging ? 0.8 : 1,
    cursor: isDraggable ? 'grab' : 'not-allowed',
    transition: 'all 0.2s ease',
    boxShadow: recentlyClicked ? '0 0 8px rgba(59, 130, 246, 0.5)' : ''
  } : {
    cursor: isDraggable ? 'grab' : 'not-allowed',
    transition: 'all 0.2s ease',
    boxShadow: recentlyClicked ? '0 0 8px rgba(59, 130, 246, 0.5)' : ''
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleGameClick}
      title={getTooltipText()}
      className={`game-card ${isDraggable ? 'draggable' : 'not-draggable'} ${isDragging ? 'dragging' : ''} ${getRecentlyClickedClass()}`}
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

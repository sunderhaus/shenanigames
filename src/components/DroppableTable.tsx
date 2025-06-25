import React, { useState, useEffect, useRef, TouchEvent } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Table, Game, Player } from '../types/types';
import { useSessionGameStore } from '../store/session-store';
import { useAnimation } from './AnimationProvider';

interface DroppableTableProps {
  table: Table;
  game?: Game;
  seatedPlayers: Player[];
  isReadOnly?: boolean;
}

const DroppableTable: React.FC<DroppableTableProps> = ({ table, game, seatedPlayers, isReadOnly = false }) => {
  const turnOrder = useSessionGameStore(state => state.turnOrder);
  const currentPlayerTurnIndex = useSessionGameStore(state => state.currentPlayerTurnIndex);
  const draftingComplete = useSessionGameStore(state => state.draftingComplete);
  const players = useSessionGameStore(state => state.players);
  const joinGame = useSessionGameStore(state => state.joinGame);
  const { animatePlayerToTable } = useAnimation();

  // State to track clicks for double-click detection
  const [lastClickTime, setLastClickTime] = useState<number | null>(null);
  // State to track if the table was recently clicked (for visual feedback)
  const [recentlyClicked, setRecentlyClicked] = useState(false);
  // State and refs for long press detection
  const [isLongPressing, setIsLongPressing] = useState(false);
  const longPressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const longPressDuration = 500; // ms, matching the TouchSensor delay

  // Handle click on the table
  const handleTableClick = () => {
    // If in read-only mode, do nothing
    if (isReadOnly) return;

    const now = Date.now();

    // Check if this is a double-click (two clicks within 300ms)
    if (lastClickTime && now - lastClickTime < 300) {
      // Only allow joining if the table is a valid target for the current player
      if (isValidPlayerTarget && currentPlayerId) {
        joinGame(table.id, currentPlayerId);
      }
      // Reset the last click time after a double-click
      setLastClickTime(null);
      setRecentlyClicked(false);
    } else {
      // Update the last click time for single clicks
      setLastClickTime(now);

      // Set recently clicked for visual feedback
      if (isValidPlayerTarget) {
        setRecentlyClicked(true);

        // Reset recently clicked after 300ms (the double-click threshold)
        setTimeout(() => {
          setRecentlyClicked(false);
        }, 300);
      }
    }
  };

  // Handle touch start - start the long press timer
  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    // If in read-only mode or not a valid target, do nothing
    if (isReadOnly || !isValidPlayerTarget || !currentPlayerId) return;

    // Start the long press timer
    longPressTimeoutRef.current = setTimeout(async () => {
      // Get the current player
      const player = players.find(p => p.id === currentPlayerId);

      if (player) {
        // Animate the player card to the table
        await animatePlayerToTable(player, table.id);

        // After animation completes, trigger join action
        joinGame(table.id, currentPlayerId);
      } else {
        // Fallback if player not found
        joinGame(table.id, currentPlayerId);
      }

      setIsLongPressing(false);

      // Visual feedback
      setRecentlyClicked(true);
      setTimeout(() => {
        setRecentlyClicked(false);
      }, 300);
    }, longPressDuration);

    setIsLongPressing(true);
  };

  // Handle touch end - clear the long press timer
  const handleTouchEnd = () => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }
    setIsLongPressing(false);
  };

  // Handle touch move - cancel long press if moved too much
  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    // Cancel long press on significant movement
    handleTouchEnd();
  };

  // Clear the click state and long press timer when the component unmounts or when the table changes
  useEffect(() => {
    return () => {
      setLastClickTime(null);
      setRecentlyClicked(false);
      if (longPressTimeoutRef.current) {
        clearTimeout(longPressTimeoutRef.current);
        longPressTimeoutRef.current = null;
      }
    };
  }, [table.id]);

  // Get the current player
  const currentPlayerId = turnOrder[currentPlayerTurnIndex];
  const currentPlayer = players.find(p => p.id === currentPlayerId);

  // Determine if the table is a valid drop target for games
  const isValidGameTarget = !draftingComplete && 
                           currentPlayer && 
                           currentPlayer.selectionsMade < 2 && 
                           table.gameId === null;

  // Determine if the table is a valid drop target for players
  const isValidPlayerTarget = !draftingComplete && 
                             currentPlayer && 
                             table.gameId !== null && 
                             !table.seatedPlayerIds.includes(currentPlayerId) &&
                             game && 
                             table.seatedPlayerIds.length < game.maxPlayers;

  // Set up droppable
  const { isOver, setNodeRef } = useDroppable({
    id: table.id,
    disabled: isReadOnly || draftingComplete || (!isValidGameTarget && !isValidPlayerTarget)
  });

  // Determine the appropriate class based on the drop target validity and hover state
  const getDropTargetClass = () => {
    if (isReadOnly) {
      return 'read-only-table';
    }

    if (isOver) {
      return 'drop-target-hover';
    }

    if (table.gameId === null) {
      return isValidGameTarget ? 'valid-game-target' : 'invalid-game-target';
    } else {
      return isValidPlayerTarget ? 'valid-player-target' : 'invalid-player-target';
    }
  };

  // Determine the tooltip text based on the table state
  const getTooltipText = () => {
    if (isReadOnly) {
      return "Historical view - read only";
    } else if (isValidPlayerTarget) {
      return "Double-click or long press to join this table";
    } else if (table.gameId === null) {
      return "Drop a game here";
    } else if (table.seatedPlayerIds.includes(currentPlayerId)) {
      return "You are already seated at this table";
    } else if (game && table.seatedPlayerIds.length >= game.maxPlayers) {
      return "This table is full";
    } else {
      return "Not your turn or drafting is complete";
    }
  };

  // Determine the cursor style based on whether the table is a valid target
  const getCursorStyle = () => {
    return isValidPlayerTarget ? 'cursor-pointer' : '';
  };

  // Get the recently clicked class
  const getRecentlyClickedClass = () => {
    return recentlyClicked ? 'recently-clicked' : '';
  };

  return (
    <div 
      ref={setNodeRef}
      onClick={handleTableClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onTouchCancel={handleTouchEnd}
      title={getTooltipText()}
      data-table-id={table.id}
      className={`table-card ${table.gameId ? 'has-game' : ''} ${getDropTargetClass()} ${getCursorStyle()} ${getRecentlyClickedClass()} ${isLongPressing ? 'long-pressing' : ''}`}
      style={{
        transition: 'all 0.2s ease',
        transform: recentlyClicked || isLongPressing ? 'scale(1.015)' : 'scale(1)', /* Reduced scale factor to prevent viewport clipping */
        boxShadow: recentlyClicked ? '0 0 8px rgba(59, 130, 246, 0.5)' : isLongPressing ? '0 0 12px rgba(59, 130, 246, 0.7)' : '',
        opacity: isReadOnly ? 0.85 : 1,
        pointerEvents: isReadOnly ? 'none' : 'auto',
        border: isReadOnly ? '1px dashed #ccc' : '',
        position: 'relative'
      }}
    >
      {/* Mobile long press indicator */}
      {isValidPlayerTarget && (
        <div className="absolute top-1 right-1 block md:hidden text-xs text-gray-500 bg-white bg-opacity-80 px-1 rounded">
          <span className="mr-1">👆</span>Long press to join
        </div>
      )}
      {/* Visual feedback during long press */}
      {isLongPressing && isValidPlayerTarget && (
        <div className="absolute inset-0 flex items-center justify-center bg-blue-100 bg-opacity-40 rounded">
        </div>
      )}
      <h3 className={`font-bold text-center ${game ? 'mb-2 text-base sm:text-lg sm:mb-3' : 'mb-2 text-lg sm:text-xl'}`}>{game ? game.title : table.id}</h3>

      {game ? (
        <div className="text-center flex-1 flex flex-col justify-start min-h-0 space-y-2">
          {game.image && (
            <div className="w-full game-image-container flex-shrink-0">
              <img 
                src={game.image} 
                alt={game.title} 
                className="game-image w-full h-auto"
                style={{ 
                  maxHeight: 'min(80px, 15vh)', 
                  height: 'auto'
                }}
              />
            </div>
          )}

          <div className="flex-shrink-0">
            <span className="text-sm sm:text-base font-medium text-gray-600">
              {table.seatedPlayerIds.length}/{game.maxPlayers} Players
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-1 sm:gap-2 flex-shrink-0">
            {seatedPlayers.map(player => (
              <div 
                key={player.id} 
                className={`player-token text-xs sm:text-sm ${player.id === table.placedByPlayerId ? 'game-picker font-bold' : ''}`}
                style={{
                  minWidth: '1.5rem',
                  height: '1.5rem',
                  fontSize: '0.75rem',
                  padding: '0.125rem 0.375rem'
                }}
              >
                {player.id === table.placedByPlayerId && (
                  <span className="mr-1 text-yellow-400">★</span>
                )}
                <span className="mr-1">{player.icon}</span>
                <span className="truncate max-w-16 sm:max-w-none">{player.name}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500">
          Drop a game here
        </div>
      )}
    </div>
  );
};

export default DroppableTable;

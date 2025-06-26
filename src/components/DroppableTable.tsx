import React, { useState, useEffect, useRef, TouchEvent } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Table, Game, Player } from '../types/types';
import { useSessionGameStore } from '../store/session-store';
import { useAnimation } from './AnimationProvider';
import GameSessionEditor from './GameSessionEditor';

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
  const removeGameFromTable = useSessionGameStore(state => state.removeGameFromTable);
  const viewingRoundIndex = useSessionGameStore(state => state.viewingRoundIndex);
  const { animatePlayerToTable } = useAnimation();
  
  // State for game session editor
  const [showSessionEditor, setShowSessionEditor] = useState(false);

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
        pointerEvents: 'auto', // Always allow pointer events so edit button works
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
                className={`player-token text-xs sm:text-sm ${player.id === table.placedByPlayerId ? 'game-picker font-bold' : ''} ${table.gameSession?.winnerId === player.id ? 'winner' : ''}`}
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
                {table.gameSession?.winnerId === player.id && (
                  <span className="mr-1 text-green-500">🏆</span>
                )}
                <span className="mr-1">{player.icon}</span>
                <span className="truncate max-w-16 sm:max-w-none">{player.name}</span>
              </div>
            ))}
          </div>
          
          {/* Session Status Indicators */}
          {table.gameSession && (
            <div className="flex justify-center gap-2 text-xs text-gray-500 mt-1">
              {table.gameSession.gameStartedAt && (
                <span title={`Started: ${new Date(table.gameSession.gameStartedAt).toLocaleString()}`}>
                  ▶️
                </span>
              )}
              {table.gameSession.gameEndedAt && (
                <span title={`Ended: ${new Date(table.gameSession.gameEndedAt).toLocaleString()}`}>
                  ⏹️
                </span>
              )}
              {table.gameSession.winnerId && (
                <span title="Winner recorded">
                  🏆
                </span>
              )}
            </div>
          )}
          
          {/* Historical Game Summary - only show in read-only mode */}
          {isReadOnly && table.gameSession && (
            <div className="mt-3 pt-2 border-t border-gray-200 text-xs space-y-1">
              {table.gameSession.winnerId && (() => {
                const winner = seatedPlayers.find(p => p.id === table.gameSession?.winnerId);
                return winner && (
                  <div className="flex items-center justify-center gap-1 text-green-600 font-medium">
                    <span>🏆</span>
                    <span>{winner.icon} {winner.name}</span>
                  </div>
                );
              })()}
              
              {table.gameSession.gamePickedAt && (() => {
                const pickDate = table.gameSession.gamePickedAt instanceof Date 
                  ? table.gameSession.gamePickedAt 
                  : new Date(table.gameSession.gamePickedAt);
                return (
                  <div className="text-center text-gray-600">
                    <div>Picked: {pickDate.toLocaleDateString()}</div>
                    <div>{pickDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                );
              })()}
              
              {(table.gameSession.gameStartedAt && table.gameSession.gameEndedAt) && (() => {
                const startDate = table.gameSession.gameStartedAt instanceof Date 
                  ? table.gameSession.gameStartedAt 
                  : new Date(table.gameSession.gameStartedAt);
                const endDate = table.gameSession.gameEndedAt instanceof Date 
                  ? table.gameSession.gameEndedAt 
                  : new Date(table.gameSession.gameEndedAt);
                
                // Calculate duration in milliseconds
                const durationMs = endDate.getTime() - startDate.getTime();
                
                // Convert to hours and minutes
                const hours = Math.floor(durationMs / (1000 * 60 * 60));
                const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
                
                // Format duration string
                let durationText = '';
                if (hours > 0) {
                  durationText += `${hours}h `;
                }
                if (minutes > 0 || hours === 0) {
                  durationText += `${minutes}m`;
                }
                
                return (
                  <div className="text-center text-gray-600">
                    <div>Duration: {durationText}</div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center text-gray-500">
          Drop a game here
        </div>
      )}
      
      {/* Game Action Buttons - show when there's a game */}
      {game && (
        <div className="absolute top-2 right-2 flex space-x-1">
          {/* Remove Game Button - only show for current round and if no players are seated */}
          {!isReadOnly && table.seatedPlayerIds.length === 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Remove ${game.title} from this table?`)) {
                  removeGameFromTable(table.id);
                }
              }}
              className="p-1 text-red-500 hover:text-red-700 bg-white bg-opacity-80 hover:bg-opacity-100 rounded transition-all duration-200"
              title="Remove game from table"
              style={{ pointerEvents: 'auto' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          
          {/* Edit Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowSessionEditor(true);
            }}
            className={`p-1 text-gray-500 hover:text-gray-700 bg-white bg-opacity-80 hover:bg-opacity-100 rounded transition-all duration-200 ${isReadOnly ? 'z-10' : ''}`}
            title={isReadOnly ? "Edit historical game session details" : "Edit game session details"}
            style={{ pointerEvents: 'auto' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        </div>
      )}
      
      {/* Game Session Editor Modal */}
      {showSessionEditor && game && (
        <GameSessionEditor
          tableId={table.id}
          roundIndex={viewingRoundIndex}
          currentSession={table.gameSession}
          seatedPlayers={seatedPlayers}
          gameTitle={game.title}
          onClose={() => setShowSessionEditor(false)}
        />
      )}
    </div>
  );
};

export default DroppableTable;

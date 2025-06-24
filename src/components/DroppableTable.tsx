import React, { useState, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Table, Game, Player } from '../types/types';
import { useGameStore } from '../store/store';

interface DroppableTableProps {
  table: Table;
  game?: Game;
  seatedPlayers: Player[];
}

const DroppableTable: React.FC<DroppableTableProps> = ({ table, game, seatedPlayers }) => {
  const turnOrder = useGameStore(state => state.turnOrder);
  const currentPlayerTurnIndex = useGameStore(state => state.currentPlayerTurnIndex);
  const draftingComplete = useGameStore(state => state.draftingComplete);
  const players = useGameStore(state => state.players);
  const joinGame = useGameStore(state => state.joinGame);

  // State to track clicks for double-click detection
  const [lastClickTime, setLastClickTime] = useState<number | null>(null);
  // State to track if the table was recently clicked (for visual feedback)
  const [recentlyClicked, setRecentlyClicked] = useState(false);

  // Handle click on the table
  const handleTableClick = () => {
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

  // Clear the click state when the component unmounts or when the table changes
  useEffect(() => {
    return () => {
      setLastClickTime(null);
      setRecentlyClicked(false);
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
    disabled: draftingComplete || (!isValidGameTarget && !isValidPlayerTarget)
  });

  // Determine the appropriate class based on the drop target validity and hover state
  const getDropTargetClass = () => {
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
    if (isValidPlayerTarget) {
      return "Double-click to join this table";
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
      title={getTooltipText()}
      className={`table-card ${table.gameId ? 'has-game' : ''} ${getDropTargetClass()} ${getCursorStyle()} ${getRecentlyClickedClass()}`}
      style={{
        transition: 'all 0.2s ease',
        transform: recentlyClicked ? 'scale(1.02)' : 'scale(1)',
        boxShadow: recentlyClicked ? '0 0 8px rgba(59, 130, 246, 0.5)' : ''
      }}
    >
      <h3 className="font-medium text-center mb-2">{table.id}</h3>

      {game ? (
        <div className="text-center">
          {game.image && (
            <div className="mb-2 w-full">
              <img 
                src={game.image} 
                alt={game.title} 
                className="game-image w-full h-auto"
                style={{ maxHeight: '120px' }}
              />
            </div>
          )}

          <div className="font-bold mb-2">{game.title}</div>

          <div className="mb-2">
            <span className="text-sm text-gray-500">
              {table.seatedPlayerIds.length}/{game.maxPlayers} Players
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-1">
            {seatedPlayers.map(player => (
              <div key={player.id} className="player-token">
                {player.name}
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

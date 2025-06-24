import React from 'react';
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

  return (
    <div 
      ref={setNodeRef}
      className={`table-card ${table.gameId ? 'has-game' : ''} ${getDropTargetClass()}`}
    >
      <h3 className="font-medium text-center mb-2">{table.id}</h3>
      
      {game ? (
        <div className="text-center">
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
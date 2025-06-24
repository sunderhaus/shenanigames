'use client';

import { useState } from 'react';
import { useGameStore } from '../store/store';
import { Player } from '../types/types';
import DraggablePlayer from './DraggablePlayer';
import TurnOrderEditor, { TurnOrderForm } from './TurnOrderEditor';

export default function PlayerInfo() {
  const [isEditingTurnOrder, setIsEditingTurnOrder] = useState(false);
  const players = useGameStore(state => state.players);
  const turnOrder = useGameStore(state => state.turnOrder);
  const currentPlayerTurnIndex = useGameStore(state => state.currentPlayerTurnIndex);
  const draftingComplete = useGameStore(state => state.draftingComplete);
  const passTurn = useGameStore(state => state.passTurn);

  // Get the current player's ID
  const currentPlayerId = turnOrder[currentPlayerTurnIndex];

  // Create a map of players by ID for easy lookup
  const playersById = players.reduce((acc, player) => {
    acc[player.id] = player;
    return acc;
  }, {} as Record<string, Player>);

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Players</h2>

        <div>
          <TurnOrderEditor 
            isEditing={isEditingTurnOrder} 
            setIsEditing={setIsEditingTurnOrder} 
          />
        </div>
      </div>

      <div className="space-y-2">
        {isEditingTurnOrder ? (
          <div className="mt-2">
            <TurnOrderForm 
              players={players}
              turnOrder={turnOrder}
              updateTurnOrder={useGameStore.getState().updateTurnOrder}
              currentPlayerTurnIndex={currentPlayerTurnIndex}
              setIsEditing={setIsEditingTurnOrder}
            />
          </div>
        ) : (
          <div className="flex flex-col space-y-2">
            {turnOrder.map((playerId, index) => {
              const player = playersById[playerId];
              const isCurrentPlayer = index === currentPlayerTurnIndex;

              return (
                <DraggablePlayer 
                  key={player.id}
                  player={player}
                  isCurrentPlayer={isCurrentPlayer}
                  showPassButton={isCurrentPlayer && !draftingComplete}
                  onPassTurn={passTurn}
                />
              );
            })}
          </div>
        )}

        {draftingComplete && (
          <div className="mt-4 p-2 bg-green-100 text-green-800 rounded">
            Drafting complete! All players have passed.
          </div>
        )}
      </div>
    </div>
  );
}

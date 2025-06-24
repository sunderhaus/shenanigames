'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '../store/store';
import { Player } from '../types/types';
import DraggablePlayer from './DraggablePlayer';
import TurnOrderEditor, { TurnOrderForm } from './TurnOrderEditor';

export default function PlayerInfo() {
  const [isEditingTurnOrder, setIsEditingTurnOrder] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const players = useGameStore(state => state.players);
  const turnOrder = useGameStore(state => state.turnOrder);
  const currentPlayerTurnIndex = useGameStore(state => state.currentPlayerTurnIndex);
  const draftingComplete = useGameStore(state => state.draftingComplete);
  const passTurn = useGameStore(state => state.passTurn);

  // Set isClient to true after component mounts (client-side only)
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Get the current player's ID
  const currentPlayerId = turnOrder[currentPlayerTurnIndex];

  // Create a map of players by ID for easy lookup
  const playersById = players.reduce((acc, player) => {
    acc[player.id] = player;
    return acc;
  }, {} as Record<string, Player>);

  // Check if all players have taken actions in the current round
  const allPlayersHaveActed = players.every(player => player.actionTakenInCurrentRound);

  return (
    <div className="bg-white p-3 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-bold">Players</h2>

        <div>
          <TurnOrderEditor 
            isEditing={isEditingTurnOrder} 
            setIsEditing={setIsEditingTurnOrder} 
          />
        </div>
      </div>

      <div className="space-y-1">
        {isEditingTurnOrder ? (
          <div className="mt-1">
            <TurnOrderForm 
              players={players}
              turnOrder={turnOrder}
              updateTurnOrder={useGameStore.getState().updateTurnOrder}
              currentPlayerTurnIndex={currentPlayerTurnIndex}
              setIsEditing={setIsEditingTurnOrder}
            />
          </div>
        ) : (
          <div className="flex flex-col space-y-1">
            {isClient && turnOrder.map((playerId, index) => {
              const player = playersById[playerId];
              const isCurrentPlayer = index === currentPlayerTurnIndex;

              return (
                <DraggablePlayer 
                  key={player.id}
                  player={player}
                  isCurrentPlayer={isCurrentPlayer}
                  showPassButton={isCurrentPlayer && !draftingComplete}
                  onPassTurn={passTurn}
                  allPlayersHaveActed={allPlayersHaveActed}
                />
              );
            })}
          </div>
        )}

        {isClient && draftingComplete && (
          <div className="mt-2 p-2 bg-green-100 text-green-800 rounded">
            Drafting complete! All players have passed.
          </div>
        )}
      </div>
    </div>
  );
}

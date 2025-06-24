'use client';

import { useGameStore } from '../store/store';
import { Table, Game, Player } from '../types/types';
import DroppableTable from './DroppableTable';
import { useState } from 'react';

export default function TablesArea() {
  const tables = useGameStore(state => state.tables);
  const availableGames = useGameStore(state => state.availableGames);
  const allGames = useGameStore(state => state.allGames);
  const players = useGameStore(state => state.players);
  const rounds = useGameStore(state => state.rounds);
  const currentRoundIndex = useGameStore(state => state.currentRoundIndex);
  const viewingRoundIndex = useGameStore(state => state.viewingRoundIndex);
  const isViewingHistory = useGameStore(state => state.isViewingHistory);
  const isRoundComplete = useGameStore(state => state.isRoundComplete);
  const createNewRound = useGameStore(state => state.createNewRound);
  const resetRound = useGameStore(state => state.resetRound);
  const viewPreviousRound = useGameStore(state => state.viewPreviousRound);
  const viewNextRound = useGameStore(state => state.viewNextRound);
  const returnToCurrentRound = useGameStore(state => state.returnToCurrentRound);

  // State for reset confirmation dialogue
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);

  // Create a map of all games by ID for easy lookup
  const allGamesById = allGames.reduce((acc, game) => {
    acc[game.id] = game;
    return acc;
  }, {} as Record<string, Game>);

  // Create a map of available games by ID for easy lookup
  const availableGamesById = availableGames.reduce((acc, game) => {
    acc[game.id] = game;
    return acc;
  }, {} as Record<string, Game>);

  // Create a map of players by ID for easy lookup
  const playersById = players.reduce((acc, player) => {
    acc[player.id] = player;
    return acc;
  }, {} as Record<string, Player>);

  // Function to find a game by ID (including games that are already placed on tables)
  const findGameById = (gameId: string | null): Game | undefined => {
    if (!gameId) return undefined;

    // Look up the game in allGamesById which contains all games
    return allGamesById[gameId];
  };

  // Check if the current round is complete
  const roundComplete = isRoundComplete();
  const currentRound = rounds[currentRoundIndex];

  // Get the round that is currently being viewed (may be a historical round)
  const viewingRound = rounds[viewingRoundIndex];

  // Check if all tables have games
  const allTablesHaveGames = tables.every(table => table.gameId !== null);

  // Check if all players have taken actions in the current round
  const allPlayersHaveActed = players.every(player => player.actionTakenInCurrentRound);

  // Determine if we can navigate to previous or next rounds
  const hasPreviousRound = viewingRoundIndex > 0;
  const hasNextRound = viewingRoundIndex < rounds.length - 1;

  // Handle next round button click
  const handleNextRound = () => {
    if (roundComplete) {
      createNewRound();
    }
  };

  // Handle reset round button click - show confirmation
  const handleResetRound = () => {
    setShowResetConfirmation(true);
  };

  // Handle actual reset when confirmed
  const confirmReset = () => {
    resetRound();
    setShowResetConfirmation(false);
  };

  // Handle cancel reset
  const cancelReset = () => {
    setShowResetConfirmation(false);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      {/* Reset Confirmation Modal */}
      {showResetConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Reset Round</h3>
            <p className="mb-6">Are you sure you want to reset this round? All placements will be cleared.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelReset}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={confirmReset}
                className="px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Tables</h2>
        <div className="flex items-center">
          <div className="flex items-center mr-4">
            <button
              onClick={viewPreviousRound}
              disabled={!hasPreviousRound}
              className={`px-2 py-1 rounded ${
                hasPreviousRound
                  ? "text-blue-500 hover:text-blue-700"
                  : "text-gray-300 cursor-not-allowed"
              }`}
              aria-label="Previous Round"
            >
              ←
            </button>
            <span className="mx-2">
              {`Round ${viewingRoundIndex + 1} of ${rounds.length}`}
              {isViewingHistory && " (History)"}
              {!isViewingHistory && roundComplete && " (Set)"}
            </span>
            <button
              onClick={viewNextRound}
              disabled={!hasNextRound}
              className={`px-2 py-1 rounded ${
                hasNextRound
                  ? "text-blue-500 hover:text-blue-700"
                  : "text-gray-300 cursor-not-allowed"
              }`}
              aria-label="Next Round"
            >
              →
            </button>
            {isViewingHistory && (
              <button
                onClick={returnToCurrentRound}
                className="ml-2 px-2 py-1 text-sm rounded bg-blue-500 hover:bg-blue-600 text-white"
              >
                Return to Current
              </button>
            )}
          </div>
          {!isViewingHistory && (
            <div className="flex space-x-2">
              <button
                onClick={handleResetRound}
                className="px-4 py-2 rounded bg-yellow-500 hover:bg-yellow-600 text-white flex items-center justify-center"
                aria-label="Reset Round"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                  <path d="M3 3v5h5"></path>
                </svg>
              </button>
              <button
                onClick={handleNextRound}
                disabled={!roundComplete}
                className={`px-4 py-2 rounded ${
                  roundComplete
                    ? "bg-blue-500 hover:bg-blue-600 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Next Round
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
        {isViewingHistory 
          ? viewingRound.tableStates.map((tableState) => {
              const game = findGameById(tableState.gameId);

              // Get the seated players for this table state
              const seatedPlayers = tableState.seatedPlayerIds
                .map(playerId => playersById[playerId])
                .filter(player => player !== undefined) as Player[];

              // Convert TableState to Table for DroppableTable
              const tableForDisplay: Table = {
                id: tableState.id,
                gameId: tableState.gameId,
                seatedPlayerIds: tableState.seatedPlayerIds,
                placedByPlayerId: tableState.placedByPlayerId
              };

              return (
                <DroppableTable 
                  key={tableState.id}
                  table={tableForDisplay}
                  game={game}
                  seatedPlayers={seatedPlayers}
                  isReadOnly={true}
                />
              );
            })
          : tables.map((table: Table) => {
              const game = findGameById(table.gameId);

              // Get the seated players for this table
              const seatedPlayers = table.seatedPlayerIds
                .map(playerId => playersById[playerId])
                .filter(player => player !== undefined) as Player[];

              return (
                <DroppableTable 
                  key={table.id}
                  table={table}
                  game={game}
                  seatedPlayers={seatedPlayers}
                  isReadOnly={false}
                />
              );
            })
        }
      </div>
    </div>
  );
}

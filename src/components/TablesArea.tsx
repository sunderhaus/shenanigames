'use client';

import { useSessionGameStore } from '../store/session-store';
import { Table, Game, Player } from '../types/types';
import DroppableTable from './DroppableTable';
import { useState, useEffect, useRef, TouchEvent } from 'react';

interface TablesAreaProps {
  isMobile?: boolean;
}

export default function TablesArea({ isMobile = false }: TablesAreaProps) {
  // Use useState to manage client-side state
  const [isClient, setIsClient] = useState(false);
  const [currentTableIndex, setCurrentTableIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const swipeContainerRef = useRef<HTMLDivElement>(null);

  const tables = useSessionGameStore(state => state.tables);
  const availableGames = useSessionGameStore(state => state.availableGames);
  const allGames = useSessionGameStore(state => state.allGames);
  const players = useSessionGameStore(state => state.players);
  const rounds = useSessionGameStore(state => state.rounds);
  const currentRoundIndex = useSessionGameStore(state => state.currentRoundIndex);
  const viewingRoundIndex = useSessionGameStore(state => state.viewingRoundIndex);
  const isViewingHistory = useSessionGameStore(state => state.isViewingHistory);
  const isRoundComplete = useSessionGameStore(state => state.isRoundComplete);
  const createNewRound = useSessionGameStore(state => state.createNewRound);
  const resetRound = useSessionGameStore(state => state.resetRound);
  const viewPreviousRound = useSessionGameStore(state => state.viewPreviousRound);
  const viewNextRound = useSessionGameStore(state => state.viewNextRound);
  const returnToCurrentRound = useSessionGameStore(state => state.returnToCurrentRound);

  // Set isClient to true after component mounts (client-side only)
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Reset current table index when tables change or when switching between mobile and desktop
  useEffect(() => {
    setCurrentTableIndex(0);
  }, [tables.length, isMobile]);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  // Handle touch start
  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  // Handle touch move
  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  // Handle touch end
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    // Don't navigate if already animating
    if (isAnimating) return;

    if (isLeftSwipe && currentTableIndex < tables.length - 1) {
      // Navigate to next table
      setIsAnimating(true);
      setCurrentTableIndex(prev => prev + 1);
      setTimeout(() => setIsAnimating(false), 300); // Match animation duration
    }

    if (isRightSwipe && currentTableIndex > 0) {
      // Navigate to previous table
      setIsAnimating(true);
      setCurrentTableIndex(prev => prev - 1);
      setTimeout(() => setIsAnimating(false), 300); // Match animation duration
    }

    // Reset touch states
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Navigate to a specific table index
  const goToTable = (index: number) => {
    if (index >= 0 && index < tables.length && !isAnimating) {
      setIsAnimating(true);
      setCurrentTableIndex(index);
      setTimeout(() => setIsAnimating(false), 300); // Match animation duration
    }
  };

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
    <div className="bg-white p-4 rounded-lg shadow-md relative h-full flex flex-col">
      {/* Reset Confirmation Modal */}
      {isClient && showResetConfirmation && (
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

      {/* Fixed Header */}
      <div className="sticky top-0 bg-white z-10 pb-2 border-b border-gray-200 mb-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Tables</h2>
          {isClient && (
            <div className="flex items-center flex-wrap">
              <div className="flex items-center mr-2 mb-2 sm:mb-0">
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
                <span className="mx-2 whitespace-nowrap">
                  {`Round ${viewingRoundIndex + 1}/${rounds.length}`}
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
                    Return
                  </button>
                )}
              </div>
              {!isViewingHistory && (
              <div className="flex space-x-2">
                <button
                  onClick={handleResetRound}
                  className="px-3 py-1 rounded bg-yellow-500 hover:bg-yellow-600 text-white flex items-center justify-center"
                  aria-label="Reset Round"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                    <path d="M3 3v5h5"></path>
                  </svg>
                </button>
              </div>
            )}
            </div>
          )}
        </div>
      </div>

      {/* Main content area - conditionally render mobile or desktop view */}
      {isMobile ? (
        // Mobile view - single table with swipe navigation
        <div 
          ref={swipeContainerRef}
          className="flex-grow flex flex-col"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {isClient && tables.length > 0 && (
            <>
              <div className="flex-grow flex flex-col justify-center items-center relative" style={{ padding: '8px 4px' }}>
                {/* Current table */}
                {isClient && !isViewingHistory && tables[currentTableIndex] && (() => {
                  const table = tables[currentTableIndex];
                  const game = findGameById(table.gameId);
                  const seatedPlayers = table.seatedPlayerIds
                    .map(playerId => playersById[playerId])
                    .filter(player => player !== undefined) as Player[];

                  return (
                    <div 
                      className="table-card-swipe flex justify-center items-center transition-transform duration-300 ease-in-out"
                      style={{ transform: isAnimating ? 'scale(0.95)' : 'scale(1)' }}
                    >
                      <DroppableTable 
                        key={table.id}
                        table={table}
                        game={game}
                        seatedPlayers={seatedPlayers}
                        isReadOnly={false}
                      />
                    </div>
                  );
                })()}

                {/* History view */}
                {isClient && isViewingHistory && viewingRound.tableStates[currentTableIndex] && (() => {
                  const tableState = viewingRound.tableStates[currentTableIndex];
                  const game = findGameById(tableState.gameId);
                  const seatedPlayers = tableState.seatedPlayerIds
                    .map(playerId => playersById[playerId])
                    .filter(player => player !== undefined) as Player[];

                  const tableForDisplay: Table = {
                    id: tableState.id,
                    gameId: tableState.gameId,
                    seatedPlayerIds: tableState.seatedPlayerIds,
                    placedByPlayerId: tableState.placedByPlayerId
                  };

                  return (
                    <div 
                      className="table-card-swipe flex justify-center items-center transition-transform duration-300 ease-in-out"
                      style={{ transform: isAnimating ? 'scale(0.95)' : 'scale(1)' }}
                    >
                      <DroppableTable 
                        key={tableState.id}
                        table={tableForDisplay}
                        game={game}
                        seatedPlayers={seatedPlayers}
                        isReadOnly={true}
                      />
                    </div>
                  );
                })()}

                {/* Swipe indicators */}
                {currentTableIndex > 0 && (
                  <div 
                    className="swipe-indicator swipe-indicator-left"
                    onClick={() => goToTable(currentTableIndex - 1)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </div>
                )}

                {currentTableIndex < (isViewingHistory ? viewingRound.tableStates.length - 1 : tables.length - 1) && (
                  <div 
                    className="swipe-indicator swipe-indicator-right"
                    onClick={() => goToTable(currentTableIndex + 1)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Table navigation dots */}
              <div className="table-nav-dots">
                {(isViewingHistory ? viewingRound.tableStates : tables).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToTable(index)}
                    className={`table-nav-dot ${index === currentTableIndex ? 'active' : ''}`}
                    aria-label={`Go to table ${index + 1}`}
                  />
                ))}
              </div>

              {/* Table counter */}
              <div className="text-center text-sm text-gray-500 mb-2">
                Table {currentTableIndex + 1} of {isViewingHistory ? viewingRound.tableStates.length : tables.length}
              </div>
            </>
          )}
        </div>
      ) : (
        // Desktop view - grid of tables
        <div className="grid gap-4 overflow-y-auto flex-grow" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
          {isClient && isViewingHistory 
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
            : isClient && tables.map((table: Table) => {
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
      )}
    </div>
  );
}

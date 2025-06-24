'use client';

import { useGameStore } from '../store/store';
import { Table, Game, Player } from '../types/types';
import DroppableTable from './DroppableTable';

export default function TablesArea() {
  const tables = useGameStore(state => state.tables);
  const availableGames = useGameStore(state => state.availableGames);
  const players = useGameStore(state => state.players);
  const rounds = useGameStore(state => state.rounds);
  const currentRoundIndex = useGameStore(state => state.currentRoundIndex);
  const isRoundComplete = useGameStore(state => state.isRoundComplete);
  const createNewRound = useGameStore(state => state.createNewRound);

  // Create a map of games by ID for easy lookup
  const gamesById = availableGames.reduce((acc, game) => {
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

    // Check available games first
    if (gamesById[gameId]) return gamesById[gameId];

    // If not found in available games, check tables
    for (const table of tables) {
      if (table.gameId === gameId) {
        // Find the game in another table
        const tableWithGame = tables.find(t => t.gameId === gameId);
        if (tableWithGame) {
          // This is a placeholder since we don't have the actual game object
          // In a real implementation, you would store all games in the state
          return {
            id: gameId,
            title: `Game at ${tableWithGame.id}`,
            maxPlayers: 4, // Default value
          };
        }
      }
    }

    return undefined;
  };

  // Check if the current round is complete
  const roundComplete = isRoundComplete();
  const currentRound = rounds[currentRoundIndex];

  // Handle next round button click
  const handleNextRound = () => {
    if (roundComplete) {
      createNewRound();
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Tables</h2>
        <div className="flex items-center">
          <span className="mr-4">
            Round {currentRoundIndex + 1} of {rounds.length}
            {roundComplete && " (Complete)"}
          </span>
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tables.map((table: Table) => {
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
            />
          );
        })}
      </div>
    </div>
  );
}

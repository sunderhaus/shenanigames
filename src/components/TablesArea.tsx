'use client';

import { useGameStore } from '../store/store';
import { Table, Game, Player } from '../types/types';
import DroppableTable from './DroppableTable';

export default function TablesArea() {
  const tables = useGameStore(state => state.tables);
  const availableGames = useGameStore(state => state.availableGames);
  const allGames = useGameStore(state => state.allGames);
  const players = useGameStore(state => state.players);
  const rounds = useGameStore(state => state.rounds);
  const currentRoundIndex = useGameStore(state => state.currentRoundIndex);
  const isRoundComplete = useGameStore(state => state.isRoundComplete);
  const createNewRound = useGameStore(state => state.createNewRound);

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

  // Check if all tables have games
  const allTablesHaveGames = tables.every(table => table.gameId !== null);

  // Check if all players have taken actions in the current round
  const allPlayersHaveActed = players.every(player => player.actionTakenInCurrentRound);

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
            {!allPlayersHaveActed && `Round ${currentRoundIndex + 1} of ${rounds.length}`}
            {roundComplete && " (Set)"}
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

      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
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

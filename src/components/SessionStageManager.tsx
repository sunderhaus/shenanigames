'use client';

import { useSessionGameStore } from '@/store/session-store';
import { SessionStage } from '@/types/types';

export default function SessionStageManager() {
  const stage = useSessionGameStore(state => state.stage);
  const canStartFirstRound = useSessionGameStore(state => state.canStartFirstRound);
  const startFirstRound = useSessionGameStore(state => state.startFirstRound);
  const canCreateNextRound = useSessionGameStore(state => state.canCreateNextRound);
  const createNewRound = useSessionGameStore(state => state.createNewRound);
  const players = useSessionGameStore(state => state.players);
  const rounds = useSessionGameStore(state => state.rounds);
  const currentRoundIndex = useSessionGameStore(state => state.currentRoundIndex);

  // Handle starting the first round
  const handleStartFirstRound = () => {
    startFirstRound();
  };

  // Handle creating the next round
  const handleCreateNextRound = () => {
    createNewRound();
  };

  // Get the current round
  const currentRound = rounds[currentRoundIndex];

  // Render different UI based on the current stage
  switch (stage) {
    case SessionStage.SETUP:
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Session Setup
          </h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p>Complete the following steps to start your first round:</p>
            <ul className="list-disc list-inside space-y-1">
              <li className={players.length >= 2 ? 'text-green-700' : ''}>
                Add at least 2 players {players.length >= 2 ? '✓' : `(${players.length}/2)`}
              </li>
              <li className={players.every(p => p.picks.length === 2) ? 'text-green-700' : ''}>
                Each player must select exactly 2 games from the library 
                {players.every(p => p.picks.length === 2) ? ' ✓' : 
                 ` (${players.filter(p => p.picks.length === 2).length}/${players.length} complete)`}
              </li>
            </ul>
            {canStartFirstRound() && (
              <div className="mt-4">
                <button
                  onClick={handleStartFirstRound}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Start First Round
                </button>
              </div>
            )}
          </div>
        </div>
      );

    case SessionStage.FIRST_ROUND:
    case SessionStage.SUBSEQUENT_ROUNDS:
      // Check if current round is complete
      if (currentRound?.completed && canCreateNextRound()) {
        return (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              Round {currentRoundIndex + 1} Complete!
            </h3>
            <p className="text-sm text-green-800 mb-4">
              All players have made their selections. Ready to start the next round?
            </p>
            <button
              onClick={handleCreateNextRound}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Start Next Round
            </button>
          </div>
        );
      } else if (currentRound?.completed && !canCreateNextRound()) {
        // Round is complete but no more rounds can be created (no picks left)
        return (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">
              Round {currentRoundIndex + 1} Complete!
            </h3>
            <p className="text-sm text-yellow-800">
              All player picks have been exhausted. The session is complete!
            </p>
          </div>
        );
      } else {
        // Round in progress
        return (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Round {currentRoundIndex + 1} in Progress
            </h3>
            <p className="text-sm text-blue-800">
              Players are selecting games and seating. Play will begin once all players are seated at tables with games.
            </p>
          </div>
        );
      }

    case SessionStage.COMPLETE:
      return (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
          <h3 className="text-lg font-semibold text-purple-900 mb-2">
            Session Complete! 🎉
          </h3>
          <p className="text-sm text-purple-800">
            All rounds have been completed and all player picks have been used. Great gaming session!
          </p>
        </div>
      );

    default:
      return null;
  }
}

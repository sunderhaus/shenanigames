'use client';

import { useSessionGameStore } from '../store/session-store';
import { useState, useEffect } from 'react';
import LifecycleStatusTooltip from './LifecycleStatusTooltip';

export default function RoundControls() {
  const [isHydrated, setIsHydrated] = useState(false);
  const rounds = useSessionGameStore(state => state.rounds);
  const currentRoundIndex = useSessionGameStore(state => state.currentRoundIndex);
  const viewingRoundIndex = useSessionGameStore(state => state.viewingRoundIndex);
  const isViewingHistory = useSessionGameStore(state => state.isViewingHistory);
  const isRoundComplete = useSessionGameStore(state => state.isRoundComplete);
  const resetRound = useSessionGameStore(state => state.resetRound);
  const viewPreviousRound = useSessionGameStore(state => state.viewPreviousRound);
  const viewNextRound = useSessionGameStore(state => state.viewNextRound);
  const returnToCurrentRound = useSessionGameStore(state => state.returnToCurrentRound);

  // State for reset confirmation dialogue
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);

  // Set hydration state
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Check if the current round is complete
  const roundComplete = isRoundComplete();

  // Determine if we can navigate to previous or next rounds
  const hasPreviousRound = viewingRoundIndex > 0;
  const hasNextRound = viewingRoundIndex < rounds.length - 1;

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
    <>
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

      {/* Round Controls */}
      <div className="flex items-center gap-4">
        {/* Round navigation */}
        <div className="flex items-center bg-gray-100 rounded-lg p-2">
          <button
            onClick={viewPreviousRound}
            disabled={!hasPreviousRound}
            className={`px-2 py-1 rounded text-sm ${
              hasPreviousRound
                ? "text-blue-600 hover:text-blue-800 hover:bg-white"
                : "text-gray-300 cursor-not-allowed"
            }`}
            aria-label="Previous Round"
          >
            ←
          </button>
          <span className="mx-3 text-sm font-medium whitespace-nowrap">
            {isHydrated ? `Round ${viewingRoundIndex + 1}/${rounds.length}` : 'Round 1/0'}
            {isHydrated && isViewingHistory && " (History)"}
            {isHydrated && !isViewingHistory && roundComplete && " (Complete)"}
          </span>
          <button
            onClick={viewNextRound}
            disabled={!hasNextRound}
            className={`px-2 py-1 rounded text-sm ${
              hasNextRound
                ? "text-blue-600 hover:text-blue-800 hover:bg-white"
                : "text-gray-300 cursor-not-allowed"
            }`}
            aria-label="Next Round"
          >
            →
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {isViewingHistory && (
            <button
              onClick={returnToCurrentRound}
              className="px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-300 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Return to Current
            </button>
          )}
          {!isViewingHistory && (
            <button
              onClick={handleResetRound}
              className="px-3 py-2 text-sm font-medium text-yellow-700 bg-yellow-100 border border-yellow-300 rounded-md hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 flex items-center gap-1"
              aria-label="Reset Round"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                <path d="M3 3v5h5"></path>
              </svg>
              Reset Round
            </button>
          )}
          
          {/* Status indicator */}
          <LifecycleStatusTooltip isMobile={false} />
        </div>
      </div>
    </>
  );
}

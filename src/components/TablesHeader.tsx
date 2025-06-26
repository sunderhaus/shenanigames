'use client';

import { useSessionGameStore } from '../store/session-store';
import { useState } from 'react';
import { SessionMode } from '../types/types';
import TableManagementControls from './TableManagementControls';
import LibraryGameSelector from './LibraryGameSelector';
import SessionModeToggle from './SessionModeToggle';
import { BookOpen } from 'lucide-react';

export default function TablesHeader() {
  const rounds = useSessionGameStore(state => state.rounds);
  const currentRoundIndex = useSessionGameStore(state => state.currentRoundIndex);
  const viewingRoundIndex = useSessionGameStore(state => state.viewingRoundIndex);
  const isViewingHistory = useSessionGameStore(state => state.isViewingHistory);
  const isRoundComplete = useSessionGameStore(state => state.isRoundComplete);
  const resetRound = useSessionGameStore(state => state.resetRound);
  const viewPreviousRound = useSessionGameStore(state => state.viewPreviousRound);
  const viewNextRound = useSessionGameStore(state => state.viewNextRound);
  const returnToCurrentRound = useSessionGameStore(state => state.returnToCurrentRound);
  const addTable = useSessionGameStore(state => state.addTable);
  const removeTable = useSessionGameStore(state => state.removeTable);
  const tables = useSessionGameStore(state => state.tables);
  const mode = useSessionGameStore(state => state.mode);

  // State for reset confirmation dialogue and library selector
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [showLibrarySelector, setShowLibrarySelector] = useState(false);

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

      {/* Library Game Selector Modal */}
      <LibraryGameSelector 
        isOpen={showLibrarySelector}
        onClose={() => setShowLibrarySelector(false)}
      />

      {/* Tables Header */}
      <div className="bg-white px-3 py-2 rounded-lg shadow-md mb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-bold">Tables</h2>
            
            {/* Pick Mode table info */}
            {mode === SessionMode.PICK && (
              <div className="text-xs text-gray-500 ml-2">
                Tables: {tables.length} (fixed in Pick Mode)
              </div>
            )}
            
            {/* Table Management Controls */}
            {!isViewingHistory && mode === SessionMode.ADHOC && (
              <TableManagementControls />
            )}
            
            {/* Library Game Selector Button */}
            {!isViewingHistory && mode === SessionMode.ADHOC && (
              <button
                onClick={() => setShowLibrarySelector(true)}
                className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                title="Add game from library"
              >
                <BookOpen size={14} className="mr-1" />
                Library
              </button>
            )}
          </div>
          
          {/* Round controls - only show in pick mode */}
          {mode === SessionMode.PICK && (
            <div className="flex items-center">
              <div className="flex items-center mr-2">
                <button
                  onClick={viewPreviousRound}
                  disabled={!hasPreviousRound}
                  className={`px-1 py-1 rounded ${
                    hasPreviousRound
                      ? "text-blue-500 hover:text-blue-700"
                      : "text-gray-300 cursor-not-allowed"
                  }`}
                  aria-label="Previous Round"
                >
                  ←
                </button>
                <span className="mx-2 text-sm whitespace-nowrap">
                  {`Round ${viewingRoundIndex + 1}/${rounds.length}`}
                  {isViewingHistory && " (History)"}
                  {!isViewingHistory && roundComplete && " (Set)"}
                </span>
                <button
                  onClick={viewNextRound}
                  disabled={!hasNextRound}
                  className={`px-1 py-1 rounded ${
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
                    className="ml-2 px-2 py-1 text-xs rounded bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    Return
                  </button>
                )}
              </div>
              {!isViewingHistory && (
                <button
                  onClick={handleResetRound}
                  className="px-2 py-1 rounded bg-yellow-500 hover:bg-yellow-600 text-white flex items-center justify-center"
                  aria-label="Reset Round"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                    <path d="M3 3v5h5"></path>
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

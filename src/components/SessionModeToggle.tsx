'use client';

import { useSessionGameStore } from '../store/session-store';
import { SessionMode } from '../types/types';
import { Shuffle, Target } from 'lucide-react';

export default function SessionModeToggle() {
  const mode = useSessionGameStore(state => state.mode);
  const toggleSessionMode = useSessionGameStore(state => state.toggleSessionMode);
  const isViewingHistory = useSessionGameStore(state => state.isViewingHistory);

  // Don't show toggle during history viewing
  if (isViewingHistory) {
    return null;
  }

  const isPickMode = mode === SessionMode.PICK;

  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center bg-gray-100 rounded-lg p-1">
        <button
          onClick={toggleSessionMode}
          className={`flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            isPickMode
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          title="Pick Mode: Traditional drafting with rounds, player picks, and fixed table count"
        >
          <Target size={14} className="mr-1" />
          Pick Mode
        </button>
        
        <button
          onClick={toggleSessionMode}
          className={`flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            !isPickMode
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          title="Ad-hoc Mode: Free-form game placement with dynamic table management"
        >
          <Shuffle size={14} className="mr-1" />
          Ad-hoc Mode
        </button>
      </div>
      
      <div className="text-xs text-gray-500">
        {isPickMode ? 'Drafting with picks' : 'Free placement'}
      </div>
    </div>
  );
}

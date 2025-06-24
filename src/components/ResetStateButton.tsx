'use client';

import React from 'react';
import { clearState } from '@/store/persistence';
import { useGameStore } from '@/store/store';

/**
 * A button component that resets the application state to the initial sample data
 */
const ResetStateButton: React.FC = () => {
  const resetState = () => {
    if (window.confirm('Are you sure you want to reset the application state? This will clear all saved data.')) {
      // Clear the saved state from localStorage
      clearState();
      
      // Reload the page to reinitialize the store with sample data
      window.location.reload();
    }
  };

  return (
    <button
      onClick={resetState}
      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
    >
      Delete All App History
    </button>
  );
};

export default ResetStateButton;
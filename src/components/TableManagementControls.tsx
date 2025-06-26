'use client';

import { useState } from 'react';
import { useSessionGameStore } from '../store/session-store';
import { SessionMode } from '../types/types';
import LibraryGameSelector from './LibraryGameSelector';
import { Plus, Minus, BookOpen } from 'lucide-react';

export default function TableManagementControls() {
  const [showRemoveConfirmation, setShowRemoveConfirmation] = useState<string | null>(null);
  const [showLibrarySelector, setShowLibrarySelector] = useState(false);
  
  const mode = useSessionGameStore(state => state.mode);
  const tables = useSessionGameStore(state => state.tables);
  const addTable = useSessionGameStore(state => state.addTable);
  const removeTable = useSessionGameStore(state => state.removeTable);
  const isViewingHistory = useSessionGameStore(state => state.isViewingHistory);
  
  // Only show table management controls in Ad-hoc Mode
  if (mode !== SessionMode.ADHOC || isViewingHistory) {
    return null;
  }

  const handleAddTable = () => {
    const newTableId = addTable();
    if (!newTableId) {
      alert('Failed to add table');
    }
  };

  const handleRemoveTable = (tableId: string) => {
    // Find the table to check if it has players or games
    const table = tables.find(t => t.id === tableId);
    if (!table) return;

    // Check if table has seated players
    if (table.seatedPlayerIds.length > 0) {
      alert('Cannot remove table with seated players. Please have players leave the table first.');
      return;
    }

    // Check if it's the last table
    if (tables.length <= 1) {
      alert('Cannot remove the last table. At least one table is required.');
      return;
    }

    setShowRemoveConfirmation(tableId);
  };

  const confirmRemoveTable = (tableId: string) => {
    const success = removeTable(tableId);
    if (!success) {
      alert('Failed to remove table');
    }
    setShowRemoveConfirmation(null);
  };

  const cancelRemoveTable = () => {
    setShowRemoveConfirmation(null);
  };

  return (
    <>
      {/* Remove Confirmation Modal */}
      {showRemoveConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Remove Table</h3>
            <p className="mb-6">
              Are you sure you want to remove this table? 
              {tables.find(t => t.id === showRemoveConfirmation)?.gameId && 
                " The game on this table will be removed as well."
              }
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelRemoveTable}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmRemoveTable(showRemoveConfirmation)}
                className="px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white"
              >
                Remove
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

      {/* Table Management Controls */}
      <div className="flex items-center gap-2">
        {/* Library Button */}
        <button
          onClick={() => setShowLibrarySelector(true)}
          className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          title="Add game from library"
        >
          <BookOpen size={14} className="mr-1" />
          Library
        </button>
        
        {/* Add/Remove Table Controls */}
        <div className="flex items-center space-x-1">
          <button
            onClick={handleAddTable}
            className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors"
            title="Add table"
            aria-label="Add table"
          >
            <Plus size={16} />
          </button>
        
          {tables.length > 1 && (
            <div className="relative group">
              <button
                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                title="Remove table"
                aria-label="Remove table"
              >
                <Minus size={16} />
              </button>
              
              {/* Dropdown menu for table selection */}
              <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="p-2">
                  <div className="text-xs text-gray-500 mb-2">Select table to remove:</div>
                  {tables.map((table, index) => {
                    const isEmpty = !table.gameId && table.seatedPlayerIds.length === 0;
                    const hasPlayers = table.seatedPlayerIds.length > 0;
                    
                    return (
                      <button
                        key={table.id}
                        onClick={() => handleRemoveTable(table.id)}
                        disabled={hasPlayers}
                        className={`block w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                          hasPlayers
                            ? 'text-gray-400 cursor-not-allowed bg-gray-50'
                            : 'text-gray-700 hover:bg-red-50 hover:text-red-700'
                        }`}
                        title={hasPlayers ? 'Cannot remove: has seated players' : ''}
                      >
                        <div className="flex items-center justify-between">
                          <span>Table {index + 1}</span>
                          <div className="flex items-center space-x-1 text-xs">
                            {table.gameId && <span className="text-blue-600">•</span>}
                            {hasPlayers && <span className="text-yellow-600">👥</span>}
                            {isEmpty && <span className="text-gray-400">empty</span>}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="text-xs text-gray-500 ml-2">
          {tables.length} table{tables.length !== 1 ? 's' : ''}
        </div>
      </div>
    </>
  );
}

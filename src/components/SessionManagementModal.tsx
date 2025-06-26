import React, { useState } from 'react';
import { X, Plus, Users, Settings, Copy, Trash2 } from 'lucide-react';
import { useSessionManager } from '@/store/session-manager';
import { useSessionGameStore } from '@/store/session-store';
import { SessionMetadata, SessionType } from '@/types/session-types';
import SessionTypeSelector from './SessionTypeSelector';

interface SessionManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SessionManagementModal: React.FC<SessionManagementModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { 
    sessionList, 
    currentSessionId, 
    createSession, 
    deleteSessionById, 
    setCurrentSession,
    duplicateSession 
  } = useSessionManager();
  
  const [showCreateTypeSelector, setShowCreateTypeSelector] = useState(false);
  
  const handleSessionCreated = () => {
    setShowCreateTypeSelector(false);
    onClose(); // Close the main modal when a session is successfully created
  };
  
  const handleCreateCanceled = () => {
    setShowCreateTypeSelector(false);
    // Keep the main modal open when the user cancels
  };

  if (!isOpen) return null;


  const handleDeleteSession = (sessionId: string) => {
    if (sessionList.length <= 1) {
      alert('Cannot delete the last session');
      return;
    }
    
    if (confirm('Are you sure you want to delete this session?')) {
      deleteSessionById(sessionId);
    }
  };

  const handleDuplicateSession = (session: SessionMetadata) => {
    const newName = `${session.name} (Copy)`;
    const newSessionId = duplicateSession(session.id, newName);
    if (newSessionId) {
      setCurrentSession(newSessionId);
    }
  };

  const handleSessionSelect = (sessionId: string) => {
    setCurrentSession(sessionId);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[120] p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-800">Session Management</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Create New Session */}
          <div className="mb-6">
            <button
              onClick={() => setShowCreateTypeSelector(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus size={16} />
              New Session
            </button>
          </div>

          {/* Sessions List */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-800">Existing Sessions</h3>
            {sessionList.map((session) => (
              <div
                key={session.id}
                className={`border rounded-lg p-4 ${
                  session.id === currentSessionId
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-800">{session.name}</h4>
                      {session.id === currentSessionId && (
                        <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Users size={14} />
                        Session data
                      </div>
                      <div className="flex items-center gap-1">
                        <Settings size={14} />
                        {new Date(session.lastModified).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {session.id !== currentSessionId && (
                      <button
                        onClick={() => handleSessionSelect(session.id)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        Select
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleDuplicateSession(session)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                      title="Duplicate session"
                    >
                      <Copy size={16} />
                    </button>
                    
                    {sessionList.length > 1 && (
                      <button
                        onClick={() => handleDeleteSession(session.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                        title="Delete session"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
      
      {/* Session Type Selector Modal */}
      <SessionTypeSelector 
        isOpen={showCreateTypeSelector} 
        onClose={() => setShowCreateTypeSelector(false)} // Fallback if no specific callback is used
        onSuccess={handleSessionCreated} // Close both modals when session is created
        onCancel={handleCreateCanceled} // Only close the type selector when canceled
      />
    </div>
  );
};

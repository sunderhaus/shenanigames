'use client';

import Link from 'next/link';
import PlayerInfo from '../components/PlayerInfo';
import TablesArea from '../components/TablesArea';
import TablesHeader from '../components/TablesHeader';
import RoundControls from '../components/RoundControls';
import DragAndDropProvider from '../components/DragAndDropProvider';
import ActivePlayerFooter from '../components/ActivePlayerFooter';
import HamburgerMenu from '../components/HamburgerMenu';
import PickRequirements from '../components/PickRequirements';
import LifecycleStatusTooltip from '../components/LifecycleStatusTooltip';
import AddTableModal from '../components/AddTableModal';
import { useState, useEffect } from 'react';
import { useSessionGameStore } from '../store/session-store';
import { useSessionManager } from '../store/session-manager';
import { SessionType } from '../types/session-types';
import AnimationProvider from '../components/AnimationProvider';

export default function Home() {
  // State to track if we're on a mobile device
  const [isMobile, setIsMobile] = useState(false);
  // State for Add Table modal (Freeform sessions)
  const [showAddTableModal, setShowAddTableModal] = useState(false);
  // Ref to access modal's save function
  const [modalSaveRef, setModalSaveRef] = useState<(() => void) | null>(null);
  const [modalSaveEnabled, setModalSaveEnabled] = useState(false);
  // State to track hydration
  const [isHydrated, setIsHydrated] = useState(false);

  // Get session state
  const { currentSessionId, createSession, getCurrentSession } = useSessionManager();
  const { tables, hasActiveSession, loadCurrentSession } = useSessionGameStore();
  
  // Get current session details
  const currentSession = getCurrentSession();
  const sessionName = isHydrated ? (currentSession?.metadata.name || 'No Session') : 'Loading...';
  const sessionType = isHydrated ? currentSession?.metadata.sessionType : null;

  // Check if all tables have games
  const allTablesHaveGames = tables.every(table => table.gameId !== null);

  // Set hydration state
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Initialize session if none exists
  useEffect(() => {
    if (!hasActiveSession()) {
      // Create a default session
      const sessionId = createSession({ name: 'My First Session' });
      if (sessionId) {
        loadCurrentSession();
      }
    } else {
      loadCurrentSession();
    }
  }, []);

  // Check if we're on a mobile device on component mount
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024); // 1024px is the lg breakpoint in Tailwind
    };

    // Check initially
    checkIfMobile();

    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);

    // Clean up
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Apply has-warning-footer class to body when all tables have games (only for Picks sessions)
  useEffect(() => {
    if (isMobile && allTablesHaveGames && sessionType === SessionType.PICKS) {
      document.body.classList.add('has-warning-footer');
    } else {
      document.body.classList.remove('has-warning-footer');
    }

    // Clean up
    return () => {
      document.body.classList.remove('has-warning-footer');
    };
  }, [isMobile, allTablesHaveGames, sessionType]);

  return (
    <AnimationProvider>
      {isMobile ? (
        // Mobile Layout: Header-Body-Footer structure
        <div className="flex flex-col h-screen bg-gray-100">
          {/* Fixed Headers */}
          <header className="fixed top-0 left-0 right-0 bg-gray-100 z-30 px-4 py-2 border-b border-gray-200">
            <div className="flex items-center mb-2">
              <div className="w-12 flex justify-start">
                <HamburgerMenu />
              </div>
              <div className="flex-1 text-center">
                <h1 className="text-2xl font-bold">Shenanigames</h1>
                <div className="flex items-center justify-center gap-2">
                  <p className="text-gray-600 text-sm">{sessionName}</p>
                  {sessionType && (
                    <span className={`text-xs px-2 py-1 rounded ${
                      sessionType === SessionType.FREEFORM 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {sessionType === SessionType.FREEFORM ? '🌵' : '🎯'}
                    </span>
                  )}
                </div>
              </div>
              <div className="w-12 flex justify-end">
                <LifecycleStatusTooltip isMobile={isMobile} />
              </div>
            </div>
            {/* Only show pick requirements for Picks sessions */}
            {sessionType !== SessionType.FREEFORM && <PickRequirements />}
            <TablesHeader />
          </header>

          {/* Body with calculated height to fill space between header and footer */}
          <main className="pt-32 pb-32 overflow-hidden" style={{ height: 'calc(100vh - 16rem)' }}>
            <DragAndDropProvider>
              {sessionType === SessionType.FREEFORM ? (
                /* Freeform Mobile: Just tables, no game list */
                <TablesArea isMobile={isMobile} />
              ) : (
                /* Picks Mobile: Show both games and tables */
                <TablesArea isMobile={isMobile} />
              )}
            </DragAndDropProvider>
          </main>

{/* Fixed Footer */}
          <div className="fixed bottom-0 left-0 right-0">
            <ActivePlayerFooter
              onAddTableClick={() => setShowAddTableModal(true)}
              isModalOpen={showAddTableModal}
              modalSaveEnabled={modalSaveEnabled}
              onModalSave={modalSaveRef || (() => {})}
              onModalCancel={() => setShowAddTableModal(false)}
              modalType="add-table"
            />
          </div>
        </div>
      ) : (
        // Desktop Layout: Consistent header structure
        <main className="min-h-screen p-4 bg-gray-100">
          <div className="container mx-auto max-w-7xl">
            {/* Header with consistent styling */}
            <div className="mb-6">
              {/* Header with hamburger menu */}
              <div className="mb-4 flex items-center">
                <div className="w-16 flex justify-start">
                  <HamburgerMenu />
                </div>
                <div className="flex-1 text-center">
                  <h1 className="text-2xl font-bold">Shenanigames</h1>
                  <div className="flex items-center justify-center gap-2">
                    <p className="text-sm text-gray-600">{sessionName}</p>
                    {sessionType && (
                      <span className={`text-xs px-2 py-1 rounded ${
                        sessionType === SessionType.FREEFORM 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {sessionType === SessionType.FREEFORM ? '🌵' : '🎯'}
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-16"></div>
              </div>

              {/* Main header card */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Title and current session info */}
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Tables</h1>
                    <p className="text-gray-600">
                      Game drafting and table management
                    </p>
                  </div>

                  {/* Round navigation controls - Only for Picks sessions */}
                  {sessionType !== SessionType.FREEFORM && <RoundControls />}
                </div>

                {/* Navigation breadcrumb */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <nav className="text-sm text-gray-500">
                    <span className="text-gray-900 font-medium">Tables</span>
                    <span className="mx-2">•</span>
                    <Link href="/library" className="hover:text-gray-700">Game Library</Link>
                    <span className="mx-2">•</span>
                    <Link href="/collections" className="hover:text-gray-700">Collections</Link>
                    <span className="mx-2">•</span>
                    <Link href="/results" className="hover:text-gray-700">Results</Link>
                  </nav>
                </div>
              </div>
            </div>

            {/* Pick Requirements Warning - Only for Picks sessions */}
            {sessionType !== SessionType.FREEFORM && <PickRequirements />}

            <DragAndDropProvider>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main content - Tables (2/3rds width) */}
                <div className="lg:col-span-2">
                  <TablesArea isMobile={isMobile} />
                </div>

                {/* Right sidebar - Different content based on session type */}
                <div className="lg:col-span-1">
                  {sessionType === SessionType.FREEFORM ? (
                    /* Freeform Session Sidebar - Add Table Panel */
                    <div className="bg-white p-4 rounded-lg shadow-md">
                      <h2 className="text-xl font-bold mb-4">🌵 Freeform Session</h2>
                      <p className="text-gray-600 mb-4">
                        Add new tables by selecting games and players from your collections.
                      </p>
                      <button
                        onClick={() => setShowAddTableModal(true)}
                        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                      >
                        + Add New Table
                      </button>
                      
                      <div className="mt-6 pt-4 border-t border-gray-200">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Quick Stats</h3>
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex justify-between">
                            <span>Number of Tables:</span>
                            <span>{tables.filter(t => t.gameId !== null).length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Session type:</span>
                            <span className="text-purple-600 font-medium">Freeform</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Picks Session Sidebar - Player Info */
                    <PlayerInfo />
                  )}
                </div>
              </div>
            </DragAndDropProvider>

            <footer className="mt-8 text-center text-gray-500 text-sm pb-16">
              <p>Drag and drop games to tables or players to tables with games to make selections.</p>
              <p className="mt-2">© 2025 Shenanigames, LLC</p>
            </footer>
          </div>
        </main>
      )}
      
      {/* Add Table Modal for Freeform sessions */}
      <AddTableModal 
        isOpen={showAddTableModal} 
        onClose={() => setShowAddTableModal(false)}
        onSave={modalSaveRef}
        saveEnabled={modalSaveEnabled}
      />
    </AnimationProvider>
  );
}

'use client';

import AvailableGamesList from '../components/AvailableGamesList';
import PlayerInfo from '../components/PlayerInfo';
import TablesArea from '../components/TablesArea';

export default function Home() {
  return (
    <main className="min-h-screen p-4 bg-gray-100">
      <div className="container mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-center">Shenanigames</h1>
          <p className="text-center text-gray-600">A board game drafting web app</p>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left sidebar - Available Games */}
          <div className="lg:col-span-3">
            <AvailableGamesList />
          </div>
          
          {/* Main content - Tables */}
          <div className="lg:col-span-6">
            <TablesArea />
          </div>
          
          {/* Right sidebar - Player Info */}
          <div className="lg:col-span-3">
            <PlayerInfo />
          </div>
        </div>
        
        <footer className="mt-8 text-center text-gray-500 text-sm">
          <p>Drag and drop games to tables or players to games to make selections.</p>
          <p className="mt-2">© 2023 Shenanigames</p>
        </footer>
      </div>
    </main>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { useGameCollections } from '@/store/game-collection-store';
import { useGameLibrary } from '@/store/game-library-store';
import { CollectionItem, CollectionPlayer } from '@/types/game-collection-types';
import CollectionsHeader from '@/components/collections/CollectionsHeader';
import CollectionsFilters from '@/components/collections/CollectionsFilters';
import CollectionsGrid from '@/components/collections/CollectionsGrid';
import AddItemModal from '@/components/collections/AddItemModal';
import AddPlayerModal from '@/components/collections/AddPlayerModal';
import CollectionStats from '@/components/collections/CollectionStats';

export default function CollectionsPage() {
  const [isClient, setIsClient] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [editingItem, setEditingItem] = useState<CollectionItem | null>(null);

  const {
    players,
    playerList,
    items,
    itemList,
    totalItems,
    addCollectionItem,
    updateCollectionItem,
    deleteCollectionItem,
    addPlayer,
    updatePlayer,
    deletePlayer,
    getPlayerItems,
    refreshCollections
  } = useGameCollections();

  const { gameList } = useGameLibrary();

  // Set isClient to true after component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handlePlayerFilter = (playerId: string) => {
    setSelectedPlayer(playerId);
  };

  const handleAddItem = (itemData: Partial<CollectionItem>) => {
    addCollectionItem(itemData);
    setShowAddItem(false);
  };

  const handleEditItem = (item: CollectionItem) => {
    setEditingItem(item);
    setShowAddItem(true);
  };

  const handleUpdateItem = (itemData: Partial<CollectionItem>) => {
    if (editingItem) {
      updateCollectionItem(editingItem.id, itemData);
      setEditingItem(null);
      setShowAddItem(false);
    }
  };

  const handleDeleteItem = (itemId: string) => {
    if (confirm('Are you sure you want to remove this item from the collection?')) {
      deleteCollectionItem(itemId);
    }
  };

  const handleAddPlayer = (playerData: Partial<CollectionPlayer>) => {
    addPlayer(playerData);
    setShowAddPlayer(false);
  };

  const handleDeletePlayer = (playerId: string, playerName: string) => {
    if (confirm(`Are you sure you want to delete ${playerName} and all their collection items? This action cannot be undone.`)) {
      deletePlayer(playerId);
      if (selectedPlayer === playerId) {
        setSelectedPlayer('all');
      }
    }
  };

  // Filter items based on selected player
  const filteredItems = selectedPlayer === 'all' 
    ? itemList 
    : itemList.filter(item => item.playerId === selectedPlayer);

  const selectedPlayerData = selectedPlayer === 'all' ? null : players[selectedPlayer];

  if (!isClient) {
    return (
      <div className="min-h-screen p-4 bg-gray-100 flex items-center justify-center">
        <div className="text-lg">Loading Collections...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-gray-100">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <CollectionsHeader
          totalItems={totalItems}
          totalPlayers={playerList.length}
          filteredCount={filteredItems.length}
          showingFiltered={selectedPlayer !== 'all'}
          selectedPlayerName={selectedPlayerData?.name}
          onAddItem={() => setShowAddItem(true)}
          onAddPlayer={() => setShowAddPlayer(true)}
          onShowStats={() => setShowStats(true)}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className="lg:w-80">
            <CollectionsFilters
              players={playerList}
              selectedPlayer={selectedPlayer}
              onPlayerChange={handlePlayerFilter}
              onDeletePlayer={handleDeletePlayer}
            />

            {/* Stats Panel */}
            {showStats && (
              <div className="mt-6">
                <CollectionStats onClose={() => setShowStats(false)} />
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {filteredItems.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <div className="text-gray-500 mb-4">
                  {selectedPlayer === 'all' ? (
                    <>
                      <h3 className="text-lg font-medium mb-2">No collection items found</h3>
                      <p>Start building collections by adding players and their games.</p>
                    </>
                  ) : (
                    <>
                      <h3 className="text-lg font-medium mb-2">
                        {selectedPlayerData?.name} has no items in their collection
                      </h3>
                      <p>Add games to their collection to get started.</p>
                    </>
                  )}
                </div>
                <div className="space-x-4">
                  <button
                    onClick={() => setShowAddItem(true)}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Add Collection Item
                  </button>
                  {selectedPlayer === 'all' && (
                    <button
                      onClick={() => setShowAddPlayer(true)}
                      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Add Player
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <CollectionsGrid
                items={filteredItems}
                players={players}
                gameList={gameList}
                viewMode={viewMode}
                onEditItem={handleEditItem}
                onDeleteItem={handleDeleteItem}
              />
            )}
          </div>
        </div>

        {/* Modals */}
        {showAddItem && (
          <AddItemModal
            item={editingItem}
            players={playerList}
            games={gameList}
            selectedPlayerId={selectedPlayer === 'all' ? undefined : selectedPlayer}
            onSave={editingItem ? handleUpdateItem : handleAddItem}
            onClose={() => {
              setShowAddItem(false);
              setEditingItem(null);
            }}
          />
        )}

        {showAddPlayer && (
          <AddPlayerModal
            onSave={handleAddPlayer}
            onClose={() => setShowAddPlayer(false)}
          />
        )}
      </div>
    </div>
  );
}

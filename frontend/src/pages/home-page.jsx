import React, { useMemo, useState } from 'react';
import { SerkoHeroSection } from '../components/home/serko-hero-section';
import { LiveRoomsCatalogSection } from '../components/home/live-rooms-catalog-section';
import { SerkoFeatureSections } from '../components/home/serko-feature-sections';
import { useAuth } from '../context/AuthContext';

export function HomePage({
  rooms = [],
  loading = false,
  onEnterRoom,
  onNavigate,
  onOpenCreateRoomModal,
}) {
  const { user } = useAuth();
  const [filter, setFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const { activeLiveRoom, spotItem } = useMemo(() => {
    const live =
      rooms.find((r) => r.code === 'SERKO-LUX-01' && r.status === 'LIVE') ||
      rooms.find((r) => r.status === 'LIVE' && r.activeItem) ||
      rooms.find((r) => r.status === 'LIVE') ||
      rooms[0] ||
      null;
    const item = live?.activeItem || live?.previewItem || live?.items?.[0] || null;
    return { activeLiveRoom: live, spotItem: item };
  }, [rooms]);

  return (
    <div className="bg-white text-[#17181c]">
      <SerkoHeroSection
        activeLiveRoom={activeLiveRoom}
        spotItem={spotItem}
        onEnterRoom={onEnterRoom}
        onNavigate={onNavigate}
      />

      <LiveRoomsCatalogSection
        rooms={rooms}
        loading={loading}
        filter={filter}
        setFilter={setFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        user={user}
        onEnterRoom={onEnterRoom}
        onOpenCreateRoomModal={onOpenCreateRoomModal}
      />

      <SerkoFeatureSections
        activeLiveRoom={activeLiveRoom}
        onEnterRoom={onEnterRoom}
        onNavigate={onNavigate}
      />
    </div>
  );
}


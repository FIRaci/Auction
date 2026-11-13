import React, { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import { Bell, X } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider, useSocket } from './context/SocketContext';
import { apiRequest } from './config/api';
import { SerkoScrollNavbar } from './components/layout/serko-scroll-navbar';
import { SerkoEditorialFooter } from './components/layout/serko-editorial-footer';
import { HomePage } from './pages/home-page';
import { AuthModal } from './components/modals/auth-modal';
import { CreateRoomModal } from './components/modals/create-room-modal';
import { SellItemModal } from './components/modals/sell-item-modal';

const RoomDetailPage = lazy(() =>
  import('./pages/room-detail-page').then((m) => ({ default: m.RoomDetailPage }))
);
const AdminDashboardPage = lazy(() =>
  import('./pages/admin-dashboard-page').then((m) => ({ default: m.AdminDashboardPage }))
);
const TermsAndPoliciesPage = lazy(() =>
  import('./pages/terms-and-policies-page').then((m) => ({ default: m.TermsAndPoliciesPage }))
);

function PageLoadingFallback() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="rounded-[28px] bg-[#f6f6f6] h-72 animate-pulse border border-[#e9e9ec]" />
    </div>
  );
}

function AppContent() {
  const { user } = useAuth();
  const { roomNotification, clearNotification } = useSocket();

  const [currentPage, setCurrentPage] = useState('home');
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [roomRefreshKey, setRoomRefreshKey] = useState(0);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [createRoomModalOpen, setCreateRoomModalOpen] = useState(false);
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [sellDefaultRoomId, setSellDefaultRoomId] = useState('');

  const fetchRooms = useCallback(async () => {
    try {
      const res = await apiRequest('/rooms', 'GET');
      setRooms(res.data || []);
    } catch (err) {
      console.error('Failed to fetch rooms:', err);
    } finally {
      setLoadingRooms(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const handleNavigate = (page, roomId = null) => {
    setCurrentPage(page);
    if (roomId) {
      setSelectedRoomId(roomId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (page === 'home') {
      fetchRooms();
    }
  };

  const handleEnterRoom = (roomId) => {
    if (!roomId) return;
    setSelectedRoomId(roomId);
    setCurrentPage('room');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenSellModal = (roomId = '') => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    setSellDefaultRoomId(typeof roomId === 'string' ? roomId : '');
    setSellModalOpen(true);
  };

  const handleOpenCreateRoomModal = () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    setCreateRoomModalOpen(true);
  };

  const handleRoomCreated = async (newRoom) => {
    await fetchRooms();
    if (newRoom?.id) {
      handleEnterRoom(newRoom.id);
    }
  };

  const handleItemCreated = async () => {
    await fetchRooms();
    setRoomRefreshKey((k) => k + 1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#17181c]">
      <SerkoScrollNavbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        onOpenSellModal={() => handleOpenSellModal(selectedRoomId || '')}
        onOpenCreateRoomModal={handleOpenCreateRoomModal}
      />

      {roomNotification && (
        <div className="fixed bottom-5 right-5 z-40 max-w-sm rounded-2xl bg-[#17181c] text-white px-4 py-3 shadow-xl border border-white/10 flex items-start gap-3">
          <Bell className="w-4 h-4 text-[#1b9e52] shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm leading-snug flex-1">
            {roomNotification.message || String(roomNotification)}
          </p>
          <button
            type="button"
            onClick={clearNotification}
            aria-label="Đóng thông báo"
            className="text-white/60 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage
            rooms={rooms}
            loading={loadingRooms}
            onEnterRoom={handleEnterRoom}
            onNavigate={handleNavigate}
            onOpenCreateRoomModal={handleOpenCreateRoomModal}
          />
        )}

        {currentPage !== 'home' && (
          <Suspense fallback={<PageLoadingFallback />}>
            {currentPage === 'room' && selectedRoomId && (
              <RoomDetailPage
                roomId={selectedRoomId}
                refreshKey={roomRefreshKey}
                onBackHome={() => handleNavigate('home')}
                onEnterRoom={handleEnterRoom}
                onOpenAuthModal={() => setAuthModalOpen(true)}
                onOpenSellModal={(rid) => handleOpenSellModal(rid)}
              />
            )}

            {currentPage === 'admin' && (
              <AdminDashboardPage
                onEnterRoom={handleEnterRoom}
                onOpenCreateRoomModal={handleOpenCreateRoomModal}
                onRefreshRooms={fetchRooms}
              />
            )}

            {currentPage === 'terms' && (
              <TermsAndPoliciesPage onBackHome={() => handleNavigate('home')} />
            )}
          </Suspense>
        )}
      </main>

      <SerkoEditorialFooter
        onNavigate={handleNavigate}
        onOpenAuthModal={() => setAuthModalOpen(true)}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      <CreateRoomModal
        isOpen={createRoomModalOpen}
        onClose={() => setCreateRoomModalOpen(false)}
        onCreated={handleRoomCreated}
      />

      <SellItemModal
        isOpen={sellModalOpen}
        onClose={() => setSellModalOpen(false)}
        rooms={rooms}
        defaultRoomId={sellDefaultRoomId}
        onCreated={handleItemCreated}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <AppContent />
      </SocketProvider>
    </AuthProvider>
  );
}

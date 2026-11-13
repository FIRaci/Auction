import React, { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, ArrowLeft, LogOut, Plus, RefreshCw, ShieldAlert } from 'lucide-react';
import { apiRequest, formatVND } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { ThreeCallCountdownBanner } from '../components/room/three-call-countdown-banner';
import { LiveBiddingConsole } from '../components/room/live-bidding-console';
import { LiveBidStreamAndQueue } from '../components/room/live-bid-stream-and-queue';

export function RoomDetailPage({
  roomId,
  refreshKey = 0,
  onBackHome,
  onEnterRoom,
  onOpenAuthModal,
  onOpenSellModal,
}) {
  const { user, token, currentRoom, refreshMe } = useAuth();
  const { socket, connected } = useSocket();

  const [room, setRoom] = useState(null);
  const [activeItem, setActiveItem] = useState(null);
  const [bids, setBids] = useState([]);
  const [eventLogs, setEventLogs] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [callStage, setCallStage] = useState(0);
  const [callDeadline, setCallDeadline] = useState(null);
  const [idleDeadline, setIdleDeadline] = useState(null);
  const [demoMode, setDemoMode] = useState(false);

  const [loading, setLoading] = useState(true);
  const [roomLockError, setRoomLockError] = useState(null);
  const [switchingRoom, setSwitchingRoom] = useState(false);

  const [bidAmount, setBidAmount] = useState('');
  const [bidding, setBidding] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const fetchRoomDetails = useCallback(async () => {
    if (!roomId) return;
    try {
      const res = await apiRequest(`/rooms/${roomId}`, 'GET', null, token);
      const data = res.data;
      setRoom(data);
      const current = data.activeItem || data.items?.find((i) => i.status === 'BIDDING') || null;
      setActiveItem(current);
      setParticipants(data.participants || []);

      if (current) {
        const sortedBids = [...(current.bids || [])].sort(
          (a, b) => Number(b.amount) - Number(a.amount) || new Date(b.createdAt) - new Date(a.createdAt)
        );
        setBids(sortedBids);
        const minStep = Math.max(10000, Number(current.minIncrement) || 10000);
        const base = Number(current.currentPrice) || Number(current.startingPrice) || 0;
        const hasBid = sortedBids.length > 0 || base > Number(current.startingPrice);
        setBidAmount(String(hasBid ? base + minStep : Number(current.startingPrice)));
      } else {
        setBids([]);
        setBidAmount('');
      }

      setEventLogs(data.eventLogs || []);

      if (data.engineState) {
        setCallStage(data.engineState.callStage || 0);
        setCallDeadline(data.engineState.callDeadline || null);
        setDemoMode(Boolean(data.engineState.demoMode));
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Không thể tải thông tin phòng.' });
    } finally {
      setLoading(false);
    }
  }, [roomId, token]);

  // Enforce strict 1-room participation when signed in
  const ensureRoomJoined = useCallback(async () => {
    if (!roomId || !user?.id || !token) return;
    if (currentRoom?.id === roomId) {
      setRoomLockError(null);
      return;
    }
    if (currentRoom && currentRoom.id !== roomId) {
      setRoomLockError({
        lockedRoom: currentRoom,
        message: `Tài khoản của bạn đang tham gia phòng "${currentRoom.title}" (${currentRoom.code}). Theo quy chế chống thao túng, mỗi hội viên chỉ được vào 1 phòng tại một thời điểm.`,
      });
      return;
    }

    try {
      await apiRequest(`/rooms/${roomId}/join`, 'POST', null, token);
      setRoomLockError(null);
      await refreshMe();
    } catch (err) {
      setRoomLockError({
        lockedRoom: currentRoom,
        message: err.message || 'Không thể tham gia phòng đấu giá này.',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, user?.id, token, currentRoom?.id]);

  useEffect(() => {
    setLoading(true);
    setFeedback(null);
    setRoomLockError(null);
    fetchRoomDetails();
  }, [fetchRoomDetails, refreshKey]);

  useEffect(() => {
    ensureRoomJoined();
  }, [ensureRoomJoined]);

  // Socket.IO realtime subscription
  useEffect(() => {
    if (!socket || !connected || !roomId) return undefined;

    socket.emit('join_room', { roomId }, (res) => {
      if (res?.success) {
        if (res.members) setParticipants(res.members);
        if (res.state) {
          setCallStage(res.state.callStage || 0);
          setCallDeadline(res.state.callDeadline || null);
          setDemoMode(Boolean(res.state.demoMode));
        }
      }
    });

    const handleNewBid = (payload) => {
      if (payload?.item) {
        setActiveItem(payload.item);
        const minStep = Math.max(10000, Number(payload.item.minIncrement) || 10000);
        const nextSuggested = Number(payload.item.currentPrice) + minStep;
        setBidAmount(String(nextSuggested));
      }
      if (payload?.bid) {
        setBids((prev) => [payload.bid, ...prev.filter((b) => b.id !== payload.bid.id)]);
      }
      setCallStage(0);
      setCallDeadline(null);
      if (payload?.idleTimeoutSeconds) {
        setIdleDeadline(new Date(Date.now() + payload.idleTimeoutSeconds * 1000).toISOString());
      }
      if (payload?.message) {
        setEventLogs((prev) => [
          { id: `ev-${Date.now()}`, message: payload.message, createdAt: new Date().toISOString() },
          ...prev,
        ]);
      }
    };

    const handleAnnouncementCall = (payload) => {
      setCallStage(payload?.stage || 1);
      setCallDeadline(payload?.deadline || null);
      setIdleDeadline(null);
      if (payload?.message) {
        setEventLogs((prev) => [
          { id: `call-${Date.now()}`, message: payload.message, createdAt: new Date().toISOString() },
          ...prev,
        ]);
      }
    };

    const handleItemActivated = (payload) => {
      if (payload?.item) {
        setActiveItem(payload.item);
        setBids([]);
      }
      setCallStage(0);
      setCallDeadline(null);
      if (payload?.idleTimeoutSeconds) {
        setIdleDeadline(new Date(Date.now() + payload.idleTimeoutSeconds * 1000).toISOString());
      }
      fetchRoomDetails();
    };

    const handleHammerDown = (payload) => {
      setCallStage(0);
      setCallDeadline(null);
      setIdleDeadline(null);
      setFeedback({
        type: payload?.result === 'SOLD' ? 'success' : 'error',
        message: payload?.message || 'Đã gõ búa kết thúc lượt đấu giá.',
      });
      fetchRoomDetails();
    };

    const handleBoughtNow = (payload) => {
      setCallStage(0);
      setCallDeadline(null);
      setIdleDeadline(null);
      setFeedback({
        type: 'success',
        message:
          payload?.message ||
          `Vật phẩm đã được chốt giá bởi ${payload?.buyer?.fullName || 'thành viên'}!`,
      });
      fetchRoomDetails();
    };

    const handleRoomMembersUpdated = (members) => {
      if (Array.isArray(members)) {
        setParticipants(members);
      }
    };

    const handleRoomEnded = (payload) => {
      setRoom((prev) => (prev ? { ...prev, status: 'ENDED' } : prev));
      setFeedback({
        type: 'success',
        message: payload?.message || 'Phòng đấu giá đã hoàn tất toàn bộ hàng đợi và đóng phiên.',
      });
      fetchRoomDetails();
    };

    const handleQueueAdded = () => {
      fetchRoomDetails();
    };

    const handleRoomUpdated = () => {
      fetchRoomDetails();
    };

    const handleSettingChanged = (payload) => {
      if (payload?.setting === 'DEMO_FAST_FORWARD') {
        setDemoMode(Boolean(payload.value));
      }
    };

    socket.on('new_bid', handleNewBid);
    socket.on('announcement_call', handleAnnouncementCall);
    socket.on('item_activated', handleItemActivated);
    socket.on('hammer_down', handleHammerDown);
    socket.on('item_bought_now', handleBoughtNow);
    socket.on('room_members_updated', handleRoomMembersUpdated);
    socket.on('room_ended', handleRoomEnded);
    socket.on('item_added_to_queue', handleQueueAdded);
    socket.on('room_updated', handleRoomUpdated);
    socket.on('system_setting_changed', handleSettingChanged);

    return () => {
      socket.emit('leave_room', { roomId });
      socket.off('new_bid', handleNewBid);
      socket.off('announcement_call', handleAnnouncementCall);
      socket.off('item_activated', handleItemActivated);
      socket.off('hammer_down', handleHammerDown);
      socket.off('item_bought_now', handleBoughtNow);
      socket.off('room_members_updated', handleRoomMembersUpdated);
      socket.off('room_ended', handleRoomEnded);
      socket.off('item_added_to_queue', handleQueueAdded);
      socket.off('room_updated', handleRoomUpdated);
      socket.off('system_setting_changed', handleSettingChanged);
    };
  }, [socket, connected, roomId, fetchRoomDetails]);

  const handleLeaveAndSwitch = async () => {
    setSwitchingRoom(true);
    try {
      await apiRequest('/rooms/leave', 'POST', null, token);
      await apiRequest(`/rooms/${roomId}/join`, 'POST', null, token);
      setRoomLockError(null);
      await refreshMe();
      await fetchRoomDetails();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Không thể chuyển phòng.' });
    } finally {
      setSwitchingRoom(false);
    }
  };

  const handleLeaveRoom = async () => {
    if (socket && connected) {
      socket.emit('leave_room', { roomId });
    }
    if (user && token && currentRoom?.id === roomId) {
      try {
        await apiRequest('/rooms/leave', 'POST', null, token);
        await refreshMe();
      } catch {
        // Ignore leave error on exit
      }
    }
    onBackHome();
  };

  const submitBidAmount = (amountNumber) => {
    if (!user) {
      onOpenAuthModal();
      return;
    }
    if (!socket || !connected) {
      setFeedback({ type: 'error', message: 'Mất kết nối máy chủ thời gian thực.' });
      return;
    }

    setBidding(true);
    setFeedback(null);

    socket.emit('place_bid', { roomId, amount: amountNumber }, (res) => {
      setBidding(false);
      if (res?.success) {
        setFeedback({
          type: 'success',
          message: `Đặt giá thành công ${formatVND(amountNumber)}!`,
        });
      } else {
        setFeedback({
          type: 'error',
          message: res?.message || 'Mức giá không hợp lệ.',
        });
      }
    });
  };

  const handlePlaceBid = (e) => {
    e.preventDefault();
    const numeric = Number(bidAmount);
    if (!Number.isFinite(numeric) || numeric <= 0) {
      setFeedback({ type: 'error', message: 'Vui lòng nhập số tiền hợp lệ.' });
      return;
    }
    submitBidAmount(numeric);
  };

  const handleQuickBid = (increment) => {
    if (!activeItem) return;
    const base = Number(activeItem.currentPrice) || Number(activeItem.startingPrice) || 0;
    submitBidAmount(base + increment);
  };

  const handleBuyNow = () => {
    if (!user) {
      onOpenAuthModal();
      return;
    }
    if (!socket || !connected) {
      setFeedback({ type: 'error', message: 'Mất kết nối máy chủ thời gian thực.' });
      return;
    }
    setBuyingNow(true);
    setFeedback(null);
    socket.emit('buy_now', { roomId }, (res) => {
      setBuyingNow(false);
      if (!res?.success) {
        setFeedback({ type: 'error', message: res?.message || 'Không thể thực hiện Chốt giá.' });
      }
    });
  };

  const topBid = bids[0] || null;
  const leaderName = topBid?.bidder?.fullName || topBid?.bidderName || activeItem?.winner?.fullName || null;
  const leaderId = topBid?.bidderId || topBid?.bidder?.id || null;

  return (
    <div className="min-h-screen bg-[#fafafa] pt-6 sm:pt-8 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleLeaveRoom}
              className="serko-btn-secondary px-4 py-2 text-xs sm:text-sm inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Sảnh chính
            </button>

            {room && (
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-white border border-[#e5e7eb] text-[#4a4f59]">
                    {room.code}
                  </span>
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                      room.status === 'LIVE'
                        ? 'bg-[#e2f8ea] text-[#1b9e52]'
                        : room.status === 'UPCOMING'
                          ? 'bg-[#e8f3fe] text-[#004680]'
                          : 'bg-[#efefef] text-[#4a4f59]'
                    }`}
                  >
                    {room.status}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-semibold text-[#17181c] mt-0.5">
                  {room.title}
                </h2>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchRoomDetails}
              className="w-9 h-9 rounded-full bg-white border border-[#e5e7eb] hover:bg-[#f6f6f6] flex items-center justify-center text-[#17181c]"
              title="Làm mới dữ liệu phòng"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {user && room?.status !== 'ENDED' && (
              <button
                type="button"
                onClick={() => onOpenSellModal(roomId)}
                className="serko-btn-secondary px-4 py-2 text-xs sm:text-sm inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Ký gửi vào phòng
              </button>
            )}

            {user && currentRoom?.id === roomId && (
              <button
                type="button"
                onClick={handleLeaveRoom}
                className="px-4 py-2 rounded-full text-xs sm:text-sm font-medium bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 inline-flex items-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Rời phòng
              </button>
            )}
          </div>
        </div>

        {/* Strict 1-User / 1-Room Lock Alert */}
        {roomLockError && (
          <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-sm text-amber-950">
                <p className="font-semibold">Khóa phiên độc quyền: 1 Thành viên / 1 Phòng đấu</p>
                <p className="opacity-85 mt-0.5">{roomLockError.message}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              {roomLockError.lockedRoom?.id && (
                <button
                  type="button"
                  onClick={() => onEnterRoom(roomLockError.lockedRoom.id)}
                  className="px-4 py-2 rounded-full text-xs font-semibold bg-white border border-amber-300 text-amber-900 hover:bg-amber-100"
                >
                  Về phòng cũ
                </button>
              )}
              <button
                type="button"
                disabled={switchingRoom}
                onClick={handleLeaveAndSwitch}
                className="serko-btn-primary px-4 py-2 text-xs"
              >
                {switchingRoom ? 'Đang chuyển...' : 'Rời phòng cũ & Vào phòng này'}
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="serko-visual-frame p-4">
            <div className="bg-white rounded-[22px] p-10 text-center text-sm text-[#4a4f59]">
              Đang đồng bộ dữ liệu phiên đấu giá theo thời gian thực...
            </div>
          </div>
        ) : !room ? (
          <div className="serko-visual-frame p-6 text-center">
            <div className="bg-white rounded-2xl p-10">
              <AlertTriangle className="w-8 h-8 text-amber-600 mx-auto mb-3" />
              <p className="text-base font-semibold text-[#17181c]">Không tìm thấy phòng đấu giá</p>
              <button type="button" onClick={onBackHome} className="serko-btn-primary mt-4 text-sm">
                Quay về trang chủ
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Three Call Countdown Banner */}
            <ThreeCallCountdownBanner
              callStage={callStage}
              callDeadline={callDeadline}
              idleDeadline={idleDeadline}
              demoMode={demoMode}
              activeItem={activeItem}
              leaderName={leaderName}
            />

            {/* Main 12-Col Console */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              <div className="xl:col-span-8">
                <LiveBiddingConsole
                  room={room}
                  activeItem={activeItem}
                  user={user}
                  leaderName={leaderName}
                  leaderId={leaderId}
                  bidAmount={bidAmount}
                  setBidAmount={setBidAmount}
                  bidding={bidding}
                  buyingNow={buyingNow}
                  feedback={feedback}
                  onPlaceBid={handlePlaceBid}
                  onBuyNow={handleBuyNow}
                  onQuickBid={handleQuickBid}
                  onOpenAuthModal={onOpenAuthModal}
                  onOpenSellModal={() => onOpenSellModal(roomId)}
                />
              </div>

              <div className="xl:col-span-4">
                <LiveBidStreamAndQueue
                  bids={bids}
                  eventLogs={eventLogs}
                  participants={participants}
                  items={room.items || []}
                  activeItemId={activeItem?.id}
                  currentUserId={user?.id}
                  roomStatus={room.status}
                  user={user}
                  onOpenSellModal={() => onOpenSellModal(roomId)}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}


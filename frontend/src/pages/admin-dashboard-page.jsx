import React, { useCallback, useEffect, useState } from 'react';
import {
  Activity,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Gavel,
  Play,
  Plus,
  RefreshCw,
  Shield,
  SkipForward,
  Square,
  Users,
  Zap,
} from 'lucide-react';
import { apiRequest, formatVND } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { HoverShieldCheckIcon } from '../components/icons/itshover-animated-icons';

export function AdminDashboardPage({
  onEnterRoom,
  onOpenCreateRoomModal,
  onRefreshRooms,
}) {
  const { user, token, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [expandedRoomId, setExpandedRoomId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState('');
  const [notice, setNotice] = useState(null);

  const loadAdminData = useCallback(async () => {
    if (!token || !isAdmin) {
      setLoading(false);
      return;
    }
    try {
      const [statsRes, roomsRes, usersRes] = await Promise.all([
        apiRequest('/admin/stats', 'GET', null, token),
        apiRequest('/admin/rooms', 'GET', null, token),
        apiRequest('/admin/users', 'GET', null, token),
      ]);
      setStats(statsRes.data);
      setRooms(roomsRes.data || []);
      setUsers(usersRes.data || []);
    } catch (err) {
      setNotice({ type: 'error', message: err.message || 'Không thể tải dữ liệu quản trị.' });
    } finally {
      setLoading(false);
    }
  }, [token, isAdmin]);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const runAction = async (key, fn, successMessage) => {
    setBusyAction(key);
    setNotice(null);
    try {
      await fn();
      await loadAdminData();
      if (onRefreshRooms) await onRefreshRooms();
      if (successMessage) setNotice({ type: 'success', message: successMessage });
    } catch (err) {
      setNotice({ type: 'error', message: err.message || 'Thao tác thất bại.' });
    } finally {
      setBusyAction('');
    }
  };

  // Explicit { enabled: !stats?.demoMode } fixes the previous boolean undefined bug
  const handleToggleDemoMode = () =>
    runAction(
      'demo-mode',
      () =>
        apiRequest(
          '/admin/settings/demo-mode',
          'POST',
          { enabled: !stats?.demoMode },
          token
        ),
      !stats?.demoMode
        ? 'Đã BẬT Chế độ Demo Tua Nhanh (5s chờ / 5s gọi giá).'
        : 'Đã TẮT Chế độ Demo Tua Nhanh (quay về 3 phút chờ / 30s gọi giá).'
    );

  const handleUpdateRoomStatus = (roomId, status) =>
    runAction(
      `status-${roomId}`,
      () => apiRequest(`/admin/rooms/${roomId}`, 'PATCH', { status }, token),
      `Đã cập nhật trạng thái phòng sang ${status}.`
    );

  const handleForceHammer = (roomId) =>
    runAction(
      `hammer-${roomId}`,
      () => apiRequest(`/admin/rooms/${roomId}/force-hammer`, 'POST', null, token),
      'Đã kích hoạt gõ búa cưỡng bức lô hiện tại.'
    );

  const handleSkipItem = (roomId) =>
    runAction(
      `skip-${roomId}`,
      () => apiRequest(`/admin/rooms/${roomId}/skip-item`, 'POST', null, token),
      'Đã bỏ qua lô hiện tại và kích hoạt lô tiếp theo.'
    );

  const handleToggleRole = (targetUser) => {
    const nextRole = targetUser.role === 'ADMIN' ? 'MEMBER' : 'ADMIN';
    return runAction(
      `role-${targetUser.id}`,
      () => apiRequest(`/admin/users/${targetUser.id}/role`, 'PATCH', { role: nextRole }, token),
      `Đã chuyển quyền ${targetUser.email} thành ${nextRole}.`
    );
  };

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#fafafa] pt-8 sm:pt-12 pb-20 px-4">
        <div className="max-w-xl mx-auto serko-visual-frame p-6">
          <div className="bg-white rounded-2xl p-8 text-center">
            <Shield className="w-10 h-10 text-[#17181c] mx-auto mb-3" />
            <h1 className="text-xl font-semibold text-[#17181c]">Khu vực dành riêng cho Quản trị viên</h1>
            <p className="text-sm text-[#4a4f59] mt-2">
              Vui lòng đăng nhập bằng tài khoản ADMIN (`admin@royalauction.vn`) để điều phối phòng đấu giá và kiểm soát hàng đợi.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] pt-6 sm:pt-8 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#004680]">
              <HoverShieldCheckIcon className="w-4 h-4 text-[#1b9e52]" />
              RoyalAuction Governance
            </span>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#17181c] mt-1">
              Trung tâm Điều phối Đấu giá
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={loadAdminData}
              className="serko-btn-secondary px-4 py-2 text-xs sm:text-sm inline-flex items-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4" />
              Làm mới
            </button>
            <button
              type="button"
              onClick={onOpenCreateRoomModal}
              className="serko-btn-primary px-4 py-2 text-xs sm:text-sm inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Tạo phòng mới
            </button>
          </div>
        </div>

        {notice && (
          <div
            className={`rounded-xl px-4 py-3 text-sm border ${
              notice.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-[#e2f8ea] border-[#bdebd0] text-[#126b37]'
            }`}
          >
            {notice.message}
          </div>
        )}

        {/* KPI Cards */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-[#e5e7eb] p-8 text-center text-sm text-[#4a4f59]">
            Đang tải số liệu hệ thống...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
              <div className="bg-white rounded-2xl border border-[#e5e7eb] p-4">
                <p className="text-xs text-[#666b75]">Tổng thành viên</p>
                <p className="text-2xl font-bold font-mono text-[#17181c] mt-1 tabular-nums">
                  {stats?.totalUsers ?? 0}
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-[#e5e7eb] p-4">
                <p className="text-xs text-[#666b75]">Phòng đang LIVE</p>
                <p className="text-2xl font-bold font-mono text-[#1b9e52] mt-1 tabular-nums">
                  {stats?.liveRooms ?? 0} / {stats?.totalRooms ?? 0}
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-[#e5e7eb] p-4">
                <p className="text-xs text-[#666b75]">Vật phẩm đã chốt</p>
                <p className="text-2xl font-bold font-mono text-[#17181c] mt-1 tabular-nums">
                  {stats?.soldCount ?? 0} / {stats?.totalItems ?? 0}
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-[#e5e7eb] p-4">
                <p className="text-xs text-[#666b75]">Tổng GMV giao dịch</p>
                <p className="text-lg sm:text-xl font-bold font-mono text-[#17181c] mt-1 tabular-nums truncate">
                  {formatVND(stats?.totalGMV ?? 0)}
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-[#e5e7eb] p-4">
                <p className="text-xs text-[#666b75]">Đang trong phòng</p>
                <p className="text-2xl font-bold font-mono text-[#004680] mt-1 tabular-nums">
                  {stats?.activeParticipants ?? 0}
                </p>
              </div>
            </div>

            {/* Demo Fast-Forward Toggle */}
            <div className="serko-visual-frame p-3">
              <div className="bg-white rounded-2xl border border-[#e5e7eb] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      stats?.demoMode ? 'bg-[#e8f3fe] text-[#004680]' : 'bg-[#f6f6f6] text-[#4a4f59]'
                    }`}
                  >
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-[#17181c]">
                      Chế độ Demo Tua Nhanh (Fast-Forward Engine)
                    </h2>
                    <p className="text-xs sm:text-sm text-[#4a4f59] mt-0.5">
                      {stats?.demoMode
                        ? 'ĐANG BẬT: Chờ trả giá 5 giây · Mỗi lần gọi chốt 5 giây (phục vụ kiểm thử nhanh).'
                        : 'ĐANG TẮT (Tiêu chuẩn): Chờ trả giá 3 phút (180s) · 3 lần gọi chốt mỗi lần 30 giây.'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={busyAction === 'demo-mode'}
                  onClick={handleToggleDemoMode}
                  className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold shrink-0 transition-colors ${
                    stats?.demoMode
                      ? 'bg-[#004680] text-white hover:bg-[#003460]'
                      : 'bg-[#17181c] text-white hover:bg-[#2c2f36]'
                  }`}
                >
                  {busyAction === 'demo-mode'
                    ? 'Đang cập nhật...'
                    : stats?.demoMode
                      ? 'Tắt Demo Tua Nhanh'
                      : 'Bật Demo Tua Nhanh'}
                </button>
              </div>
            </div>

            {/* Rooms Control Table */}
            <div className="bg-white rounded-[24px] border border-[#e5e7eb] overflow-hidden shadow-xs">
              <div className="px-6 py-4 border-b border-[#e5e7eb] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#1b9e52]" />
                  <h2 className="text-base font-semibold text-[#17181c]">
                    Điều phối Phòng đấu giá & Hàng đợi ({rooms.length})
                  </h2>
                </div>
              </div>

              <div className="divide-y divide-[#eceef2]">
                {rooms.map((room) => {
                  const isExpanded = expandedRoomId === room.id;
                  const activeItem = room.items?.find((i) => i.status === 'BIDDING');
                  return (
                    <div key={room.id} className="p-5 space-y-3">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#f6f6f6] text-[#17181c]">
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
                            <span className="text-xs text-[#666b75]">
                              {room.items?.length || 0} lô · {room.participants?.length || 0} người trong phòng
                            </span>
                          </div>
                          <h3 className="text-base font-semibold text-[#17181c]">
                            {room.title}
                          </h3>
                          {activeItem && (
                            <p className="text-xs text-[#4a4f59]">
                              Đang đấu: <strong>{activeItem.title}</strong> ({formatVND(activeItem.currentPrice)})
                            </p>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onEnterRoom(room.id)}
                            className="px-3.5 py-2 rounded-full text-xs font-medium bg-[#f6f6f6] hover:bg-[#e9eaee] text-[#17181c] inline-flex items-center gap-1"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Vào phòng
                          </button>

                          {room.status === 'UPCOMING' && (
                            <button
                              type="button"
                              disabled={busyAction === `status-${room.id}`}
                              onClick={() => handleUpdateRoomStatus(room.id, 'LIVE')}
                              className="px-3.5 py-2 rounded-full text-xs font-semibold bg-[#1b9e52] text-white hover:bg-[#158343] inline-flex items-center gap-1"
                            >
                              <Play className="w-3.5 h-3.5" />
                              Mở phiên LIVE
                            </button>
                          )}

                          {room.status === 'LIVE' && activeItem && (
                            <>
                              <button
                                type="button"
                                disabled={busyAction === `hammer-${room.id}`}
                                onClick={() => handleForceHammer(room.id)}
                                className="px-3.5 py-2 rounded-full text-xs font-semibold bg-[#17181c] text-white hover:bg-[#2c2f36] inline-flex items-center gap-1"
                              >
                                <Gavel className="w-3.5 h-3.5" />
                                Gõ búa ngay
                              </button>
                              <button
                                type="button"
                                disabled={busyAction === `skip-${room.id}`}
                                onClick={() => handleSkipItem(room.id)}
                                className="px-3.5 py-2 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 hover:bg-amber-200 inline-flex items-center gap-1"
                              >
                                <SkipForward className="w-3.5 h-3.5" />
                                Bỏ qua lô
                              </button>
                            </>
                          )}

                          {room.status === 'LIVE' && (
                            <button
                              type="button"
                              disabled={busyAction === `status-${room.id}`}
                              onClick={() => handleUpdateRoomStatus(room.id, 'ENDED')}
                              className="px-3.5 py-2 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 inline-flex items-center gap-1"
                            >
                              <Square className="w-3 h-3" />
                              Đóng phòng
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setExpandedRoomId(isExpanded ? null : room.id)}
                            className="w-8 h-8 rounded-full bg-[#f6f6f6] flex items-center justify-center text-[#4a4f59]"
                            aria-label="Xem hàng đợi"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="pt-3 border-t border-dashed border-[#e5e7eb] grid grid-cols-1 md:grid-cols-2 gap-2.5">
                          {(room.items || []).map((item) => (
                            <div
                              key={item.id}
                              className="rounded-xl bg-[#fafafa] border border-[#eceef2] p-3 flex items-center justify-between gap-3"
                            >
                              <div className="min-w-0">
                                <p className="text-xs font-mono text-[#666b75]">
                                  Lot #{item.queueOrder} · {item.status}
                                </p>
                                <p className="text-sm font-medium text-[#17181c] truncate">
                                  {item.title}
                                </p>
                              </div>
                              <span className="font-mono text-xs font-semibold text-[#17181c] shrink-0">
                                {formatVND(item.soldPrice || item.currentPrice || item.startingPrice)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RBAC Users Table */}
            <div className="bg-white rounded-[24px] border border-[#e5e7eb] overflow-hidden shadow-xs">
              <div className="px-6 py-4 border-b border-[#e5e7eb] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#004680]" />
                <h2 className="text-base font-semibold text-[#17181c]">
                  Phân quyền Tài khoản RBAC ({users.length})
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#fafafa] text-[11px] uppercase tracking-wider text-[#666b75] border-b border-[#e5e7eb]">
                      <th className="py-3 px-6 font-semibold">Thành viên</th>
                      <th className="py-3 px-4 font-semibold">Email</th>
                      <th className="py-3 px-4 font-semibold">Vai trò</th>
                      <th className="py-3 px-4 font-semibold">Hạn mức</th>
                      <th className="py-3 px-6 text-right font-semibold">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eceef2] text-sm">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-[#fafafa]">
                        <td className="py-3.5 px-6 font-medium text-[#17181c]">
                          {u.fullName}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs text-[#4a4f59]">
                          {u.email}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                              u.role === 'ADMIN'
                                ? 'bg-[#17181c] text-white'
                                : 'bg-[#e8f3fe] text-[#004680]'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs text-[#17181c]">
                          {formatVND(u.balance)}
                        </td>
                        <td className="py-3.5 px-6 text-right">
                          {u.id === user.id ? (
                            <span className="text-xs text-[#666b75]">Đang đăng nhập</span>
                          ) : (
                            <button
                              type="button"
                              disabled={busyAction === `role-${u.id}`}
                              onClick={() => handleToggleRole(u)}
                              className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#f6f6f6] hover:bg-[#e9eaee] text-[#17181c] border border-[#e5e7eb]"
                            >
                              Chuyển sang {u.role === 'ADMIN' ? 'MEMBER' : 'ADMIN'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}


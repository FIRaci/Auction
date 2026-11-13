import React from 'react';
import { motion } from 'motion/react';
import { Search, Users } from 'lucide-react';
import { formatVND } from '../../config/api';
import { ProductImageViewer } from '../common/product-image-viewer';
import { KineticOdometer } from '../motion/kinetic-odometer-price';
import {
  HoverArrowUpRightIcon,
  HoverLayersQueueIcon,
  HoverGavelIcon,
} from '../icons/itshover-animated-icons';

const FILTER_TABS = [
  { id: 'ALL', label: 'Tất Cả' },
  { id: 'LIVE', label: 'Đang Live' },
  { id: 'UPCOMING', label: 'Sắp Mở' },
  { id: 'ENDED', label: 'Đã Kết Thúc' },
];

/**
 * UI.live + Serko modular Bento Room Directory.
 * Features outer #f6f6f6 container framing crisp white inner cards.
 */
export function LiveRoomsCatalogSection({
  rooms,
  loading,
  filter,
  setFilter,
  searchQuery,
  setSearchQuery,
  user,
  onEnterRoom,
  onOpenCreateRoomModal,
}) {
  const filteredRooms = rooms.filter((r) => {
    if (filter === 'LIVE' && r.status !== 'LIVE') return false;
    if (filter === 'UPCOMING' && r.status !== 'UPCOMING') return false;
    if (filter === 'ENDED' && r.status !== 'ENDED') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.title.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q) ||
        (r.activeItem?.title || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <section id="rooms-catalog" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header + Search & Filter */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[#ededf0] mb-10">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#0078d4] mb-2.5">
              <HoverLayersQueueIcon className="w-4 h-4" />
              <span>Danh Mục Phiên Đấu Giá Trực Tuyến</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-[-0.015em] !leading-[1.28] text-[#17181c]">
              Chọn Phòng Đấu Giá Đang Mở
            </h2>
            <p className="text-sm sm:text-base text-[#4b4f57] mt-1.5 max-w-2xl">
              Mỗi phòng vận hành hàng đợi FIFO độc lập. Tài khoản của bạn chỉ tham gia tối đa 01 phòng tại cùng một thời điểm.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative sm:w-64">
              <Search className="w-4 h-4 text-[#8a8d96] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm mã phòng, hiện vật..."
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#f6f6f6] border border-[#e9e9ec] text-base sm:text-sm text-[#17181c] placeholder-[#8a8d96] focus:outline-none focus:bg-white focus:border-[#1b98f2] transition-colors"
              />
            </div>

            <div className="flex items-center p-1 rounded-full bg-[#f6f6f6] border border-[#e9e9ec]">
              {FILTER_TABS.map((tab) => {
                const active = filter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFilter(tab.id)}
                    className={`relative px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                      active ? 'text-white' : 'text-[#4b4f57] hover:text-[#17181c]'
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="rooms-filter-pill"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        className="absolute inset-0 rounded-full bg-[#17181c]"
                      />
                    )}
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Rooms Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="rounded-[28px] bg-[#f6f6f6] p-3 animate-pulse h-[420px]" />
            ))}
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="rounded-[28px] bg-[#f6f6f6] p-12 text-center border border-[#e9e9ec]">
            <HoverGavelIcon className="w-10 h-10 text-[#8a8d96] mx-auto mb-3" />
            <h3 className="text-lg font-bold text-[#17181c] mb-1">
              Không tìm thấy phòng phù hợp
            </h3>
            <p className="text-sm text-[#4b4f57] mb-5">
              Thử thay đổi bộ lọc trạng thái hoặc tự khởi tạo một phiên đấu giá mới.
            </p>
            {user && (
              <button
                type="button"
                onClick={onOpenCreateRoomModal}
                className="serko-btn-primary px-5 py-2.5 text-xs"
              >
                + Tạo Phòng Đấu Giá Mới
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {filteredRooms.map((room, idx) => {
              const isLive = room.status === 'LIVE';
              const isUpcoming = room.status === 'UPCOMING';
              const targetItem = room.activeItem || room.previewItem;
              const displayImg = targetItem?.imageUrl;
              const leadingPrice = targetItem?.currentPrice ?? targetItem?.startingPrice;

              return (
                <motion.article
                  key={room.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: idx * 0.05 }}
                  className="group rounded-[30px] bg-[#f6f6f6] p-2.5 border border-[#e9e9ec] flex flex-col justify-between hover:shadow-serko-card transition-shadow"
                >
                  {/* Inner Crisp White Card */}
                  <div className="bg-white rounded-[22px] p-4 border border-[#ededf0] flex-1 flex flex-col justify-between">
                    <div>
                      <div className="relative aspect-[16/10] rounded-2xl overflow-hidden mb-4 border border-[#ededf0]">
                        <ProductImageViewer
                          src={displayImg}
                          alt={targetItem?.title || room.title}
                          fallbackKey={idx}
                        />

                        <div className="absolute top-3 left-3">
                          {isLive ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#e2f8ea]/95 backdrop-blur-sm text-[#146b3a] text-[11px] font-bold border border-[#c7f0d7]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#1b9e52] animate-pulse" />
                              ĐANG LIVE
                            </span>
                          ) : isUpcoming ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#e8f3fe]/95 backdrop-blur-sm text-[#0078d4] text-[11px] font-bold border border-[#cfe6fc]">
                              SẮP MỞ
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/90 text-[#4b4f57] text-[11px] font-bold">
                              ĐÃ KẾT THÚC
                            </span>
                          )}
                        </div>

                        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[#17181c] font-mono text-[11px] font-bold border border-black/[0.06]">
                          {room.code}
                        </div>
                      </div>

                      <h3 className="text-lg font-bold text-[#17181c] leading-[1.4] line-clamp-2 mb-2 group-hover:text-[#0078d4] transition-colors">
                        {room.title}
                      </h3>
                      <p className="text-xs text-[#4b4f57] leading-relaxed line-clamp-2 mb-4">
                        {room.description}
                      </p>
                    </div>

                    {/* Active Lot Price / Queue Footer inside White Card */}
                    <div className="pt-3 border-t border-[#ededf0] flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-medium uppercase tracking-[0.05em] text-[#8a8d96] block">
                          {leadingPrice ? 'Giá hiện tại trên sàn' : 'Tổng số lô FIFO'}
                        </span>
                        <div className="text-sm font-mono font-bold text-[#17181c] mt-0.5">
                          {leadingPrice ? (
                            <KineticOdometer value={formatVND(leadingPrice)} />
                          ) : (
                            `${room.totalItems || 0} lô chờ mở`
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs font-medium text-[#4b4f57]">
                        <span>{room.totalItems || 0} lô</span>
                        <span className="inline-flex items-center gap-1 font-mono">
                          <Users className="w-3.5 h-3.5 text-[#1b98f2]" />
                          {room.participantCount || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Outer Gray Tray Footer Action */}
                  <div className="pt-2.5 px-1.5 pb-1 flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-[#4b4f57] truncate">
                      {room.activeItem?.title
                        ? `Đang đấu: ${room.activeItem.title}`
                        : `Chủ phòng: ${room.creator?.fullName || 'Ban Điều Hành'}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => onEnterRoom(room.id)}
                      className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                        isLive
                          ? 'bg-[#17181c] text-white hover:bg-black/80'
                          : 'bg-white text-[#17181c] border border-[#e9e9ec] hover:border-[#17181c]'
                      }`}
                    >
                      <span>{isLive ? 'Vào Đấu Giá' : 'Xem Lô Hàng'}</span>
                      <HoverArrowUpRightIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default LiveRoomsCatalogSection;


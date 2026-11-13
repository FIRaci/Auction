import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Activity, Layers, Plus, Users } from 'lucide-react';
import { formatVND } from '../../config/api';
import { ProductImageViewer } from '../common/product-image-viewer';
import { HoverLayersQueueIcon } from '../icons/itshover-animated-icons';

function formatTime(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return '';
  }
}

const ITEM_STATUS_LABEL = {
  BIDDING: { text: 'Đang đấu', cls: 'bg-[#e2f8ea] text-[#1b9e52]' },
  WAITING: { text: 'Chờ lượt', cls: 'bg-[#e8f3fe] text-[#004680]' },
  SOLD: { text: 'Đã bán', cls: 'bg-[#17181c] text-white' },
  UNSOLD: { text: 'Chưa bán', cls: 'bg-[#f6f6f6] text-[#666b75]' },
};

export function LiveBidStreamAndQueue({
  bids = [],
  eventLogs = [],
  participants = [],
  items = [],
  activeItemId = null,
  currentUserId = null,
  roomStatus = 'LIVE',
  user = null,
  onOpenSellModal,
}) {
  const [activeTab, setActiveTab] = useState('stream');

  const tabs = [
    { id: 'stream', label: 'Diễn biến', icon: Activity, count: bids.length },
    { id: 'queue', label: 'Hàng đợi', icon: Layers, count: items.length },
    { id: 'members', label: 'Thành viên', icon: Users, count: participants.length },
  ];

  const sortedItems = [...items].sort((a, b) => (a.queueOrder || 0) - (b.queueOrder || 0));

  return (
    <div className="serko-visual-frame p-3 h-full flex flex-col">
      <div className="bg-white rounded-[20px] border border-[#e5e7eb] flex-1 flex flex-col overflow-hidden">
        {/* Sliding Pill Tabs */}
        <div className="p-3 border-b border-[#e5e7eb] bg-[#fafafa]">
          <div className="grid grid-cols-3 gap-1 p-1 rounded-full bg-[#efefef]">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative py-2 px-2.5 rounded-full text-xs font-medium flex items-center justify-center gap-1.5 transition-colors z-10 ${
                    isSelected ? 'text-[#17181c]' : 'text-[#5b606b] hover:text-[#17181c]'
                  }`}
                >
                  {isSelected && (
                    <motion.span
                      layoutId="roomStreamTabPill"
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                      className="absolute inset-0 bg-white rounded-full shadow-xs -z-10"
                    />
                  )}
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{tab.label}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[#f3f4f6] text-[#4a4f59]">
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 max-h-[540px] space-y-3">
          {activeTab === 'stream' && (
            <>
              {bids.length === 0 && eventLogs.length === 0 ? (
                <div className="py-12 text-center text-sm text-[#666b75]">
                  Chưa có lượt trả giá hoặc sự kiện nào trong lô hàng này.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {bids.map((bid, idx) => {
                    const isTop = idx === 0;
                    const bidderName = bid.bidder?.fullName || bid.bidderName || 'Thành viên';
                    return (
                      <motion.div
                        key={bid.id || `${bid.createdAt}-${idx}`}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`rounded-xl p-3 border flex items-center justify-between gap-3 ${
                          isTop
                            ? 'bg-[#e2f8ea]/65 border-[#b8eccb]'
                            : 'bg-[#fafafa] border-[#eceef2]'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-[#17181c] truncate">
                              {bidderName}
                            </span>
                            {isTop && (
                              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-[#1b9e52] text-white">
                                Cao nhất
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#666b75] mt-0.5">
                            {formatTime(bid.createdAt)}
                          </p>
                        </div>
                        <span className="font-mono text-sm font-bold text-[#17181c] shrink-0 tabular-nums">
                          {formatVND(bid.amount)}
                        </span>
                      </motion.div>
                    );
                  })}

                  {eventLogs.length > 0 && (
                    <div className="pt-3 mt-3 border-t border-dashed border-[#e5e7eb] space-y-2">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-[#666b75]">
                        Nhật ký hệ thống
                      </p>
                      {eventLogs.slice(0, 12).map((log, i) => (
                        <div
                          key={log.id || `log-${i}`}
                          className="text-xs text-[#4a4f59] bg-[#f6f6f6] rounded-lg px-3 py-2 flex items-start justify-between gap-2"
                        >
                          <span>{log.message}</span>
                          <span className="font-mono text-[10px] text-[#7a808c] shrink-0">
                            {formatTime(log.createdAt)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {activeTab === 'queue' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#4a4f59]">
                  <HoverLayersQueueIcon className="w-4 h-4 text-[#17181c]" />
                  Thứ tự đấu giá nối tiếp (FIFO)
                </span>
                {user && roomStatus !== 'ENDED' && (
                  <button
                    type="button"
                    onClick={onOpenSellModal}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#17181c] text-white hover:bg-[#2c2f36] transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Ký gửi thêm
                  </button>
                )}
              </div>

              {sortedItems.length === 0 ? (
                <div className="py-10 text-center text-sm text-[#666b75]">
                  Hàng đợi vật phẩm đang trống.
                </div>
              ) : (
                sortedItems.map((item) => {
                  const statusMeta = ITEM_STATUS_LABEL[item.status] || ITEM_STATUS_LABEL.WAITING;
                  const isActive = item.id === activeItemId;
                  return (
                    <div
                      key={item.id}
                      className={`rounded-xl p-3 border flex items-center gap-3 ${
                        isActive
                          ? 'bg-[#f8fbff] border-[#9ec5f8]'
                          : 'bg-white border-[#eceef2]'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#f6f6f6] border border-[#e5e7eb] shrink-0">
                        <ProductImageViewer
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          fallbackKey={item.category || item.title}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono text-[#666b75]">
                            #{item.queueOrder}
                          </span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusMeta.cls}`}>
                            {statusMeta.text}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-[#17181c] truncate mt-0.5">
                          {item.title}
                        </p>
                        <p className="text-xs font-mono text-[#4a4f59]">
                          {item.status === 'SOLD' && item.soldPrice
                            ? `Chốt: ${formatVND(item.soldPrice)}`
                            : formatVND(item.currentPrice || item.startingPrice)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'members' && (
            <div className="space-y-2.5">
              <p className="text-xs text-[#666b75]">
                Hệ thống khóa 1 thành viên chỉ được hiện diện trong 1 phòng đấu tại một thời điểm.
              </p>
              {participants.length === 0 ? (
                <div className="py-10 text-center text-sm text-[#666b75]">
                  Chưa có thành viên nào khác trong phòng.
                </div>
              ) : (
                participants.map((p) => {
                  const member = p.user || p;
                  const isMe = currentUserId && member.id === currentUserId;
                  const initials = (member.fullName || 'U')
                    .split(' ')
                    .map((s) => s[0])
                    .slice(-2)
                    .join('')
                    .toUpperCase();
                  return (
                    <div
                      key={member.id || p.id}
                      className="rounded-xl p-3 border border-[#eceef2] bg-[#fafafa] flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-[#17181c] text-white text-xs font-semibold flex items-center justify-center shrink-0">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[#17181c] truncate">
                            {member.fullName || member.email}
                            {isMe && (
                              <span className="ml-2 text-[11px] font-semibold text-[#1b9e52]">
                                (Bạn)
                              </span>
                            )}
                          </p>
                          {member.role && (
                            <p className="text-[11px] text-[#666b75] uppercase font-mono">
                              {member.role}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-[#1b9e52] shrink-0" />
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


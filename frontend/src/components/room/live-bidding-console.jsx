import React from 'react';
import { motion } from 'motion/react';
import { AlertCircle, CheckCircle2, Crown, ShieldCheck, Sparkles, Tag, UserCheck } from 'lucide-react';
import { formatVND } from '../../config/api';
import { ProductImageViewer } from '../common/product-image-viewer';
import { KineticOdometer } from '../motion/kinetic-odometer-price';
import {
  HoverBoltZapIcon,
  HoverGavelIcon,
  HoverShieldCheckIcon,
} from '../icons/itshover-animated-icons';

export function LiveBiddingConsole({
  room,
  activeItem,
  user,
  leaderName,
  leaderId,
  bidAmount,
  setBidAmount,
  bidding,
  buyingNow,
  feedback,
  onPlaceBid,
  onBuyNow,
  onQuickBid,
  onOpenAuthModal,
  onOpenSellModal,
}) {
  if (!activeItem) {
    return (
      <div className="serko-visual-frame p-6 sm:p-10 text-center">
        <div className="bg-white rounded-2xl border border-[#e5e7eb] p-8 sm:p-12 max-w-xl mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-[#f6f6f6] flex items-center justify-center mx-auto mb-4 text-[#17181c]">
            <HoverGavelIcon className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-semibold text-[#17181c] mb-2">
            {room?.status === 'ENDED'
              ? 'Phiên đấu giá đã khép lại'
              : 'Hàng đợi hiện chưa có vật phẩm đang đấu'}
          </h3>
          <p className="text-sm text-[#4a4f59] mb-6 leading-relaxed">
            {room?.status === 'ENDED'
              ? 'Tất cả vật phẩm trong phòng này đã hoàn tất gõ búa. Bạn có thể xem lại lịch sử đấu giá hoặc tham gia phòng khác.'
              : 'Hãy ký gửi một vật phẩm vào hàng đợi FIFO hoặc chuyển sang phòng đang trực tiếp khác.'}
          </p>
          {room?.status !== 'ENDED' && user && (
            <button
              type="button"
              onClick={onOpenSellModal}
              className="serko-btn-primary text-sm"
            >
              + Ký gửi vật phẩm ngay
            </button>
          )}
        </div>
      </div>
    );
  }

  const minStep = Math.max(10000, Number(activeItem.minIncrement) || 10000);
  const basePrice = Number(activeItem.currentPrice) || Number(activeItem.startingPrice) || 0;
  const hasBid = Boolean(leaderName) || basePrice > Number(activeItem.startingPrice);
  const minValidBid = hasBid ? basePrice + minStep : Number(activeItem.startingPrice);
  const quickIncrements = [10000, 50000, 100000, 500000];

  const isLeading = Boolean(user && leaderId && user.id === leaderId);
  const isSeller = Boolean(user && activeItem.sellerId === user.id);
  const isRoomLive = room?.status === 'LIVE' && activeItem.status === 'BIDDING';

  return (
    <div className="serko-visual-frame p-3 sm:p-4">
      <div className="bg-white rounded-[22px] border border-[#e5e7eb] overflow-hidden shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Product Image & Provenance */}
          <div className="lg:col-span-5 bg-[#f6f6f6] p-4 sm:p-5 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#e5e7eb]">
            <div className="relative rounded-2xl overflow-hidden bg-white border border-[#e5e7eb] aspect-square">
              <ProductImageViewer
                src={activeItem.imageUrl}
                alt={activeItem.title}
                className="w-full h-full object-cover"
                fallbackKey={activeItem.category || activeItem.title}
              />
              <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/95 text-[#17181c] border border-[#e5e7eb] shadow-xs">
                  Lot #{activeItem.queueOrder || 1}
                </span>
                {activeItem.category && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#17181c]/85 text-white backdrop-blur-xs">
                    <Tag className="w-3 h-3" />
                    {activeItem.category}
                  </span>
                )}
              </div>
              {activeItem.status === 'SOLD' && (
                <div className="absolute inset-0 bg-[#17181c]/65 backdrop-blur-[2px] flex items-center justify-center">
                  <span className="px-4 py-2 rounded-full bg-white text-[#17181c] font-bold text-sm tracking-wide uppercase shadow-md">
                    Đã gõ búa chốt đơn
                  </span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-[#e5e7eb] flex items-center justify-between text-xs text-[#4a4f59]">
              <span className="inline-flex items-center gap-1.5 font-medium text-[#17181c]">
                <HoverShieldCheckIcon className="w-4 h-4 text-[#1b9e52]" />
                Kiểm định minh bạch
              </span>
              {activeItem.seller?.fullName && (
                <span>Người ký gửi: <strong className="text-[#17181c]">{activeItem.seller.fullName}</strong></span>
              )}
            </div>
          </div>

          {/* Lot Details & Bidding Controls */}
          <div className="lg:col-span-7 p-5 sm:p-7 flex flex-col justify-between gap-5">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="text-xs font-mono uppercase tracking-wider text-[#4a4f59]">
                  {room?.code} • Phiên trực tuyến
                </span>
                {isLeading && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#e2f8ea] text-[#1b9e52]">
                    <Crown className="w-3.5 h-3.5" />
                    Bạn đang dẫn đầu
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#17181c] mb-2.5">
                {activeItem.title}
              </h1>
              <p className="text-sm text-[#4a4f59] leading-relaxed">
                {activeItem.description || 'Vật phẩm tuyển chọn xác thực nguồn gốc và niêm yết công khai theo thời gian thực.'}
              </p>

              {/* Price Tiers Grid */}
              <div className="grid grid-cols-3 gap-2.5 mt-5">
                <div className="rounded-xl bg-[#f6f6f6] p-3 border border-[#eceef2]">
                  <p className="text-[11px] uppercase tracking-wider text-[#666b75] font-medium">Khởi điểm</p>
                  <p className="font-mono text-xs sm:text-sm font-semibold text-[#17181c] mt-1 tabular-nums">
                    {formatVND(activeItem.startingPrice)}
                  </p>
                </div>
                <div className="rounded-xl bg-[#f6f6f6] p-3 border border-[#eceef2]">
                  <p className="text-[11px] uppercase tracking-wider text-[#666b75] font-medium">Bước giá min</p>
                  <p className="font-mono text-xs sm:text-sm font-semibold text-[#17181c] mt-1 tabular-nums">
                    +{formatVND(minStep)}
                  </p>
                </div>
                <div className="rounded-xl bg-[#e8f3fe]/70 p-3 border border-[#d0e5fc]">
                  <p className="text-[11px] uppercase tracking-wider text-[#004680] font-medium">Mua ngay</p>
                  <p className="font-mono text-xs sm:text-sm font-semibold text-[#001c38] mt-1 tabular-nums">
                    {activeItem.buyNowPrice ? formatVND(activeItem.buyNowPrice) : 'Không áp dụng'}
                  </p>
                </div>
              </div>

              {/* Leading Current Price Highlight */}
              <div className="mt-5 rounded-2xl border border-[#e5e7eb] bg-gradient-to-br from-[#ffffff] to-[#f6f8fb] p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-medium uppercase tracking-wider text-[#4a4f59]">
                    {hasBid ? 'Giá trả cao nhất hiện tại' : 'Giá khởi điểm hiện hành'}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#17181c]">
                    <UserCheck className="w-3.5 h-3.5 text-[#1b9e52]" />
                    {leaderName ? `Dẫn đầu: ${leaderName}` : 'Chưa có lượt trả giá'}
                  </span>
                </div>
                <div className="text-3xl sm:text-4xl font-bold tracking-tight text-[#17181c] font-mono tabular-nums">
                  <KineticOdometer value={formatVND(basePrice)} />
                </div>
              </div>
            </div>

            {/* Feedback Banner */}
            {feedback?.message && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-xl px-4 py-3 text-sm flex items-start gap-2.5 border ${
                  feedback.type === 'error'
                    ? 'bg-red-50 border-red-200 text-red-800'
                    : 'bg-[#e2f8ea] border-[#bdebd0] text-[#126b37]'
                }`}
              >
                {feedback.type === 'error' ? (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                )}
                <span>{feedback.message}</span>
              </motion.div>
            )}

            {/* Bidding Interactive Zone */}
            {!user ? (
              <div className="rounded-2xl bg-[#f6f6f6] border border-[#e5e7eb] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-sm text-[#4a4f59]">
                  Đăng nhập tài khoản thành viên để đặt giá trực tiếp hoặc mua ngay vật phẩm này.
                </div>
                <button
                  type="button"
                  onClick={onOpenAuthModal}
                  className="serko-btn-primary text-sm shrink-0"
                >
                  Đăng nhập để trả giá
                </button>
              </div>
            ) : isSeller ? (
              <div className="rounded-2xl bg-[#f6f6f6] border border-[#e5e7eb] p-4 text-sm text-[#4a4f59] flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#17181c] shrink-0" />
                <span>Bạn là người ký gửi vật phẩm này nên không thể tự đặt giá cho lô hàng của mình.</span>
              </div>
            ) : !isRoomLive ? (
              <div className="rounded-2xl bg-[#f6f6f6] border border-[#e5e7eb] p-4 text-sm text-[#4a4f59]">
                {room?.status === 'UPCOMING'
                  ? 'Phòng sắp diễn ra — Quản trị viên sẽ mở phiên trong giây lát.'
                  : 'Vật phẩm này hiện không trong trạng thái nhận trả giá.'}
              </div>
            ) : (
              <div className="space-y-3">
                {/* Quick increment chips */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-[#4a4f59] mr-1">Trả nhanh:</span>
                  {quickIncrements.map((inc) => {
                    const effectiveInc = Math.max(inc, minStep);
                    const targetPrice = basePrice + effectiveInc;
                    return (
                      <button
                        key={inc}
                        type="button"
                        disabled={bidding || buyingNow}
                        onClick={() => onQuickBid(effectiveInc)}
                        className="px-3 py-1.5 rounded-full text-xs font-mono font-semibold bg-[#f6f6f6] hover:bg-[#17181c] hover:text-white text-[#17181c] border border-[#e5e7eb] transition-colors disabled:opacity-50"
                        title={`Đặt ${formatVND(targetPrice)}`}
                      >
                        +{(inc / 1000).toLocaleString('vi-VN')}k
                      </button>
                    );
                  })}
                </div>

                {/* Custom bid form + Buy Now */}
                <form onSubmit={onPlaceBid} className="flex flex-col sm:flex-row gap-2.5">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      min={minValidBid}
                      step={10000}
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder={`Tối thiểu ${formatVND(minValidBid)}`}
                      className="w-full h-12 px-4 rounded-full border border-[#d6d9e0] bg-white text-base font-mono text-[#17181c] focus:outline-none focus:ring-2 focus:ring-[#17181c]/15 focus:border-[#17181c]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={bidding || buyingNow}
                    className="serko-btn-primary h-12 px-6 inline-flex items-center justify-center gap-2 text-sm font-semibold shrink-0 disabled:opacity-50"
                  >
                    <HoverGavelIcon className="w-4 h-4" />
                    {bidding ? 'Đang gửi...' : 'Đặt giá'}
                  </button>

                  {activeItem.buyNowPrice > 0 && (
                    <button
                      type="button"
                      disabled={bidding || buyingNow}
                      onClick={onBuyNow}
                      className="serko-btn-iridescent h-12 px-5 inline-flex items-center justify-center gap-1.5 text-sm font-semibold shrink-0 disabled:opacity-50"
                    >
                      <HoverBoltZapIcon className="w-4 h-4" />
                      {buyingNow ? 'Đang chốt...' : 'Mua ngay'}
                    </button>
                  )}
                </form>

                <p className="text-xs text-[#666b75] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#004680]" />
                  Mức đặt hợp lệ tiếp theo từ{' '}
                  <strong className="font-mono text-[#17181c]">{formatVND(minValidBid)}</strong>
                  {activeItem.buyNowPrice > 0 && (
                    <span> · Hoặc chốt ngay với <strong className="font-mono text-[#17181c]">{formatVND(activeItem.buyNowPrice)}</strong></span>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


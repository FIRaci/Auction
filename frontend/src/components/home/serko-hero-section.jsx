import React from 'react';
import { motion } from 'motion/react';
import { Check, Search } from 'lucide-react';
import { formatVND } from '../../config/api';
import { SerkoGlobeCanvas } from '../motion/serko-globe-canvas';
import { SerkoPartnerMarquee } from '../motion/serko-partner-marquee';
import { KineticOdometer } from '../motion/kinetic-odometer-price';
import { ProductImageViewer } from '../common/product-image-viewer';
import {
  HoverArrowUpRightIcon,
  HoverGavelIcon,
  HoverRadarLiveIcon,
  HoverBoltZapIcon,
} from '../icons/itshover-animated-icons';

/**
 * Full-bleed Serko.ai hero section (.hero1_wrap .u-gradient-bg-1)
 * with 3D dotted globe backdrop, centered typography, and floating 4-card live lot cluster.
 */
export function SerkoHeroSection({ activeLiveRoom, spotItem, onEnterRoom, onNavigate }) {
  const displayItem = spotItem || activeLiveRoom?.activeItem;
  const currentPrice = displayItem?.currentPrice || displayItem?.startingPrice || 185100000;
  const buyNowPrice = displayItem?.buyNowPrice || 420000000;

  return (
    <section className="serko-hero-gradient relative overflow-hidden pt-10 sm:pt-14 pb-0">
      {/* Interactive 3D Dotted Globe Background */}
      <div className="absolute inset-x-0 top-36 sm:top-28 h-[540px] sm:h-[640px] pointer-events-none opacity-80">
        <SerkoGlobeCanvas />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Centered Header Block */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto flex flex-col items-center"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/75 backdrop-blur-md border border-black/[0.06] text-xs font-semibold text-[#4b4f57] shadow-sm mb-5">
            <span className="w-2 h-2 rounded-full bg-[#1b9e52] animate-pulse" />
            <span>Sàn Đấu Giá Trực Tuyến Thời Gian Thực</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-[3.75rem] font-bold tracking-[-0.015em] !leading-[1.26] text-[#17181c] mb-6">
            Sàn đấu giá <span className="serko-accent-text">minh bạch</span> bạn từng trải nghiệm.
          </h1>

          <p className="text-base sm:text-lg text-[#4b4f57] leading-[1.7] max-w-2xl mb-9">
            Thực thi nghiêm ngặt nguyên tắc <strong className="text-[#17181c]">01 người / 01 phòng</strong>,
            hàng đợi FIFO tự động, bước giá tối thiểu{' '}
            <span className="font-mono font-semibold text-[#17181c]">10.000 ₫</span> và cơ chế chốt búa 3 lần sau 3 phút.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {activeLiveRoom ? (
              <button
                type="button"
                onClick={() => onEnterRoom(activeLiveRoom.id)}
                className="serko-btn-primary px-6 py-3 text-sm gap-2 shadow-md"
              >
                <HoverRadarLiveIcon className="w-4 h-4 text-[#1b9e52]" />
                <span>Vào Phiên Live Ngay</span>
                <HoverArrowUpRightIcon className="w-4 h-4" />
              </button>
            ) : (
              <a href="#rooms-catalog" className="serko-btn-primary px-6 py-3 text-sm gap-2 shadow-md">
                <span>Khám Phá Phiên Live</span>
                <HoverArrowUpRightIcon className="w-4 h-4" />
              </a>
            )}

            <button
              type="button"
              onClick={() => onNavigate('terms')}
              className="serko-btn-secondary px-6 py-3 text-sm"
            >
              Quy Chế & Pháp Lý
            </button>
          </div>
        </motion.div>

        {/* Serko Floating Multi-Card Live Cluster (.hero1_profile_wrap) */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          className="mt-14 sm:mt-20 pb-12 max-w-4xl mx-auto"
        >
          {/* Card 1: Top Choice Pill (.hero1_profile_choice_wrap) */}
          <div className="bg-white rounded-2xl px-4 py-3 border border-black/[0.06] shadow-serko-card flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex flex-wrap items-center gap-2.5 text-xs sm:text-sm font-medium text-[#17181c]">
              <span className="w-6 h-6 rounded-full bg-[#e2f8ea] text-[#1b9e52] flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
              </span>
              <span className="font-semibold">
                {activeLiveRoom?.code || 'SERKO-LUX-01'}
              </span>
              <span className="text-[#8a8d96]">·</span>
              <span className="text-[#4b4f57] truncate max-w-[260px] sm:max-w-md">
                {activeLiveRoom?.title || 'Geneva & Flagship Collector'}
              </span>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <span className="px-2.5 py-1 rounded-full bg-[#e8f3fe] text-[#0078d4] text-[11px] font-semibold">
                {displayItem?.category || 'Đồng Hồ Thụy Sĩ'}
              </span>
              {activeLiveRoom && (
                <button
                  type="button"
                  onClick={() => onEnterRoom(activeLiveRoom.id)}
                  className="w-8 h-8 rounded-full bg-[#f6f6f6] hover:bg-[#17181c] hover:text-white border border-black/[0.06] flex items-center justify-center transition-colors cursor-pointer"
                  title="Vào phòng đấu giá"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* 3-Card Bento Cluster */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
            {/* Collector Profile Card (.hero1_profile_item) */}
            <div className="md:col-span-4 bg-[#f6f6f6] rounded-[20px] p-4 border border-black/[0.06] shadow-serko-card flex flex-col justify-between">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
                    alt="Trần Minh Quân"
                    className="w-12 h-12 rounded-2xl object-cover border border-black/10 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-[#17181c] truncate">
                      Trần Minh Quân
                    </div>
                    <div className="text-xs text-[#4b4f57] truncate">
                      Nhà Sưu Tầm • Verified
                    </div>
                  </div>
                </div>
                <div className="relative w-8 h-8 rounded-lg bg-white border border-black/[0.06] flex items-center justify-center shrink-0">
                  <HoverGavelIcon className="w-4 h-4 text-[#17181c]" />
                  <span className="w-2 h-2 rounded-full bg-[#158142] absolute -top-0.5 -right-0.5" />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-black/[0.06] flex items-center justify-between text-xs">
                <span className="text-[#4b4f57]">Khóa hiện diện</span>
                <span className="font-mono font-semibold text-[#146b3a] bg-[#e2f8ea] px-2 py-0.5 rounded-full">
                  01 Người / 01 Phòng
                </span>
              </div>
            </div>

            {/* Live Bid Telemetry Card (.hero1_profile_route_wrap) */}
            <div className="md:col-span-4 bg-white rounded-[20px] p-4 border border-black/[0.06] shadow-serko-card flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-[#4b4f57]">
                <span className="font-mono font-semibold text-[#17181c]">
                  LÔ #{displayItem?.queueOrder || 1} / {activeLiveRoom?.totalItems || 4}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#e8f3fe] text-[#0078d4] font-mono font-semibold">
                  +10.000 ₫ min
                </span>
              </div>

              <div className="my-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#8a8d96]">
                  Giá Dẫn Đầu Hiện Tại
                </div>
                <div className="text-2xl font-bold text-[#17181c] tracking-tight mt-0.5">
                  <KineticOdometer value={formatVND(currentPrice)} />
                </div>
              </div>

              <div className="pt-2.5 border-t border-[#ededf0] flex items-center justify-between text-[11px] font-medium text-[#4b4f57]">
                <span>Chu kỳ: 3 phút</span>
                <span>3 hồi × 30 giây</span>
              </div>
            </div>

            {/* Featured Product & Instant Entry Card (.hero1_profile_hotel_wrap) */}
            <div className="md:col-span-4 bg-white rounded-[20px] p-4 border border-black/[0.06] shadow-serko-card flex flex-col justify-between group">
              <div className="flex items-start gap-3">
                <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-[#e9e9ec]">
                  <ProductImageViewer
                    src={displayItem?.imageUrl}
                    alt={displayItem?.title || 'Patek Philippe Nautilus'}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#e2f8ea] text-[#146b3a] text-[10px] font-bold mb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1b9e52]" />
                    <span>ĐANG MỞ BÁN LIVE</span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-[#17181c] line-clamp-2 leading-snug">
                    {displayItem?.title || 'Patek Philippe Nautilus Ref. 5711/1A-010'}
                  </h3>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-[#ededf0] flex items-center justify-between gap-2">
                <div>
                  <div className="text-[10px] font-semibold tracking-[0.05em] uppercase text-[#8a8d96] flex items-center gap-1">
                    <HoverBoltZapIcon className="w-3 h-3 text-[#ff635c]" />
                    <span>Giá chốt</span>
                  </div>
                  <div className="text-xs font-mono font-bold text-[#17181c]">
                    {displayItem?.buyNowPrice > 0
                      ? formatVND(displayItem.buyNowPrice)
                      : displayItem
                        ? 'Tùy chọn'
                        : formatVND(buyNowPrice)}
                  </div>
                </div>
                {activeLiveRoom && (
                  <button
                    type="button"
                    onClick={() => onEnterRoom(activeLiveRoom.id)}
                    className="serko-btn-primary px-3.5 py-2 text-xs gap-1"
                  >
                    <span>Đặt Giá</span>
                    <HoverArrowUpRightIcon className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Partner Marquee */}
      <SerkoPartnerMarquee />
    </section>
  );
}

export default SerkoHeroSection;


import React from 'react';
import { RoyalBrandMark, HoverArrowUpRightIcon } from '../icons/itshover-animated-icons';

export function SerkoEditorialFooter({ onNavigate, onOpenAuthModal }) {
  return (
    <footer className="bg-white text-[#17181c] pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <hr className="serko-dotted-divider mb-16" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start pb-14 border-b border-[#ededf0]">
          {/* Left Editorial Headline (Serko Footer Left) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center gap-2.5">
              <RoyalBrandMark className="w-9 h-9 shrink-0 shadow-sm" />
              <span className="font-display font-bold text-lg tracking-[-0.03em] text-[#17181c] leading-none">
                RoyalAuction<span className="serko-accent-text font-extrabold">.</span>
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-[-0.015em] !leading-[1.34] text-[#17181c]">
              Hiện diện ở những khoảnh khắc{' '}
              <span className="serko-accent-text">gõ búa định giá kiệt tác.</span>
            </h2>

            <p className="text-sm text-[#4b4f57] leading-relaxed max-w-md">
              Nền tảng đấu giá trực tuyến thời gian thực tuân thủ Luật Đấu giá tài sản
              01/2016/QH14: minh bạch bước giá 10.000 VNĐ, hàng đợi FIFO và chốt búa tự động.
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onNavigate('home')}
                className="serko-btn-primary px-5 py-2.5 text-xs gap-1.5"
              >
                <span>Khám Phá Phiên Live</span>
                <HoverArrowUpRightIcon className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="serko-btn-secondary px-5 py-2.5 text-xs"
              >
                Đăng Nhập Thành Viên
              </button>
            </div>
          </div>

          {/* Right Link Columns */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8 lg:pt-2">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-[#8a8d96] mb-4">
                Khám Phá
              </h3>
              <ul className="space-y-3 text-sm font-medium text-[#4b4f57]">
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate('home')}
                    className="hover:text-[#17181c] transition-colors cursor-pointer"
                  >
                    Các Phòng Đấu Giá
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate('terms')}
                    className="hover:text-[#17181c] transition-colors cursor-pointer"
                  >
                    Cơ Chế Hàng Đợi FIFO
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate('terms')}
                    className="hover:text-[#17181c] transition-colors cursor-pointer"
                  >
                    Chu Kỳ 3 Phút + 3×30s
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-[#8a8d96] mb-4">
                Pháp Lý & Quy Chế
              </h3>
              <ul className="space-y-3 text-sm font-medium text-[#4b4f57]">
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate('terms')}
                    className="hover:text-[#17181c] transition-colors cursor-pointer"
                  >
                    Quyền & Nghĩa Vụ Bidder
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate('terms')}
                    className="hover:text-[#17181c] transition-colors cursor-pointer"
                  >
                    Quy Định Người Đăng Bán
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate('terms')}
                    className="hover:text-[#17181c] transition-colors cursor-pointer"
                  >
                    Ràng Buộc 01 Người / Phòng
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-[#8a8d96] mb-4">
                Hạ Tầng Kỹ Thuật
              </h3>
              <ul className="space-y-3 text-xs font-mono text-[#4b4f57]">
                <li>Socket.IO Realtime Engine</li>
                <li>Prisma Atomic Ledger</li>
                <li>JWT Presence Lock</li>
                <li>Le Auctions Standard</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8a8d96]">
          <span>© {new Date().getFullYear()} RoyalAuction Platform. Thiết kế lấy cảm hứng từ Serko.ai.</span>
          <span className="font-medium">Tuân thủ Luật Đấu Giá Tài Sản 01/2016/QH14</span>
        </div>
      </div>
    </footer>
  );
}

export default SerkoEditorialFooter;


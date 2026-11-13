import React, { useEffect, useState } from 'react';
import { LogOut, Plus, Store, SlidersHorizontal, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatVND } from '../../config/api';
import {
  RoyalBrandMark,
  HoverArrowUpRightIcon,
  HoverWalletBalanceIcon,
  HoverRadarLiveIcon,
} from '../icons/itshover-animated-icons';

/**
 * Scroll-morphing navigation header modeled on Serko.ai (.nav1_component).
 * Transitions cleanly from full width to a compact frosted glass pill on scroll.
 */
export function SerkoScrollNavbar({
  currentPage,
  onNavigate,
  onOpenAuthModal,
  onOpenSellModal,
  onOpenCreateRoomModal,
}) {
  const { user, logout, isAdmin, currentRoom } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 24);
    }
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  function navigateTo(page, roomId = null) {
    setMobileMenuOpen(false);
    onNavigate(page, roomId);
  }

  return (
    <header className="sticky top-0 z-50 w-full px-3 sm:px-6 pt-3 pb-2">
      <div
        className={`mx-auto transition-all duration-500 ease-[cubic-bezier(0.525,0,0,1)] flex items-center justify-between gap-3 ${
          scrolled
            ? 'max-w-[58rem] px-3 sm:px-4 py-2 rounded-2xl bg-white/80 backdrop-blur-xl border border-black/[0.07] shadow-serko-nav'
            : 'max-w-[78rem] px-2 sm:px-4 py-2.5 rounded-2xl bg-transparent border border-transparent'
        }`}
      >
        {/* Left: Brand Wordmark */}
        <button
          type="button"
          onClick={() => navigateTo('home')}
          className="flex items-center gap-2.5 text-left group cursor-pointer shrink-0"
        >
          <RoyalBrandMark className="w-9 h-9 shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-200" />
          <span className="font-display font-bold text-[17px] sm:text-[18px] tracking-[-0.03em] text-[#17181c] leading-none">
            RoyalAuction<span className="serko-accent-text font-extrabold">.</span>
          </span>
        </button>

        {/* Center: Pill Navigation */}
        <nav className="hidden md:flex items-center gap-1 p-1 rounded-full bg-white/75 backdrop-blur-md border border-[#e9e9ec] shadow-sm">
          <button
            type="button"
            onClick={() => navigateTo('home')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              currentPage === 'home'
                ? 'bg-[#17181c] text-white shadow-sm'
                : 'text-[#4b4f57] hover:text-[#17181c] hover:bg-[#f6f6f6]'
            }`}
          >
            Sàn Đấu Giá
          </button>

          <button
            type="button"
            onClick={() => navigateTo('terms')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              currentPage === 'terms'
                ? 'bg-[#17181c] text-white shadow-sm'
                : 'text-[#4b4f57] hover:text-[#17181c] hover:bg-[#f6f6f6]'
            }`}
          >
            Quy Chế & Pháp Lý
          </button>

          {isAdmin && (
            <button
              type="button"
              onClick={() => navigateTo('admin')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                currentPage === 'admin'
                  ? 'bg-[#0078d4] text-white shadow-sm'
                  : 'text-[#0078d4] hover:bg-[#e8f3fe]'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Điều Hành Admin</span>
            </button>
          )}
        </nav>

        {/* Right: User Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {currentRoom && (
            <button
              type="button"
              onClick={() => navigateTo('room', currentRoom.id)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#e2f8ea] border border-[#c7f0d7] text-[#146b3a] text-xs font-semibold cursor-pointer hover:bg-[#d3f4df] transition-colors"
              title="Đang hiện diện tại phòng này (Ràng buộc 1 người / 1 phòng)"
            >
              <HoverRadarLiveIcon className="w-3.5 h-3.5 text-[#1b9e52]" />
              <span className="font-mono font-bold">{currentRoom.code}</span>
            </button>
          )}

          {user ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenCreateRoomModal}
                className="hidden lg:inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/80 hover:bg-white border border-[#e9e9ec] text-[#17181c] text-xs font-semibold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tạo Phòng</span>
              </button>

              <button
                type="button"
                onClick={onOpenSellModal}
                className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 hover:bg-white border border-[#e9e9ec] text-[#17181c] text-xs font-semibold transition-colors cursor-pointer"
              >
                <Store className="w-3.5 h-3.5 text-[#1b98f2]" />
                <span>Đăng Bán</span>
              </button>

              <div className="flex items-center gap-2 pl-3 pr-1.5 py-1 rounded-full bg-white border border-[#e9e9ec] shadow-sm">
                <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono font-semibold text-[#17181c]">
                  <HoverWalletBalanceIcon className="w-3.5 h-3.5 text-[#1b9e52]" />
                  <span>{formatVND(user.balance)}</span>
                </div>
                <div className="w-7 h-7 rounded-full bg-[#17181c] text-white text-xs font-bold flex items-center justify-center">
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="p-1.5 rounded-full text-[#8a8d96] hover:text-[#f13931] hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Đăng xuất"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="serko-btn-primary px-4 py-2 text-xs gap-1.5"
            >
              <span>Đăng Nhập</span>
              <HoverArrowUpRightIcon className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Mobile Burger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="md:hidden w-9 h-9 rounded-full bg-white border border-[#e9e9ec] flex items-center justify-center text-[#17181c] cursor-pointer"
            aria-label="Mở menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 mx-auto max-w-md rounded-3xl bg-white border border-[#e9e9ec] shadow-serko-float p-4 space-y-2">
          <button
            type="button"
            onClick={() => navigateTo('home')}
            className="w-full text-left px-4 py-2.5 rounded-2xl text-sm font-semibold text-[#17181c] hover:bg-[#f6f6f6]"
          >
            Sàn Đấu Giá
          </button>
          <button
            type="button"
            onClick={() => navigateTo('terms')}
            className="w-full text-left px-4 py-2.5 rounded-2xl text-sm font-semibold text-[#17181c] hover:bg-[#f6f6f6]"
          >
            Quy Chế & Pháp Lý
          </button>
          {isAdmin && (
            <button
              type="button"
              onClick={() => navigateTo('admin')}
              className="w-full text-left px-4 py-2.5 rounded-2xl text-sm font-semibold text-[#0078d4] hover:bg-[#e8f3fe]"
            >
              Bàn Điều Hành Admin
            </button>
          )}
          {user && (
            <div className="pt-2 border-t border-[#ededf0] flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenCreateRoomModal();
                }}
                className="flex-1 py-2.5 rounded-2xl bg-[#f6f6f6] text-xs font-semibold text-[#17181c]"
              >
                + Tạo Phòng
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenSellModal();
                }}
                className="flex-1 py-2.5 rounded-2xl bg-[#f6f6f6] text-xs font-semibold text-[#17181c]"
              >
                + Đăng Bán
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

export default SerkoScrollNavbar;


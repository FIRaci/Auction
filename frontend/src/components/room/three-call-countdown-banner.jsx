import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Clock, Zap } from 'lucide-react';
import { formatVND } from '../../config/api';
import { HoverBellAlertIcon, HoverRadarLiveIcon } from '../icons/itshover-animated-icons';

function formatSeconds(sec) {
  const s = Math.max(0, Math.ceil(sec));
  const mins = Math.floor(s / 60);
  const rem = s % 60;
  if (mins > 0) {
    return `${mins}:${String(rem).padStart(2, '0')}`;
  }
  return `${rem}s`;
}

export function ThreeCallCountdownBanner({
  callStage = 0,
  callDeadline = null,
  idleDeadline = null,
  demoMode = false,
  activeItem = null,
  leaderName = null,
}) {
  const [remainingSec, setRemainingSec] = useState(0);
  const totalSecRef = useRef(30);

  const activeDeadline = callStage > 0 ? callDeadline : idleDeadline;

  useEffect(() => {
    if (!activeDeadline) {
      setRemainingSec(0);
      return undefined;
    }

    const targetMs = new Date(activeDeadline).getTime();
    const initialDiff = Math.max(1, (targetMs - Date.now()) / 1000);
    totalSecRef.current = initialDiff;

    const update = () => {
      const diff = Math.max(0, (targetMs - Date.now()) / 1000);
      setRemainingSec(diff);
    };

    update();
    const id = setInterval(update, 200);
    return () => clearInterval(id);
  }, [activeDeadline, callStage]);

  if (!activeItem) {
    return null;
  }

  const stageMeta = {
    1: {
      badge: 'LẦN GỌI 1 / 3',
      title: 'GỌI GIÁ LẦN THỨ NHẤT — CÒN AI TRẢ CAO HƠN KHÔNG?',
      ringColor: '#f59e0b',
      bgClass: 'bg-amber-50/90 border-amber-200 text-amber-950',
      pillClass: 'bg-amber-100 text-amber-800 border-amber-200',
    },
    2: {
      badge: 'LẦN GỌI 2 / 3',
      title: 'GỌI GIÁ LẦN THỨ HAI — CHUẨN BỊ CHỐT PHIÊN',
      ringColor: '#ea580c',
      bgClass: 'bg-orange-50/95 border-orange-200 text-orange-950',
      pillClass: 'bg-orange-100 text-orange-800 border-orange-200',
    },
    3: {
      badge: 'LẦN GỌI CUỐI 3 / 3',
      title: 'GỌI GIÁ LẦN CUỐI — SẮP GÕ BÚA CHỐT ĐƠN!',
      ringColor: '#dc2626',
      bgClass: 'bg-red-50 border-red-200 text-red-950',
      pillClass: 'bg-red-100 text-red-700 border-red-200',
    },
  };

  if (callStage >= 1 && callStage <= 3) {
    const meta = stageMeta[callStage];
    const progress = totalSecRef.current > 0 ? Math.min(1, remainingSec / totalSecRef.current) : 0;
    const radius = 22;
    const circumference = 2 * Math.PI * radius;
    const dashOffset = circumference * (1 - progress);

    return (
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl border p-4 sm:p-5 shadow-sm transition-colors ${meta.bgClass}`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
              <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                <circle
                  cx="28"
                  cy="28"
                  r={radius}
                  fill="none"
                  stroke="rgba(0,0,0,0.08)"
                  strokeWidth="4"
                />
                <circle
                  cx="28"
                  cy="28"
                  r={radius}
                  fill="none"
                  stroke={meta.ringColor}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  style={{ transition: 'stroke-dashoffset 0.2s linear' }}
                />
              </svg>
              <span className="absolute font-mono text-sm font-bold tabular-nums">
                {Math.ceil(remainingSec)}s
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${meta.pillClass}`}>
                  <HoverBellAlertIcon className="w-3.5 h-3.5" />
                  {meta.badge}
                </span>
                {demoMode && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-800 border border-sky-200">
                    <Zap className="w-3 h-3" />
                    Tua nhanh Demo
                  </span>
                )}
              </div>
              <p className="text-sm sm:text-base font-semibold tracking-tight">{meta.title}</p>
              <p className="text-xs sm:text-sm opacity-80">
                Mức giá hiện tại:{' '}
                <strong className="font-mono">{formatVND(activeItem.currentPrice)}</strong>
                {leaderName ? (
                  <span> — Đang dẫn đầu: <strong>{leaderName}</strong></span>
                ) : (
                  <span> — Chưa có người trả giá</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
            {[1, 2, 3].map((step) => (
              <span
                key={step}
                className={`h-2.5 rounded-full transition-all ${
                  step <= callStage ? 'w-7 bg-current opacity-85' : 'w-2.5 bg-current opacity-20'
                }`}
              />
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#e5e7eb] bg-white px-4 py-3.5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#e2f8ea] text-[#1b9e52]">
          <HoverRadarLiveIcon className="w-3.5 h-3.5" />
          Đang nhận trả giá
        </span>
        <span className="text-sm text-[#4a4f59]">
          Phiên tự động chuyển sang 3 lần gọi chốt nếu không có giá mới
        </span>
      </div>

      <div className="flex items-center gap-2.5">
        {demoMode && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#e8f3fe] text-[#004680]">
            <Zap className="w-3.5 h-3.5" />
            Demo Speed
          </span>
        )}
        {idleDeadline && remainingSec > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-[#f6f6f6] text-[#17181c] tabular-nums">
            <Clock className="w-3.5 h-3.5 text-[#4a4f59]" />
            Chờ kích hoạt gọi: {formatSeconds(remainingSec)}
          </span>
        )}
      </div>
    </div>
  );
}


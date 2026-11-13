import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, Send, Check } from 'lucide-react';
import { HoverSparklesAiIcon } from '../icons/itshover-animated-icons';

const SCENARIOS = [
  {
    id: 'bid',
    tabLabel: '1. Đặt giá +10.000 ₫',
    query: 'Đặt giá Patek 5711 lên 185.110.000 ₫',
    aiReply: 'Đã xác thực bước giá tối thiểu +10.000 ₫ và khóa vị trí duy nhất tại phòng SERKO-LUX-01.',
    benefitEyebrow: 'Khóa 01 người / 01 phòng đang bật',
    benefitTitle: 'Hợp lệ · Bước giá +10.000 VNĐ',
    ctaLabel: 'Đồng bộ qua Socket.IO',
    routeFrom: '185.100.000 ₫',
    routeTo: '185.110.000 ₫',
    line1Label: 'Chủ sở hữu dẫn đầu',
    line1Value: 'Trần Minh Quân',
    line2Label: 'Chu kỳ đếm tiếp theo',
    line2Value: '3 phút + 3×30s',
    bannerLabel: 'Phát sóng realtime toàn phòng',
    bannerAmt: '185.110.000 ₫',
  },
  {
    id: 'countdown',
    tabLabel: '2. Đếm 3 lần × 30s',
    query: 'Kiểm tra trạng thái đếm ngược Lô #01',
    aiReply: 'Đã hết 3 phút không có lệnh trả cao hơn. Hệ thống đang phát thông báo 3 hồi liên tiếp.',
    benefitEyebrow: 'Quy chế chốt búa tự động',
    benefitTitle: 'Lần 1 (30s) → Lần 2 (30s) → Lần 3',
    ctaLabel: 'Gõ búa chốt kết quả',
    routeFrom: 'Lần gọi #3',
    routeTo: 'Gõ búa (Hammer)',
    line1Label: 'Người trúng đấu giá',
    line1Value: 'Nguyễn Đăng Khoa',
    line2Label: 'Hàng đợi FIFO kế tiếp',
    line2Value: 'Rolex Daytona #02',
    bannerLabel: 'Đã chốt búa thành công',
    bannerAmt: '185.110.000 ₫',
  },
  {
    id: 'buynow',
    tabLabel: '3. Giá Chốt (Tùy chọn)',
    query: 'Chốt giá Patek Nautilus ở mức 420.000.000 ₫',
    aiReply: 'Xác nhận Chốt Giá thành công! Toàn bộ bộ đếm phiên được hủy lập tức và kích hoạt Lô #02.',
    benefitEyebrow: 'Ưu tiên chốt sở hữu tức thì',
    benefitTitle: 'Khớp Giá chốt không cần chờ',
    ctaLabel: 'Hoàn tất bàn giao lô',
    routeFrom: 'Trạng thái BIDDING',
    routeTo: 'CHỐT GIÁ (SOLD)',
    line1Label: 'Chủ sở hữu mới',
    line1Value: 'Lê Hoàng Yến',
    line2Label: 'Lô kế tiếp mở sàn',
    line2Value: 'Rolex 116500LN',
    bannerLabel: 'Chốt giá ngay thành công',
    bannerAmt: '420.000.000 ₫',
  },
];

const BUBBLE_EASE = [0.22, 1.15, 0.36, 1];

/**
 * Self-playing choreographed UI showcase modeled directly on Serko.ai's .aa-card
 * and Prompt-Motion's state-machine motion reel.
 */
export function SerkoAuctionAgentShowcase() {
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(true);
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [phase, setPhase] = useState('typing'); // typing | user | ai | benefit | result
  const [typedText, setTypedText] = useState('');
  const [runKey, setRunKey] = useState(0);

  const scenario = SCENARIOS[scenarioIdx];

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const obs = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return undefined;
    let cancelled = false;
    const timers = [];

    setPhase('typing');
    setTypedText('');

    const full = scenario.query;
    let i = 0;

    function stepType() {
      if (cancelled) return;
      i = Math.min(full.length, i + 2);
      setTypedText(full.slice(0, i));
      if (i < full.length) {
        timers.push(setTimeout(stepType, 42));
      } else {
        timers.push(setTimeout(() => !cancelled && setPhase('user'), 450));
        timers.push(setTimeout(() => !cancelled && setPhase('ai'), 1150));
        timers.push(setTimeout(() => !cancelled && setPhase('benefit'), 1950));
        timers.push(setTimeout(() => !cancelled && setPhase('result'), 3450));
        timers.push(
          setTimeout(() => {
            if (!cancelled) {
              setScenarioIdx((prev) => (prev + 1) % SCENARIOS.length);
            }
          }, 6800)
        );
      }
    }

    timers.push(setTimeout(stepType, 350));

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [isVisible, scenarioIdx, runKey, scenario.query]);

  function selectScenario(idx) {
    setScenarioIdx(idx);
    setRunKey((k) => k + 1);
  }

  return (
    <div ref={containerRef} className="serko-visual-frame rounded-[2rem] p-5 sm:p-8 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Interactive Scenario Selector Pills (Prompt-Motion style) */}
      <div className="w-full max-w-[420px] flex flex-wrap items-center justify-between gap-1.5 mb-4">
        <div className="flex flex-wrap gap-1.5">
          {SCENARIOS.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              onClick={() => selectScenario(idx)}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                idx === scenarioIdx
                  ? 'bg-[#17181c] text-white shadow-sm'
                  : 'bg-white/75 text-[#17181c] hover:bg-white'
              }`}
            >
              {item.tabLabel}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setRunKey((k) => k + 1)}
          className="w-7 h-7 rounded-full bg-white/80 hover:bg-white text-[#17181c] flex items-center justify-center shadow-sm cursor-pointer"
          title="Phát lại hoạt cảnh"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Serko .aa-card */}
      <div className="w-full max-w-[420px] min-h-[430px] bg-white rounded-[22px] p-6 border border-[#e9e9ec] shadow-serko-float flex flex-col justify-between text-[#17181c]">
        {/* Top Row: Bot icon + thread */}
        <div className="flex gap-3 flex-1">
          <div className="w-8 h-8 rounded-full bg-[#e8f3fe] text-[#1b98f2] flex items-center justify-center shrink-0 mt-0.5">
            <HoverSparklesAiIcon className="w-4 h-4" />
          </div>

          <div className="flex-1 min-w-0 flex flex-col">
            <AnimatePresence mode="wait">
              {phase !== 'result' ? (
                <motion.div
                  key={`chat-${scenario.id}-${runKey}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col"
                >
                  {/* User Bubble */}
                  {['user', 'ai', 'benefit'].includes(phase) && (
                    <motion.div
                      initial={{ opacity: 0, y: 14, scale: 0.94 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.45, ease: BUBBLE_EASE }}
                      className="self-end bg-[#f1f1f3] text-[#17181c] text-[13px] leading-snug px-3.5 py-2.5 rounded-[14px] max-w-[92%] mb-5 font-medium"
                    >
                      {scenario.query}
                    </motion.div>
                  )}

                  {/* AI Reply */}
                  {['ai', 'benefit'].includes(phase) && (
                    <motion.p
                      initial={{ opacity: 0, y: 14, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.45, ease: BUBBLE_EASE }}
                      className="text-[13.5px] leading-relaxed text-[#17181c] mb-3.5"
                    >
                      {scenario.aiReply}
                    </motion.p>
                  )}

                  {/* Green Benefit Card (.aa-benefit) */}
                  {phase === 'benefit' && (
                    <motion.div
                      initial={{ opacity: 0, y: 16, scale: 0.94 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.5, ease: BUBBLE_EASE }}
                      className="space-y-3"
                    >
                      <div className="flex items-start gap-2.5 p-3.5 rounded-[14px] bg-[#e2f8ea] border border-[#c7f0d7]">
                        <span className="w-5 h-5 rounded-full border border-[#1b9e52] text-[#1b9e52] flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3" strokeWidth={2.5} />
                        </span>
                        <div className="min-w-0">
                          <div className="text-[11px] font-medium text-[#146b3a]">
                            {scenario.benefitEyebrow}
                          </div>
                          <div className="text-[14.5px] font-bold text-[#1b9e52] tracking-tight">
                            {scenario.benefitTitle}
                          </div>
                        </div>
                      </div>

                      <div className="inline-flex items-center px-4 py-2.5 rounded-full bg-[#17181c] text-white text-[12.5px] font-medium">
                        {scenario.ctaLabel}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key={`result-${scenario.id}-${runKey}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.4, ease: BUBBLE_EASE }}
                  className="space-y-2.5 pt-1"
                >
                  {/* Structured Result Card (.aa-booking) */}
                  <div className="border border-[#e9e9ec] rounded-[18px] p-4 bg-white">
                    <div className="text-[13px] font-semibold text-[#17181c] flex items-center flex-wrap gap-1.5 pb-3 border-b border-[#ededf0]">
                      <span className="font-mono">{scenario.routeFrom}</span>
                      <span className="text-[#8a8d96]">→</span>
                      <span className="font-mono text-[#1b9e52]">{scenario.routeTo}</span>
                    </div>

                    <div className="pt-3 space-y-2 text-[12.5px]">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[#4b4f57]">{scenario.line1Label}</span>
                        <span className="font-semibold text-[#17181c]">{scenario.line1Value}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[#4b4f57]">{scenario.line2Label}</span>
                        <span className="font-mono text-xs font-medium text-[#17181c]">
                          {scenario.line2Value}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#ededf0]">
                        <span className="text-[#4b4f57]">Trạng thái xác thực</span>
                        <span className="aa-skeleton" />
                      </div>
                    </div>
                  </div>

                  {/* Green Confirmation Banner (.aa-banner) */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25, duration: 0.4, ease: BUBBLE_EASE }}
                    className="flex items-center justify-between gap-2 px-4 py-3 rounded-[16px] bg-[#e2f8ea] border border-[#c7f0d7]"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-[18px] h-[18px] rounded-full border-[1.6px] border-[#1b9e52] text-[#1b9e52] flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3" strokeWidth={2.5} />
                      </span>
                      <span className="text-[13px] font-medium text-[#17181c] truncate">
                        {scenario.bannerLabel}
                      </span>
                    </div>
                    <span className="text-[13px] font-mono font-bold text-[#1b9e52] shrink-0">
                      {scenario.bannerAmt}
                    </span>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom Composer Row (.aa-composer-row) */}
        <div className="flex items-center gap-2.5 pt-4 mt-4 border-t border-[#ededf0]">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#ddd0fb] to-[#b6a4f0] text-[#4a3b7a] font-semibold text-sm flex items-center justify-center shrink-0">
            Q
          </div>
          <div
            className={`flex-1 flex items-center gap-2 rounded-full px-3.5 py-2 border transition-colors ${
              phase === 'typing'
                ? 'bg-white border-[#d7d7dc]'
                : 'bg-[#f1f1f3] border-transparent'
            }`}
          >
            <span className="flex-1 text-[12.5px] text-[#17181c] truncate min-h-[18px] flex items-center">
              {phase === 'typing' ? (
                <>
                  <span>{typedText}</span>
                  <span className="inline-block w-[1.5px] h-3.5 bg-[#17181c] ml-0.5 animate-pulse" />
                </>
              ) : (
                <span className="text-[#8a8d96]">Nhập lệnh đấu giá hoặc hỏi quy chế...</span>
              )}
            </span>
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors shrink-0 ${
                phase === 'typing' && typedText.length >= scenario.query.length
                  ? 'bg-[#17181c] text-white'
                  : 'bg-[#e7e7ea] text-[#8a8d96]'
              }`}
            >
              <Send className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SerkoAuctionAgentShowcase;


import React, { useState } from 'react';
import { ChevronDown, ArrowRight, CheckCircle2 } from 'lucide-react';
import { SerkoAuctionAgentShowcase } from '../motion/serko-auction-agent-showcase';
import {
  HoverLockSingleRoomIcon,
  HoverBoltZapIcon,
  HoverBellAlertIcon,
  HoverLayersQueueIcon,
  HoverArrowUpRightIcon,
} from '../icons/itshover-animated-icons';

const COUNTDOWN_STAGES = [
  {
    step: 0,
    badge: 'ĐẶT GIÁ MỚI',
    title: 'Bước giá hợp lệ ≥ +10.000 VNĐ',
    desc: 'Lệnh đặt giá mới lập tức đặt lại đồng hồ chờ 3 phút và phát sóng tới toàn bộ thành viên trong phòng.',
    statusText: 'Đang theo dõi 3 phút (180s)',
    chipColor: 'bg-[#e8f3fe] text-[#0078d4]',
  },
  {
    step: 1,
    badge: 'THÔNG BÁO LẦN 1',
    title: 'Hết 3 phút không có giá cao hơn',
    desc: 'Máy chủ phát cảnh báo Lần thứ nhất (30 giây) trên toàn phòng để các nhà sưu tầm quyết định nâng giá.',
    statusText: 'Đếm ngược hồi chuông 1 (30s)',
    chipColor: 'bg-amber-50 text-amber-700',
  },
  {
    step: 2,
    badge: 'THÔNG BÁO LẦN 2',
    title: 'Cảnh báo lần hai sau 30 giây',
    desc: 'Nếu vẫn chưa có lệnh trả giá mới, hệ thống chuyển sang hồi chuông thứ hai.',
    statusText: 'Đếm ngược hồi chuông 2 (30s)',
    chipColor: 'bg-orange-50 text-orange-700',
  },
  {
    step: 3,
    badge: 'LẦN 3 · GÕ BÚA',
    title: 'Chốt người thắng & chuyển lô FIFO',
    desc: 'Kết thúc lần gọi thứ ba, búa gõ tự động chốt quyền sở hữu cho người trả giá cao nhất và đưa lô tiếp theo lên sàn.',
    statusText: 'GÕ BÚA CHỐT GIÁ & XOAY VÒNG FIFO',
    chipColor: 'bg-[#e2f8ea] text-[#146b3a]',
  },
];

const FAQ_ITEMS = [
  {
    q: 'Tại sao mỗi tài khoản chỉ được tham gia 01 phòng đấu giá tại một thời điểm?',
    a: 'Để đảm bảo tính tập trung, tránh tình trạng thao túng giá ảo đa phòng và bảo vệ thanh khoản thực của phiên. Khi bạn vào phòng mới, hệ thống tự động giải phóng vị trí ở phòng cũ.',
  },
  {
    q: 'Quy trình 3 phút và 3 lần thông báo 30 giây hoạt động ra sao?',
    a: 'Sau mỗi lệnh đặt giá hợp lệ (+ tối thiểu 10.000 VNĐ), nếu suốt 3 phút không có ai trả giá cao hơn, máy chủ sẽ phát thông báo 3 lần liên tiếp (mỗi lần cách nhau 30 giây). Kết thúc 3 lần mà không có giá mới, người trả cao nhất trúng đấu giá.',
  },
  {
    q: 'Giá chốt (tùy chọn) có hủy đấu giá ngay lập tức không?',
    a: 'Có. Nếu người ký gửi có thiết lập Giá chốt và một thành viên xác nhận Chốt giá ngay, vật phẩm lập tức chuyển sang trạng thái SOLD cho người mua đó, hủy mọi bộ đếm hiện tại và tự động kích hoạt vật phẩm kế tiếp trong hàng đợi FIFO.',
  },
  {
    q: 'Admin có những quyền điều phối nào trong phiên?',
    a: 'Quản trị viên có Bàn Điều Hành riêng để Mở/Đóng phiên, bật chế độ Demo Fast-Forward (10s chờ / 5s gọi), Gõ búa chốt giá sớm, Bỏ qua lô không có người mua và phân quyền thành viên.',
  },
];

export function SerkoFeatureSections({ activeLiveRoom, onEnterRoom, onNavigate }) {
  const [simStep, setSimStep] = useState(0);
  const [openFaq, setOpenFaq] = useState(0);

  const activeSim = COUNTDOWN_STAGES[simStep];

  return (
    <>
      {/* ============================================================
          FEATURE 1 (.feature1_wrap u-background-3 = #e8f3fe)
          ============================================================ */}
      <section className="bg-[#e8f3fe] py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy & Guarantees */}
            <div className="lg:col-span-6 space-y-6">
              <div className="text-xs font-semibold uppercase tracking-[0.08em] text-[#4b4f57] mb-1">
                Cơ chế kiểm soát thời gian thực
              </div>
              <h2 className="text-3xl sm:text-[2.75rem] font-bold tracking-[-0.015em] leading-[1.32] text-[#17181c]">
                Đấu giá chuẩn xác như có{' '}
                <span className="serko-accent-text">đấu giá viên riêng.</span>
              </h2>
              <p className="text-base text-[#4b4f57] leading-relaxed">
                Mọi lệnh đặt giá, khóa phòng duy nhất và giao dịch theo Giá chốt đều được kiểm chứng tức thì qua WebSocket, loại bỏ độ trễ và sai số thủ công.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-5 rounded-2xl bg-white/80 border border-[#cfe6fc]">
                  <div className="w-10 h-10 rounded-xl bg-[#e8f3fe] border-2 border-[#cfe6fc] flex items-center justify-center text-[#0078d4] mb-3">
                    <HoverLockSingleRoomIcon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-[#17181c] mb-1">
                    01 Người / 01 Phòng
                  </h3>
                  <p className="text-xs text-[#4b4f57] leading-relaxed">
                    Tự động rời phòng cũ khi chuyển phòng mới, bảo toàn danh sách hiện diện thật.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white/80 border border-[#cfe6fc]">
                  <div className="w-10 h-10 rounded-xl bg-[#e2f8ea] border-2 border-[#c7f0d7] flex items-center justify-center text-[#1b9e52] mb-3">
                    <HoverBoltZapIcon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-[#17181c] mb-1">
                    Giá Chốt Tức Thì (Tùy Chọn)
                  </h3>
                  <p className="text-xs text-[#4b4f57] leading-relaxed">
                    Nếu có thiết lập Giá chốt, người mua có thể chốt sở hữu ngay và xoay vòng sang lô FIFO tiếp theo.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Choreographed Serko Ask Anything Showcase */}
            <div className="lg:col-span-6">
              <SerkoAuctionAgentShowcase />
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          FEATURE 2 (.feature2_wrap inset ice glow + Interactive Stepper)
          ============================================================ */}
      <section className="serko-feature2-glow bg-white py-20 sm:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-5">
            <div className="text-xs font-semibold uppercase tracking-[0.08em] text-[#4b4f57]">
              Chu kỳ 3 phút + 3 lần thông báo & Hàng đợi FIFO
            </div>
            <h2 className="text-3xl sm:text-[2.75rem] font-bold tracking-[-0.015em] leading-[1.34] text-[#17181c]">
              Đồng hành từng nhịp gõ búa,
              <span className="serko-accent-text block mt-1">từ lô đầu đến lô cuối.</span>
            </h2>
            <p className="text-base sm:text-[17px] text-[#4b4f57] leading-[1.7] max-w-2xl mx-auto">
              Nhấp vào từng giai đoạn bên dưới để xem cách hệ thống đếm ngược 3 lần (30 giây/lần) và tự động kích hoạt lô kế tiếp trong hàng đợi FIFO.
            </p>
          </div>

          {/* Outer Serko Frame (rounded-[40px]) */}
          <div className="rounded-[36px] bg-[#f6f6f6] p-4 sm:p-8 border border-[#e9e9ec]">
            {/* Stepper Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
              {COUNTDOWN_STAGES.map((item) => (
                <button
                  key={item.step}
                  type="button"
                  onClick={() => setSimStep(item.step)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    simStep === item.step
                      ? 'bg-[#17181c] text-white shadow-sm'
                      : 'bg-white text-[#4b4f57] border border-[#e9e9ec] hover:text-[#17181c]'
                  }`}
                >
                  {item.badge}
                </button>
              ))}
            </div>

            {/* Inner Live Simulation Card (.feature2_card_main) */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e9e9ec] shadow-serko-card">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#ededf0]">
                <div className="space-y-2 max-w-xl">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold ${activeSim.chipColor}`}
                  >
                    <HoverBellAlertIcon className="w-3.5 h-3.5" />
                    {activeSim.statusText}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#17181c]">
                    {activeSim.title}
                  </h3>
                  <p className="text-sm text-[#4b4f57] leading-relaxed">{activeSim.desc}</p>
                </div>

                <button
                  type="button"
                  onClick={() => setSimStep((s) => (s + 1) % COUNTDOWN_STAGES.length)}
                  className="serko-btn-primary px-5 py-3 text-xs gap-2 shrink-0"
                >
                  <span>Bước Tiếp Theo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* FIFO Queue Preview Strip */}
              <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    lot: 'LÔ #01',
                    name: 'Patek Philippe Nautilus 5711/1A',
                    state: simStep === 3 ? 'SOLD · Đã chốt búa' : 'BIDDING · Đang lên sàn',
                    done: simStep === 3,
                    active: simStep < 3,
                  },
                  {
                    lot: 'LÔ #02',
                    name: 'Rolex Daytona 116500LN Panda',
                    state: simStep === 3 ? 'BIDDING · Tự động kích hoạt' : 'WAITING · Trong hàng đợi',
                    done: false,
                    active: simStep === 3,
                  },
                  {
                    lot: 'LÔ #03',
                    name: 'Leica M11 Monochrom + 50mm APO',
                    state: 'WAITING · Trong hàng đợi',
                    done: false,
                    active: false,
                  },
                ].map((row) => (
                  <div
                    key={row.lot}
                    className={`p-4 rounded-2xl border transition-all ${
                      row.active
                        ? 'bg-[#e8f3fe]/70 border-[#96cbfa]'
                        : row.done
                        ? 'bg-[#e2f8ea]/70 border-[#c7f0d7]'
                        : 'bg-[#f6f6f6] border-[#ededf0]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono font-bold text-[#4b4f57] mb-1">
                      <span>{row.lot}</span>
                      {row.done && <CheckCircle2 className="w-3.5 h-3.5 text-[#1b9e52]" />}
                    </div>
                    <div className="text-sm font-bold text-[#17181c] line-clamp-1 mb-1">
                      {row.name}
                    </div>
                    <div className="text-[11px] font-semibold text-[#4b4f57]">{row.state}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          CTA BANNER (.cta1_wrap + .serko-cta-gradient) & FAQ (.faq1_wrap)
          ============================================================ */}
      <section className="serko-cta-gradient py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="text-xs font-semibold uppercase tracking-[0.08em] text-[#4b4f57]">
            Sẵn sàng tham gia
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-[-0.015em] !leading-[1.3] text-[#17181c]">
            Bắt đầu phiên đấu giá của bạn ngay hôm nay.
          </h2>
          <p className="text-base text-[#4b4f57] max-w-xl mx-auto">
            Đăng nhập bằng tài khoản trải nghiệm 1-click, đăng bán vật phẩm vào hàng đợi FIFO hoặc theo dõi bảng điều hành thời gian thực.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {activeLiveRoom && (
              <button
                type="button"
                onClick={() => onEnterRoom(activeLiveRoom.id)}
                className="serko-btn-primary px-6 py-3 text-sm gap-2"
              >
                <span>Vào Phòng {activeLiveRoom.code}</span>
                <HoverArrowUpRightIcon className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => onNavigate('terms')}
              className="serko-btn-iridescent px-6 py-3 text-sm"
            >
              Xem Toàn Bộ Quy Chế
            </button>
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-5">
              <div className="text-xs font-semibold uppercase tracking-[0.08em] text-[#0078d4] mb-2">
                Hỏi Đáp Nhanh
              </div>
              <h2 className="text-3xl font-bold tracking-[-0.015em] leading-[1.3] text-[#17181c] mb-3">
                Câu hỏi thường gặp
              </h2>
              <p className="text-sm text-[#4b4f57] leading-relaxed">
                Tóm tắt các quy định cốt lõi về bước giá, cơ chế chốt búa 3 lần và quyền nghĩa vụ của các bên.
              </p>
            </div>

            <div className="md:col-span-7 space-y-3">
              {FAQ_ITEMS.map((item, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div key={item.q} className="w-full">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                      aria-expanded={isOpen}
                      className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all flex items-center justify-between gap-4 cursor-pointer ${
                        isOpen
                          ? 'bg-black/[0.04] border-transparent'
                          : 'bg-white border-black/[0.06] shadow-sm hover:border-black/15'
                      }`}
                    >
                      <span className="text-sm font-semibold text-[#17181c]">{item.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-[#4b4f57] shrink-0 transition-transform duration-300 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="mt-2 p-4 rounded-xl bg-black/[0.04] text-sm text-[#4b4f57] leading-relaxed">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default SerkoFeatureSections;


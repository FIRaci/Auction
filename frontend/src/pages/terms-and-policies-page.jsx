import React, { useMemo, useState } from 'react';
import { ArrowLeft, BookOpen, Search } from 'lucide-react';
import { HoverShieldCheckIcon } from '../components/icons/itshover-animated-icons';

const CHAPTERS = [
  {
    id: 'chuong-1',
    title: 'Chương I. Quy định chung & Phạm vi áp dụng',
    articles: [
      {
        code: 'Điều 1',
        heading: 'Nền tảng vận hành',
        body: 'RoyalAuction cung cấp hệ thống đấu giá trực tuyến thời gian thực áp dụng cho tài sản xa xỉ, đồng hồ sưu tầm, mỹ thuật và cổ vật đã qua kiểm định nguồn gốc. Mọi giao dịch tuân thủ Luật Đấu giá tài sản Việt Nam hiện hành.',
      },
      {
        code: 'Điều 2',
        heading: 'Xác thực hội viên',
        body: 'Người tham gia trả giá và ký gửi tài sản phải đăng ký tài khoản hợp lệ, xác thực số điện thoại liên hệ và bảo mật thông tin đăng nhập cá nhân.',
      },
    ],
  },
  {
    id: 'chuong-2',
    title: 'Chương II. Quy chế Khóa 1 Tài khoản - 1 Phòng đấu',
    articles: [
      {
        code: 'Điều 3',
        heading: 'Cơ chế chống thao túng phiên đồng thời',
        body: 'Tại một thời điểm, mỗi tài khoản hội viên chỉ được phép hiện diện và đặt giá bên trong duy nhất 01 (một) phòng đấu giá. Ràng buộc này được cưỡng chế đồng bộ ở tầng Cơ sở dữ liệu và Socket.IO nhằm ngăn chặn hành vi phân thân đẩy giá ảo.',
      },
      {
        code: 'Điều 4',
        heading: 'Chuyển đổi phòng đấu giá',
        body: 'Để tham gia phòng khác, hội viên cần bấm "Rời phòng" hoặc xác nhận "Rời phòng cũ & Vào phòng này" trên giao diện điều khiển để giải phóng khóa phiên.',
      },
    ],
  },
  {
    id: 'chuong-3',
    title: 'Chương III. Hàng đợi FIFO & Ký gửi vật phẩm',
    articles: [
      {
        code: 'Điều 5',
        heading: 'Thứ tự đưa vật phẩm lên sàn (First-In, First-Out)',
        body: 'Tài sản được thành viên hoặc Chủ tọa ký gửi vào một phòng sẽ tự động xếp số thứ tự nối tiếp. Khi lô hiện tại gõ búa (SOLD hoặc UNSOLD), hệ thống tự động kích hoạt lô kế tiếp trong hàng đợi.',
      },
      {
        code: 'Điều 6',
        heading: 'Bước giá tối thiểu & Giá mua ngay',
        body: 'Bước giá tối thiểu bắt buộc từ 10.000 VNĐ trở lên trên mỗi lần trả. Người ký gửi có thể thiết lập mức Giá mua ngay (Buy Now) cao hơn giá khởi điểm để người mua chốt sở hữu tức thì.',
      },
    ],
  },
  {
    id: 'chuong-4',
    title: 'Chương IV. Quy trình 3 phút chờ + 3 lần gọi 30 giây & Gõ búa',
    articles: [
      {
        code: 'Điều 7',
        heading: 'Đồng hồ đếm ngược 3 phút không có giá mới',
        body: 'Sau mỗi lượt trả giá hợp lệ, đồng hồ chờ mặc định đặt lại về 3 phút (180 giây). Nếu hết 3 phút không phát sinh mức giá cao hơn, hệ thống tự động chuyển sang giai đoạn Gọi giá chốt phiên.',
      },
      {
        code: 'Điều 8',
        heading: '3 lần gọi giá 30 giây & Quyền hủy đặt lại',
        body: 'Hệ thống phát thông báo Lần 1, Lần 2 và Lần 3, mỗi lần cách nhau 30 giây. Chỉ cần có một mức giá hợp lệ mới xuất hiện trong bất kỳ lần gọi nào, toàn bộ chu kỳ gọi lập tức hủy bỏ và quay về đồng hồ chờ 3 phút. Hết Lần 3 không có giá mới, búa sẽ gõ chốt đơn (SOLD) cho người dẫn đầu hoặc đánh dấu UNSOLD.',
      },
    ],
  },
  {
    id: 'chuong-5',
    title: 'Chương V. Mua ngay (Buy Now), Thanh toán & Quyền lợi',
    articles: [
      {
        code: 'Điều 9',
        heading: 'Hiệu lực Mua ngay tức thì',
        body: 'Khi hội viên bấm "Mua ngay" trên vật phẩm đang mở đấu, phiên đấu lô hàng đó kết thúc ngay lập tức bất kể trạng thái đếm ngược, quyền sở hữu tạm xác lập cho người Mua ngay và hàng đợi chuyển sang lô kế tiếp.',
      },
      {
        code: 'Điều 10',
        heading: 'Quyền kiểm định & Nhận tài sản',
        body: 'Người thắng đấu giá có quyền yêu cầu đối chiếu hồ sơ xuất xứ gốc (CO/CQ, giấy giám định GIA/Patek/Bababebi) trước khi hoàn tất bàn giao vật phẩm trong vòng 48 giờ làm việc.',
      },
    ],
  },
  {
    id: 'chuong-6',
    title: 'Chương VI. Nghĩa vụ các bên & Điều phối quản trị',
    articles: [
      {
        code: 'Điều 11',
        heading: 'Nghĩa vụ tôn trọng cam kết trả giá',
        body: 'Mỗi cú nhấp đặt giá được ghi nhận kèm dấu thời gian (timestamp) tại máy chủ là cam kết dân sự có giá trị ràng buộc. Hành vi tự ý hủy ngang hoặc gian lận sẽ bị khóa quyền hội viên.',
      },
      {
        code: 'Điều 12',
        heading: 'Quyền can thiệp của Quản trị viên (Admin)',
        body: 'Chủ tọa phiên có quyền mở/đóng phòng, gõ búa cưỡng bức (Force Hammer) hoặc bỏ qua lô vi phạm (Skip Lot) để bảo vệ tính liên tục và an toàn pháp lý cho phiên đấu.',
      },
    ],
  },
];

export function TermsAndPoliciesPage({ onBackHome }) {
  const [query, setQuery] = useState('');

  const normalizedQuery = query.trim().toLowerCase();

  const filteredChapters = useMemo(() => {
    if (!normalizedQuery) return CHAPTERS;
    return CHAPTERS.map((chap) => ({
      ...chap,
      articles: chap.articles.filter(
        (art) =>
          art.code.toLowerCase().includes(normalizedQuery) ||
          art.heading.toLowerCase().includes(normalizedQuery) ||
          art.body.toLowerCase().includes(normalizedQuery) ||
          chap.title.toLowerCase().includes(normalizedQuery)
      ),
    })).filter((chap) => chap.articles.length > 0);
  }, [normalizedQuery]);

  return (
    <div className="min-h-screen bg-white pt-6 sm:pt-8 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar */}
        <div className="mb-10 pb-8 border-b border-dashed border-[#d8dce3]">
          <button
            type="button"
            onClick={onBackHome}
            className="serko-btn-secondary px-4 py-2 text-xs sm:text-sm inline-flex items-center gap-1.5 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay về sảnh chính
          </button>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#004680] mb-2">
                <HoverShieldCheckIcon className="w-4 h-4 text-[#1b9e52]" />
                Quy chế & Pháp lý
              </span>
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#17181c]">
                Điều khoản, Quyền lợi & Nghĩa vụ Đấu giá
              </h1>
              <p className="text-sm sm:text-base text-[#4a4f59] mt-2 max-w-2xl">
                Ban hành chuẩn mực vận hành phiên đấu giá trực tuyến thời gian thực tại RoyalAuction.
              </p>
            </div>

            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-[#7a808c] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm điều khoản (VD: 30 giây, FIFO)..."
                className="w-full h-11 pl-10 pr-4 rounded-full border border-[#d6d9e0] bg-[#fafafa] text-base text-[#17181c] focus:outline-none focus:bg-white focus:border-[#17181c]"
              />
            </div>
          </div>
        </div>

        {/* 12-Col Editorial Reader */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Sticky TOC */}
          <aside className="lg:col-span-4 lg:sticky lg:top-24 serko-visual-frame p-4">
            <div className="bg-white rounded-2xl border border-[#e5e7eb] p-5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#4a4f59] mb-3">
                <BookOpen className="w-4 h-4 text-[#17181c]" />
                Mục lục văn bản
              </div>
              <nav className="space-y-1.5">
                {CHAPTERS.map((chap) => (
                  <a
                    key={chap.id}
                    href={`#${chap.id}`}
                    className="block px-3 py-2 rounded-xl text-sm text-[#4a4f59] hover:text-[#17181c] hover:bg-[#f6f6f6] transition-colors"
                  >
                    {chap.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Chapters Body */}
          <div className="lg:col-span-8 space-y-8">
            {filteredChapters.length === 0 ? (
              <div className="rounded-2xl border border-[#e5e7eb] bg-[#fafafa] p-10 text-center text-sm text-[#4a4f59]">
                Không tìm thấy điều khoản nào khớp với từ khóa "{query}".
              </div>
            ) : (
              filteredChapters.map((chap) => (
                <section
                  key={chap.id}
                  id={chap.id}
                  className="scroll-mt-24 rounded-[24px] border border-[#e5e7eb] bg-white p-6 sm:p-8 shadow-xs space-y-5"
                >
                  <h2 className="text-xl font-semibold text-[#17181c] pb-3 border-b border-dashed border-[#e5e7eb]">
                    {chap.title}
                  </h2>
                  <div className="space-y-5">
                    {chap.articles.map((art) => (
                      <article key={art.code} className="space-y-1.5">
                        <h3 className="text-sm sm:text-base font-semibold text-[#17181c]">
                          <span className="font-mono text-[#004680] mr-2">{art.code}.</span>
                          {art.heading}
                        </h3>
                        <p className="text-sm sm:text-base text-[#4a4f59] leading-relaxed">
                          {art.body}
                        </p>
                      </article>
                    ))}
                  </div>
                </section>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertCircle, Sparkles, Upload, X } from 'lucide-react';
import { apiRequest, formatVND } from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { ProductImageViewer } from '../common/product-image-viewer';

const LUXURY_ITEM_PRESETS = [
  {
    title: 'Audemars Piguet Royal Oak "Jumbo" Extra-Thin 16202ST',
    category: 'Đồng hồ Haute Horlogerie',
    imageUrl: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=1000&q=85',
    startingPrice: 1850000000,
    buyNowPrice: 2450000000,
    minIncrement: 10000000,
    description:
      'Thép không gỉ 39mm, mặt số Petite Tapisserie Bleu Nuit Nuage 50, bộ máy Calibre 7121, đầy đủ hộp sổ thẻ chính hãng 2024.',
  },
  {
    title: 'Leica Q3 43 APO-Summicron Collector Set',
    category: 'Máy ảnh sưu tầm',
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=85',
    startingPrice: 165000000,
    buyNowPrice: 215000000,
    minIncrement: 2000000,
    description:
      'Cảm biến Full-frame 60MP kết hợp ống kính APO-Summicron 43 f/2 ASPH danh tiếng của Đức, tình trạng như mới 99.9%.',
  },
  {
    title: 'Hermès Kelly 28 Sellier Noir Box Calfskin Gold Hardware',
    category: 'Túi xách Hermès',
    imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=85',
    startingPrice: 480000000,
    buyNowPrice: 650000000,
    minIncrement: 5000000,
    description:
      'Da Box Calfskin đen bóng cổ điển, khóa mạ vàng 18k, tem chế tác thủ công Paris kèm giấy giám định Bababebi.',
  },
  {
    title: 'Tranh Sơn Mài "Phong Cảnh Miền Trung" — Nghệ Nhân Huế 1978',
    category: 'Nghệ thuật & Tranh cổ',
    imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=1000&q=85',
    startingPrice: 320000000,
    buyNowPrice: null,
    minIncrement: 5000000,
    description:
      'Sơn mài truyền thống phủ vàng quỳ trên vóc gỗ cổ điển kích thước 80x120cm, provenance bộ sưu tập tư nhân Sài Gòn.',
  },
];

export function SellItemModal({ isOpen, onClose, rooms = [], defaultRoomId = '', onCreated }) {
  const { token } = useAuth();
  const [roomId, setRoomId] = useState(defaultRoomId);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Đồng hồ Haute Horlogerie');
  const [imageUrl, setImageUrl] = useState('');
  const [startingPrice, setStartingPrice] = useState('10000000');
  const [buyNowPrice, setBuyNowPrice] = useState('');
  const [minIncrement, setMinIncrement] = useState('100000');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const activeRooms = rooms.filter((r) => r.status !== 'ENDED');

  useEffect(() => {
    if (isOpen) {
      setError('');
      if (defaultRoomId) {
        setRoomId(defaultRoomId);
      } else if (activeRooms.length > 0) {
        setRoomId(activeRooms[0].id);
      }
    }
  }, [isOpen, defaultRoomId, rooms.length]);

  const applyPreset = (preset) => {
    setTitle(preset.title);
    setCategory(preset.category);
    setImageUrl(preset.imageUrl);
    setStartingPrice(String(preset.startingPrice));
    setBuyNowPrice(preset.buyNowPrice ? String(preset.buyNowPrice) : '');
    setMinIncrement(String(preset.minIncrement));
    setDescription(preset.description);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const startNum = Number(startingPrice);
    const hasBuyNow = String(buyNowPrice).trim() !== '' && Number(buyNowPrice) > 0;
    const buyNum = hasBuyNow ? Number(buyNowPrice) : null;
    const stepNum = Number(minIncrement);

    if (!roomId) {
      setError('Vui lòng chọn phòng đấu giá để ký gửi vật phẩm.');
      return;
    }
    if (stepNum < 10000) {
      setError('Bước giá tối thiểu theo quy chế phải từ 10.000 ₫ trở lên.');
      return;
    }
    if (buyNum !== null && buyNum <= startNum) {
      setError('Giá chốt (nếu nhập) phải cao hơn giá khởi điểm.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiRequest(
        '/items',
        'POST',
        {
          roomId,
          title: title.trim(),
          category: category.trim(),
          imageUrl: imageUrl.trim(),
          startingPrice: startNum,
          buyNowPrice: buyNum,
          minIncrement: stepNum,
          description: description.trim(),
        },
        token
      );
      if (onCreated) onCreated(res.data);
      onClose();
    } catch (err) {
      setError(err.message || 'Không thể ký gửi vật phẩm.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#17181c]/45 backdrop-blur-xs"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            className="relative z-10 w-full max-w-2xl bg-white rounded-[28px] border border-[#e5e7eb] shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto"
          >
            <div className="p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#004680]">
                    Hàng đợi FIFO
                  </span>
                  <h2 className="text-2xl font-semibold tracking-tight text-[#17181c] mt-0.5">
                    Ký gửi vật phẩm đấu giá
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Đóng"
                  className="w-9 h-9 rounded-full bg-[#f6f6f6] hover:bg-[#e9eaee] flex items-center justify-center text-[#17181c]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Luxury Presets */}
              <div className="mb-5">
                <p className="text-xs font-medium text-[#4a4f59] mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#004680]" />
                  Chọn nhanh vật phẩm xa xỉ có sẵn (hoặc tự nhập):
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {LUXURY_ITEM_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applyPreset(preset)}
                      className="text-left p-2.5 rounded-xl bg-[#fafafa] hover:bg-[#e8f3fe]/70 border border-[#e5e7eb] transition-colors"
                    >
                      <p className="text-xs font-semibold text-[#17181c] truncate">
                        {preset.title}
                      </p>
                      <p className="text-[11px] font-mono text-[#4a4f59]">
                        Khởi điểm {formatVND(preset.startingPrice)}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#4a4f59] mb-1.5">
                      Phòng đấu giá tiếp nhận
                    </label>
                    <select
                      required
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl border border-[#d6d9e0] bg-white text-base text-[#17181c] focus:outline-none focus:border-[#17181c]"
                    >
                      {activeRooms.length === 0 ? (
                        <option value="">Không có phòng khả dụng</option>
                      ) : (
                        activeRooms.map((r) => (
                          <option key={r.id} value={r.id}>
                            [{r.code}] {r.title}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#4a4f59] mb-1.5">
                      Danh mục vật phẩm
                    </label>
                    <input
                      type="text"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="Đồng hồ, Nghệ thuật, Siêu xe..."
                      className="w-full h-11 px-3.5 rounded-xl border border-[#d6d9e0] text-base text-[#17181c] focus:outline-none focus:border-[#17181c]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#4a4f59] mb-1.5">
                    Tên vật phẩm
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="VD: Patek Philippe Nautilus 5711/1A Blue Dial"
                    className="w-full h-11 px-3.5 rounded-xl border border-[#d6d9e0] text-base text-[#17181c] focus:outline-none focus:border-[#17181c]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#4a4f59] mb-1.5">
                      Giá khởi điểm (VNĐ)
                    </label>
                    <input
                      type="number"
                      required
                      min={10000}
                      step={10000}
                      value={startingPrice}
                      onChange={(e) => setStartingPrice(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl border border-[#d6d9e0] text-base font-mono text-[#17181c] focus:outline-none focus:border-[#17181c]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#4a4f59] mb-1.5">
                      Bước giá min (&ge; 10.000 ₫)
                    </label>
                    <input
                      type="number"
                      required
                      min={10000}
                      step={10000}
                      value={minIncrement}
                      onChange={(e) => setMinIncrement(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl border border-[#d6d9e0] text-base font-mono text-[#17181c] focus:outline-none focus:border-[#17181c]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#4a4f59] mb-1.5">
                      Giá chốt (VNĐ · Tùy chọn)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={10000}
                      value={buyNowPrice}
                      onChange={(e) => setBuyNowPrice(e.target.value)}
                      placeholder="Bỏ trống nếu không áp dụng"
                      className="w-full h-11 px-3.5 rounded-xl border border-[#d6d9e0] text-base font-mono text-[#17181c] placeholder:text-xs placeholder:font-sans placeholder:text-[#8a8d96] focus:outline-none focus:border-[#17181c]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  <div className="sm:col-span-9">
                    <label className="block text-xs font-medium text-[#4a4f59] mb-1.5">
                      Đường dẫn ảnh sản phẩm (URL)
                    </label>
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full h-11 px-3.5 rounded-xl border border-[#d6d9e0] text-base text-[#17181c] focus:outline-none focus:border-[#17181c]"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <div className="h-16 w-full rounded-xl overflow-hidden border border-[#e5e7eb] bg-[#f6f6f6]">
                      <ProductImageViewer
                        src={imageUrl}
                        alt={title || 'Preview'}
                        className="w-full h-full object-cover"
                        fallbackKey={category || title}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#4a4f59] mb-1.5">
                    Mô tả kiểm định & Xuất xứ
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Chi tiết tình trạng, năm sản xuất, giấy tờ kèm theo..."
                    className="w-full p-3.5 rounded-xl border border-[#d6d9e0] text-base text-[#17181c] focus:outline-none focus:border-[#17181c]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || activeRooms.length === 0}
                  className="serko-btn-primary w-full h-12 inline-flex items-center justify-center gap-2 text-sm font-semibold disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  {submitting ? 'Đang đưa vào hàng đợi...' : 'Xác nhận ký gửi vật phẩm'}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}


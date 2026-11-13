import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertCircle, PlusCircle, Sparkles, X } from 'lucide-react';
import { apiRequest } from '../../config/api';
import { useAuth } from '../../context/AuthContext';

const ROOM_PRESETS = [
  {
    title: 'Đấu Giá High Jewelry & Đá Quý 2026',
    code: 'SERKO-GEM-04',
    description:
      'Phòng đấu giá trang sức kim cương GIA, ngọc lục bảo Muzo và sapphire Kashmir tuyển chọn có chứng thư kiểm định quốc tế.',
  },
  {
    title: 'Bộ Sưu Tập Vang Cổ & Whisky Nhật Quý Hiếm',
    code: 'SERKO-CELLAR-05',
    description:
      'Niên vụ Romanée-Conti, Yamazaki 25 Year Old và Karuizawa nguyên seal hầm rượu bảo quản chuẩn 13°C.',
  },
];

export function CreateRoomModal({ isOpen, onClose, onCreated }) {
  const { token } = useAuth();
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const applyPreset = (preset) => {
    setTitle(preset.title);
    setCode(`${preset.code.slice(0, 10)}-${Math.floor(10 + Math.random() * 89)}`);
    setDescription(preset.description);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await apiRequest(
        '/rooms',
        'POST',
        {
          title: title.trim(),
          code: code.trim().toUpperCase(),
          description: description.trim(),
        },
        token
      );
      setTitle('');
      setCode('');
      setDescription('');
      if (onCreated) onCreated(res.data);
      onClose();
    } catch (err) {
      setError(err.message || 'Không thể tạo phòng đấu giá.');
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
            className="relative z-10 w-full max-w-lg bg-white rounded-[28px] border border-[#e5e7eb] shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto"
          >
            <div className="p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#004680]">
                    Khởi tạo phòng đấu
                  </span>
                  <h2 className="text-2xl font-semibold tracking-tight text-[#17181c] mt-0.5">
                    Mở phòng đấu giá mới
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

              {/* 1-click presets */}
              <div className="mb-5">
                <p className="text-xs font-medium text-[#4a4f59] mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#004680]" />
                  Điền nhanh chủ đề mẫu:
                </p>
                <div className="flex flex-wrap gap-2">
                  {ROOM_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applyPreset(preset)}
                      className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#f6f6f6] hover:bg-[#e8f3fe] text-[#17181c] border border-[#e5e7eb] transition-colors"
                    >
                      {preset.title}
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
                <div>
                  <label className="block text-xs font-medium text-[#4a4f59] mb-1.5">
                    Tên phòng đấu giá
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="VD: Phiên Đấu Giá Đồng Hồ Độc Bản Tháng 11"
                    className="w-full h-11 px-4 rounded-xl border border-[#d6d9e0] text-base text-[#17181c] focus:outline-none focus:border-[#17181c]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#4a4f59] mb-1.5">
                    Mã phòng định danh (Unique Code)
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="VD: SERKO-LUX-04"
                    className="w-full h-11 px-4 rounded-xl border border-[#d6d9e0] text-base font-mono uppercase text-[#17181c] focus:outline-none focus:border-[#17181c]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#4a4f59] mb-1.5">
                    Mô tả chi tiết phiên đấu
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Mô tả quy cách kiểm định, chủ đề và nhóm vật phẩm..."
                    className="w-full p-3.5 rounded-xl border border-[#d6d9e0] text-base text-[#17181c] focus:outline-none focus:border-[#17181c]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="serko-btn-primary w-full h-12 inline-flex items-center justify-center gap-2 text-sm font-semibold disabled:opacity-50"
                >
                  <PlusCircle className="w-4 h-4" />
                  {submitting ? 'Đang khởi tạo...' : 'Tạo phòng đấu giá'}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}


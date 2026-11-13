import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertCircle, KeyRound, Lock, Mail, Phone, Shield, User, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { HoverShieldCheckIcon } from '../icons/itshover-animated-icons';

const DEMO_ACCOUNTS = [
  {
    label: 'Chủ tọa Hội đồng (Admin)',
    email: 'admin@royalauction.vn',
    password: 'Admin@123456',
    role: 'ADMIN',
  },
  {
    label: 'Trần Minh Quân (Bidder 1)',
    email: 'bidder1@royalauction.vn',
    password: 'Member@123456',
    role: 'MEMBER',
  },
  {
    label: 'Lê Hoàng Yến (Bidder 2)',
    email: 'bidder2@royalauction.vn',
    password: 'Member@123456',
    role: 'MEMBER',
  },
  {
    label: 'Nguyễn Đăng Khoa (Bidder 3)',
    email: 'bidder3@royalauction.vn',
    password: 'Member@123456',
    role: 'MEMBER',
  },
];

export function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError('');
    }
  }, [isOpen, initialMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(email.trim(), password);
      } else {
        await register(email.trim(), password, fullName.trim(), phone.trim());
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Xác thực thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLogin = async (acc) => {
    setError('');
    setEmail(acc.email);
    setPassword(acc.password);
    setSubmitting(true);
    try {
      await login(acc.email, acc.password);
      onClose();
    } catch (err) {
      setError(err.message || 'Không thể đăng nhập tài khoản mẫu.');
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
            transition={{ duration: 0.2 }}
            className="relative z-10 w-full max-w-lg bg-white rounded-[28px] border border-[#e5e7eb] shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto"
          >
            <div className="p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#004680] mb-1">
                    <HoverShieldCheckIcon className="w-4 h-4 text-[#1b9e52]" />
                    RoyalAuction Access
                  </span>
                  <h2 className="text-2xl font-semibold tracking-tight text-[#17181c]">
                    {mode === 'login' ? 'Đăng nhập hội viên' : 'Đăng ký tài khoản mới'}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Đóng"
                  className="w-9 h-9 rounded-full bg-[#f6f6f6] hover:bg-[#e9eaee] flex items-center justify-center text-[#17181c] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Sliding Tab Switcher */}
              <div className="grid grid-cols-2 p-1 rounded-full bg-[#f6f6f6] mb-6">
                {[
                  { id: 'login', label: 'Đăng nhập' },
                  { id: 'register', label: 'Tạo tài khoản' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setMode(tab.id);
                      setError('');
                    }}
                    className={`relative py-2 rounded-full text-sm font-medium transition-colors z-10 ${
                      mode === tab.id ? 'text-[#17181c]' : 'text-[#5b606b]'
                    }`}
                  >
                    {mode === tab.id && (
                      <motion.span
                        layoutId="authModePill"
                        className="absolute inset-0 bg-white rounded-full shadow-xs -z-10"
                      />
                    )}
                    {tab.label}
                  </button>
                ))}
              </div>

              {error && (
                <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'register' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[#4a4f59] mb-1.5">
                        Họ và tên
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-[#808590] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Nguyễn Văn A"
                          className="w-full h-11 pl-10 pr-4 rounded-xl border border-[#d6d9e0] text-base text-[#17181c] focus:outline-none focus:border-[#17181c]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#4a4f59] mb-1.5">
                        Số điện thoại
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-[#808590] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="0901234567"
                          className="w-full h-11 pl-10 pr-4 rounded-xl border border-[#d6d9e0] text-base text-[#17181c] focus:outline-none focus:border-[#17181c]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-[#4a4f59] mb-1.5">
                    Email tài khoản
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#808590] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@royalauction.vn"
                      className="w-full h-11 pl-10 pr-4 rounded-xl border border-[#d6d9e0] text-base text-[#17181c] focus:outline-none focus:border-[#17181c]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#4a4f59] mb-1.5">
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#808590] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Nhập mật khẩu..."
                      className="w-full h-11 pl-10 pr-4 rounded-xl border border-[#d6d9e0] text-base text-[#17181c] focus:outline-none focus:border-[#17181c]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="serko-btn-primary w-full h-12 text-sm font-semibold disabled:opacity-50"
                >
                  {submitting
                    ? 'Đang xử lý...'
                    : mode === 'login'
                      ? 'Đăng nhập ngay'
                      : 'Hoàn tất đăng ký'}
                </button>
              </form>

              {mode === 'login' && (
                <div className="mt-6 pt-5 border-t border-dashed border-[#e5e7eb]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#4a4f59]">
                      <KeyRound className="w-3.5 h-3.5" />
                      Đăng nhập nhanh (Tài khoản mẫu)
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {DEMO_ACCOUNTS.map((acc) => (
                      <button
                        key={acc.email}
                        type="button"
                        disabled={submitting}
                        onClick={() => handleQuickLogin(acc)}
                        className="text-left p-2.5 rounded-xl border border-[#e5e7eb] bg-[#fafafa] hover:bg-[#f0f2f5] hover:border-[#cfd4dc] transition-colors flex items-center justify-between gap-2 disabled:opacity-50"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#17181c] truncate">
                            {acc.label}
                          </p>
                          <p className="text-[11px] font-mono text-[#666b75] truncate">
                            {acc.email}
                          </p>
                        </div>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                            acc.role === 'ADMIN'
                              ? 'bg-[#17181c] text-white'
                              : 'bg-[#e8f3fe] text-[#004680]'
                          }`}
                        >
                          {acc.role === 'ADMIN' ? (
                            <span className="inline-flex items-center gap-1">
                              <Shield className="w-2.5 h-2.5" />
                              ADMIN
                            </span>
                          ) : (
                            'MEMBER'
                          )}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}


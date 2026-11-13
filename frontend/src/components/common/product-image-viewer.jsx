import React, { useState } from 'react';

const FALLBACK_GALLERY = [
  'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=85',
];

export function ProductImageViewer({
  src,
  alt = 'Hiện vật đấu giá',
  className = '',
  fallbackKey = 0,
}) {
  const [triedFallback, setTriedFallback] = useState(false);
  const [failed, setFailed] = useState(false);

  const fallbackUrl =
    FALLBACK_GALLERY[Math.abs(Number(fallbackKey) || 0) % FALLBACK_GALLERY.length];
  const activeSrc = !triedFallback && src ? src : fallbackUrl;

  return (
    <div className={`relative w-full h-full overflow-hidden bg-[#f1f1f3] ${className}`}>
      {!failed ? (
        <img
          src={activeSrc}
          alt={alt}
          loading="lazy"
          onError={() => {
            if (!triedFallback && src) {
              setTriedFallback(true);
            } else {
              setFailed(true);
            }
          }}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[#f6f6f6] text-[#4b4f57]">
          <span className="font-mono text-[11px] uppercase tracking-widest text-[#8a8d96] mb-1">
            RoyalAuction Verified Lot
          </span>
          <span className="font-semibold text-sm text-[#17181c] line-clamp-2">{alt}</span>
        </div>
      )}
    </div>
  );
}

export default ProductImageViewer;


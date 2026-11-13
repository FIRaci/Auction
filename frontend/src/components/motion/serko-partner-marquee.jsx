import React from 'react';

const PARTNERS = [
  { name: 'PATEK PHILIPPE', sub: 'Genève' },
  { name: 'ROLEX SA', sub: 'Chronometer' },
  { name: 'LEICA WETZLAR', sub: 'Optik' },
  { name: "CHRISTIE'S", sub: 'Standard' },
  { name: "SOTHEBY'S", sub: 'Provenance' },
  { name: 'HERMÈS PARIS', sub: 'Faubourg' },
  { name: 'PORSCHE 911', sub: 'Weissach' },
  { name: 'BANG & OLUFSEN', sub: 'Struer' },
  { name: 'AUDEMARS PIGUET', sub: 'Le Brassus' },
];

export function SerkoPartnerMarquee() {
  return (
    <div className="w-full py-6 border-t border-black/[0.06] bg-white/40 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="serko-marquee-mask overflow-hidden">
          <div className="serko-marquee-track items-center gap-10">
            {[...PARTNERS, ...PARTNERS].map((item, idx) => (
              <div
                key={`${item.name}-${idx}`}
                className="flex items-center gap-2.5 shrink-0 px-3 py-1 select-none opacity-75 hover:opacity-100 transition-opacity"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#17181c]/30" />
                <span className="font-display font-bold text-xs tracking-[0.16em] text-[#17181c]">
                  {item.name}
                </span>
                <span className="text-[11px] font-mono text-[#8a8d96]">{item.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SerkoPartnerMarquee;


import React from 'react';
import { Truck, MessageCircle } from 'lucide-react';

export const AnnouncementBar: React.FC = () => {
  return (
    <aside className="bg-[#004D40] text-white text-[11px] sm:text-xs py-2 px-4 font-medium tracking-wide border-b border-emerald-950/40">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-4">
        {/* Left: Operational Value Proposition */}
        <div className="flex items-center gap-2">
          <Truck className="w-3.5 h-3.5 text-emerald-300 shrink-0" aria-hidden="true" />
          <span>Islandwide Cash on Delivery (COD) Available Across Sri Lanka</span>
        </div>

        {/* Right: Direct Helpline / WhatsApp */}
        <div className="hidden md:flex items-center gap-4 text-emerald-100/90 text-[11px]">
          <span className="text-emerald-400/60">•</span>
          <a
            href="https://wa.me/94787844914?text=Hello%20NookMint"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-300" />
            <span>WhatsApp Orders: +94 78 784 4914</span>
          </a>
        </div>
      </div>
    </aside>
  );
};

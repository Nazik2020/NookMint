import React from 'react';
import { MessageCircle, ArrowRight } from 'lucide-react';

export const WhatsAppSupportBar: React.FC = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-5" aria-label="WhatsApp customer care banner">
      <div className="bg-[#EAF3EE] rounded-2xl p-4 sm:p-5 border border-emerald-100/60 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
        {/* Left Icon and Text matching Reference Image 1 */}
        <div className="flex items-center gap-3.5 text-center sm:text-left">
          <div className="w-11 h-11 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <MessageCircle className="w-6 h-6 fill-white/20 text-white" />
          </div>
          <div className="space-y-0.5">
            <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
              Questions about your order?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              Get in touch with our team on WhatsApp.
            </p>
          </div>
        </div>

        {/* Right Button matching Reference Image 1 */}
        <a
          href="https://wa.me/94714897262?text=Hello%20Your%20Brand%2C%20I%20have%20a%20question%20about%20my%20order"
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-2.5 bg-[#004D40] hover:bg-[#00382E] text-white font-bold text-xs sm:text-sm rounded-lg transition-all shadow-2xs flex items-center gap-2 shrink-0"
        >
          <span>Chat with our team</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </section>
  );
};

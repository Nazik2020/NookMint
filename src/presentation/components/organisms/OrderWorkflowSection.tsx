import React from 'react';
import { ShoppingBag, ClipboardCheck, Truck, ChevronRight, MessageCircle, ArrowRight } from 'lucide-react';

export const OrderWorkflowSection: React.FC = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-5" aria-label="Simple order workflow and support">
      <div className="bg-[#EAF3EE] rounded-2xl border border-emerald-100/70 shadow-2xs overflow-hidden divide-y divide-emerald-200/50">
        {/* Part 1: 3-Step Simple Order Workflow matching Reference Design & Client Requirements */}
        <div className="p-5 sm:p-7">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-center">
            {/* Step 1: Browse products */}
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-[#D4EBD9] text-[#004D40] flex items-center justify-center shrink-0">
                <ShoppingBag className="w-5 h-5 text-[#004D40] stroke-[2.2]" />
              </div>
              <div className="space-y-0.5">
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                  Browse products
                </h3>
                <p className="text-xs text-slate-600 leading-snug">
                  Explore categories and add your favourites to the cart.
                </p>
              </div>
              <ChevronRight className="hidden md:block w-4 h-4 text-emerald-800/30 ml-auto shrink-0" />
            </div>

            {/* Step 2: Place your order */}
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-[#D4EBD9] text-[#004D40] flex items-center justify-center shrink-0">
                <ClipboardCheck className="w-5 h-5 text-[#004D40] stroke-[2.2]" />
              </div>
              <div className="space-y-0.5">
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                  Place your order
                </h3>
                <p className="text-xs text-slate-600 leading-snug">
                  Enter your delivery details and submit without online cards.
                </p>
              </div>
              <ChevronRight className="hidden md:block w-4 h-4 text-emerald-800/30 ml-auto shrink-0" />
            </div>

            {/* Step 3: We confirm & deliver */}
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-[#D4EBD9] text-[#004D40] flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5 text-[#004D40] stroke-[2.2]" />
              </div>
              <div className="space-y-0.5">
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                  We confirm & deliver
                </h3>
                <p className="text-xs text-slate-600 leading-snug">
                  Our team confirms your order via WhatsApp & dispatches with COD.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Part 2: Integrated WhatsApp Customer Support Assistance */}
        <div className="px-5 py-4 sm:px-7 sm:py-4.5 bg-emerald-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <MessageCircle className="w-5 h-5 fill-white/20 text-white" />
            </div>
            <div className="space-y-0.5">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                Questions about your order?
              </h3>
              <p className="text-xs text-slate-600">
                Get instant assistance or place custom orders with our team on WhatsApp.
              </p>
            </div>
          </div>

          <a
            href="https://wa.me/94714897262?text=Hello%20NookMint%2C%20I%20have%20a%20question%20about%20an%20order"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-[#004D40] hover:bg-[#00382E] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs hover:scale-101 active:scale-98 flex items-center gap-2 shrink-0"
          >
            <span>Chat with our team</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
};

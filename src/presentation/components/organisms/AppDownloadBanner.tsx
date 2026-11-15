import React from 'react';
import Image from 'next/image';

export const AppDownloadBanner: React.FC = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12" aria-label="Mobile app download">
      <div className="relative rounded-3xl overflow-hidden bg-[#0D3830] border border-emerald-900/50 p-8 sm:p-12 lg:p-14 text-white shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Left Text & Download Buttons matching Screenshot 5 */}
          <div className="md:col-span-7 space-y-5 text-center md:text-left z-10">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              PioMart User Friendly App Available
            </h2>

            <p className="text-xs sm:text-sm text-emerald-100/80 max-w-lg mx-auto md:mx-0 leading-relaxed font-normal">
              Appropriately monetize one-to-one interfaces rather than cutting-edge. Competently disintermediate backward with seamless mobile shopping, live order tracking, and exclusive discounts.
            </p>

            {/* Store Buttons */}
            <div className="pt-3 flex flex-wrap items-center justify-center md:justify-start gap-3.5">
              {/* Google Play Button */}
              <a
                href="#download"
                className="inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white transition-all shadow-md active:scale-98"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" aria-hidden="true">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a1.99 1.99 0 0 1-.61-.955V2.77c0-.36.104-.69.284-.956h.325zM15.207 13.414l2.122-2.122-12.72-7.34 10.598 9.462zm0-2.828L4.609 1.124l12.72 7.34-2.122 2.122zm1.414 1.414l3.535 2.04c.884.51.884 1.34 0 1.85l-3.535 2.04-1.414-1.414 1.414-4.516z" />
                </svg>
                <div className="text-left leading-tight">
                  <span className="block text-[10px] text-orange-100 uppercase tracking-wider font-semibold">Get it on</span>
                  <span className="block text-xs sm:text-sm font-extrabold text-white">Google Play</span>
                </div>
              </a>

              {/* Apple App Store Button */}
              <a
                href="#download"
                className="inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-black hover:bg-slate-900 text-white transition-all shadow-md border border-white/10 active:scale-98"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" aria-hidden="true">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-2 .6-2.65 1.35-.58.65-1.09 1.73-.95 2.76 1.01.08 2.06-.51 2.68-1.26z" />
                </svg>
                <div className="text-left leading-tight">
                  <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Download on the</span>
                  <span className="block text-xs sm:text-sm font-extrabold text-white">App Store</span>
                </div>
              </a>
            </div>
          </div>

          {/* Right Floating Dual Mobile Phone Mockups matching Screenshot 5 */}
          <div className="md:col-span-5 relative h-72 sm:h-80 md:h-96 flex items-center justify-center">
            <Image
              src="/images/app-phones.svg"
              alt="PioMart mobile app interface on smartphone screens"
              fill
              className="object-contain object-center scale-105"
              unoptimized
            />
          </div>
        </div>
      </div>
    </section>
  );
};
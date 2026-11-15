import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Terms & Conditions | NookMint Sri Lanka',
  description: 'Terms of sale, Cash on Delivery (COD) rules, and store policies for NookMint Sri Lanka.',
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
      <div className="space-y-3 text-center max-w-2xl mx-auto">
        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-700 bg-blue-50 px-3.5 py-1 rounded-full border border-blue-200/80 inline-block">
          CUSTOMER AGREEMENT
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Terms & Conditions
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Effective Date: November 2026 • Innovative Consultants (Pvt) Ltd
        </p>
      </div>

      <div className="bg-white p-7 sm:p-10 rounded-3xl border border-slate-200/80 shadow-2xs space-y-8 text-xs text-slate-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-black text-slate-900">1. Scope of Agreement</h2>
          <p>
            Welcome to Innovative Consultants. By browsing, placing orders, or utilizing our services, you agree to be bound by these terms. We sell retail products across groceries, household essentials, fashion apparel, and smart mobility within the territory of Sri Lanka.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-black text-slate-900">2. Cash on Delivery (COD) Terms</h2>
          <ul className="list-disc list-inside space-y-1 pl-2 text-slate-600">
            <li>Cash on Delivery allows customers to pay exact cash in Sri Lankan Rupees (LKR) to our courier executive upon doorstep package handover.</li>
            <li>COD is offered for order amounts between Rs. 1,000 and Rs. 50,000.</li>
            <li>Dispatch of an order does not constitute completed payment. Payment is only recorded as collected once cash is received by the delivery courier.</li>
            <li>Refusal to accept an authorized COD order upon arrival without prior notification may result in restrictions on future COD purchases.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-black text-slate-900">3. Cash on Delivery (COD) & Dropshipping Fulfilment Rules</h2>
          <ul className="list-disc list-inside space-y-1 pl-2 text-slate-600">
            <li>NookMint operates exclusively on a 100% Cash on Delivery (COD) islandwide fulfilment model.</li>
            <li>Zero advance payment, deposit, or bank slip upload is ever required from our customers.</li>
            <li>Customers must provide a valid primary phone number (and optional backup number) so our express courier drivers (Prompt Xpress / Domex) can confirm delivery.</li>
            <li>Deliveries take between 1 to 3 business days across all 25 districts in Sri Lanka. Customers inspect parcel packaging upon arrival and pay exact cash.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-black text-slate-900">4. Pricing, Accuracy & Currency</h2>
          <p>
            All prices displayed on NookMint are quoted strictly in Sri Lankan Rupees (LKR). Product prices shown at the time of checkout are server-authoritative and final.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-black text-slate-900">5. Contact Information</h2>
          <p>
            For questions regarding our terms, reach out via email at <strong>support@nookmint.lk</strong> or phone <strong>+94 71 489 7262</strong>.
          </p>
        </section>
      </div>
    </div>
  );
}

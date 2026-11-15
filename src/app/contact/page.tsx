'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  Building2,
  Truck,
  Layers
} from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: 'Order Inquiry',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFormData({
        name: '',
        phone: '',
        email: '',
        subject: 'Order Inquiry',
        message: '',
      });
      setTimeout(() => setSubmitted(false), 5000);
    }, 1000);
  };

  return (
    <div className="space-y-12 sm:space-y-16 py-10 sm:py-16 bg-slate-50/50">
      {/* 1. Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#064E3B] bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200/80 inline-block">
            WE ARE HERE TO HELP
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Contact NookMint Team
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
            Have a question about product specifications, Cash on Delivery coverage, bank transfer confirmations, or bulk inquiries? Reach out to our team directly.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Direct Contact & Info Card */}
          <div className="lg:col-span-5 space-y-5">
            {/* WhatsApp Primary Card */}
            <a
              href="https://wa.me/94787844914?text=Hello%20NookMint!%20I%20have%20an%20order%20inquiry"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-6 rounded-3xl bg-emerald-50 border border-emerald-200/80 hover:border-emerald-500 transition-all group shadow-2xs"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block">
                    FASTEST RESPONSE • DIRECT CHAT
                  </span>
                  <h3 className="font-extrabold text-base text-slate-900">
                    Chat on WhatsApp
                  </h3>
                  <p className="text-xs text-slate-700 font-mono font-bold">+94 78 784 4914</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 mt-3 pt-3 border-t border-emerald-200/60 leading-relaxed">
                Message us for immediate order assistance, delivery updates, product specs, or sending bank deposit slip photos.
              </p>
            </a>

            {/* Corporate HQ Info */}
            <div className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-2xs p-6 space-y-4 text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">
                <Building2 className="w-4 h-4 text-[#064E3B]" />
                <span>NookMint Operations Center</span>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#064E3B] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-900">Operations & Dispatch Centre</p>
                  <p className="text-slate-500 leading-relaxed">
                    NookMint Fulfillment Desk, Colombo, Western Province, Sri Lanka.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-3 border-t border-slate-100">
                <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-900">Support Hours</p>
                  <p className="text-slate-500">Monday – Saturday: 8:30 AM – 7:30 PM</p>
                  <p className="text-slate-500">Online & WhatsApp Orders: 24/7 Monitored</p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-3 border-t border-slate-100">
                <Mail className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-900">Email Inquiries</p>
                  <p className="text-slate-600 font-mono">support@nookmint.lk / orders@nookmint.lk</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Inquiry Form */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/80 shadow-2xs space-y-6">
            <div className="space-y-1.5 border-b border-slate-100 pb-4">
              <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase text-[#064E3B] block">
                DIRECT INQUIRY
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Send Us an Online Message
              </h2>
              <p className="text-xs text-slate-500">
                Fill out the details below and our operations desk will review and get back to you promptly.
              </p>
            </div>

            {submitted ? (
              <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h3 className="font-black text-lg text-emerald-900">
                  Message Sent Successfully!
                </h3>
                <p className="text-xs text-emerald-700 max-w-md mx-auto leading-relaxed">
                  Thank you for contacting NookMint. An order specialist will review your request and reach out shortly via WhatsApp or phone.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Kasun Perera"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#064E3B] focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Phone Number (WhatsApp) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. 077 123 4567"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#064E3B] focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. name@example.com"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#064E3B] focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Subject
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#064E3B] focus:border-transparent transition-all bg-white"
                    >
                      <option value="Order Inquiry">Order Inquiry / Status</option>
                      <option value="Product Details">Product Specifications & Availability</option>
                      <option value="Delivery / COD">Delivery Charges & COD Areas</option>
                      <option value="Wholesale">Wholesale / Bulk Order Inquiry</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Your Message *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Provide details about your query or product requirements..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#064E3B] focus:border-transparent transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-[#064E3B] hover:bg-[#04382A] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-emerald-950/20 active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Sending Message...' : 'Submit Inquiry'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import Image from 'next/image';
import { ProductVariant } from '@/core/entities/Product';
import { Check } from 'lucide-react';

interface SizeSelectorProps {
  variants: ProductVariant[];
  selectedSize: string;
  onSelectSize: (size: string) => void;
}

export const SizeSelector: React.FC<SizeSelectorProps> = ({
  variants,
  selectedSize,
  onSelectSize,
}) => {
  return (
    <div className="flex flex-wrap gap-2.5" role="radiogroup" aria-label="Available Options & Sizes">
      {variants.map((v) => {
        const isSelected = selectedSize === v.size;
        const isOutOfStock = v.stock <= 0;

        return (
          <button
            key={v.size}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={isOutOfStock}
            onClick={() => onSelectSize(v.size)}
            className={`min-h-[42px] px-3.5 py-2 rounded-2xl text-xs font-bold transition-all border flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#064E3B] ${
              isSelected
                ? 'border-[#064E3B] bg-emerald-50 text-[#064E3B] ring-2 ring-[#064E3B]/20 shadow-2xs font-extrabold'
                : 'border-slate-200/90 bg-white text-slate-700 hover:border-emerald-600 hover:text-slate-900 shadow-2xs'
            } ${isOutOfStock ? 'opacity-40 cursor-not-allowed line-through bg-slate-50' : 'cursor-pointer active:scale-98'}`}
          >
            {/* Visual Color Dot if colorHex present */}
            {v.colorHex && (
              <span
                className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0 shadow-2xs"
                style={{ backgroundColor: v.colorHex }}
                aria-hidden="true"
              />
            )}

            {/* Thumbnail Image preview if present */}
            {v.image && (
              <span className="relative w-6 h-6 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                <Image
                  src={v.image}
                  alt={v.size}
                  fill
                  sizes="24px"
                  className="object-cover object-top"
                />
              </span>
            )}

            <span>{v.size}</span>

            {isSelected && <Check className="w-3.5 h-3.5 text-[#064E3B] ml-0.5 stroke-[2.5]" />}
          </button>
        );
      })}
    </div>
  );
};

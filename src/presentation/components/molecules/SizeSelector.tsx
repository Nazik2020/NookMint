import React from 'react';
import { ProductVariant } from '@/core/entities/Product';

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
            className={`min-h-[42px] px-4 py-2.5 rounded-xl text-xs font-bold transition-all border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#064E3B] ${
              isSelected
                ? 'border-[#064E3B] bg-emerald-50 text-[#064E3B] ring-2 ring-[#064E3B]/20 shadow-2xs font-extrabold'
                : 'border-slate-200/90 bg-white text-slate-700 hover:border-emerald-600 hover:text-slate-900'
            } ${isOutOfStock ? 'opacity-40 cursor-not-allowed line-through bg-slate-50' : 'cursor-pointer active:scale-98'}`}
          >
            {v.size}
          </button>
        );
      })}
    </div>
  );
};

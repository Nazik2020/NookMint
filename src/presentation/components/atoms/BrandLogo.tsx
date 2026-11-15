'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface BrandLogoProps {
  className?: string;
  variant?: 'navbar' | 'footer' | 'compact';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  variant = 'navbar',
}) => {
  const isFooter = variant === 'footer';
  const isCompact = variant === 'compact';

  return (
    <Link
      href="/"
      className={`inline-flex items-center group shrink-0 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004D40] rounded-xl transition-all active:scale-98 ${className}`}
      aria-label="NookMint Home"
    >
      {isFooter ? (
        /* Footer variant: High-contrast light badge so official forest-green logo details pop vividly */
        <div className="bg-white/95 hover:bg-white rounded-xl px-2.5 py-1.5 shadow-2xs transition-colors flex items-center">
          <Image
            src="/nookmint_images/logo.png"
            alt="NookMint Online Store"
            width={866}
            height={288}
            priority
            className="h-8 sm:h-9 w-auto object-contain"
          />
        </div>
      ) : (
        /* Navbar & Standard variant: Clean, prominent presentation on header canvas */
        <div className="flex items-center py-0.5">
          <Image
            src="/nookmint_images/logo.png"
            alt="NookMint Online Store"
            width={866}
            height={288}
            priority
            className={`${
              isCompact ? 'h-9 sm:h-10' : 'h-11 sm:h-12 md:h-[48px] lg:h-[52px]'
            } w-auto object-contain transition-transform group-hover:scale-102`}
          />
        </div>
      )}
    </Link>
  );
};

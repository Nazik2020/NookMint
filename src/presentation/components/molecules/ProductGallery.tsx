'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Eye, Play, Film } from 'lucide-react';

interface ProductGalleryProps {
  images: string[];
  title: string;
  videoUrl?: string;
  activeImage?: string;
  onSelectImage?: (img: string) => void;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({ images, title, videoUrl, activeImage, onSelectImage }) => {
  const safeImages = images && images.length > 0 ? images : ['/nookmint_images/hero.png'];
  const allImages = React.useMemo(() => {
    const list = [...safeImages];
    if (activeImage && !list.includes(activeImage)) {
      list.unshift(activeImage);
    }
    return list;
  }, [safeImages, activeImage]);

  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isVideoActive, setIsVideoActive] = useState<boolean>(false);

  useEffect(() => {
    if (activeImage) {
      const idx = allImages.indexOf(activeImage);
      if (idx !== -1) {
        setSelectedIndex(idx);
        setIsVideoActive(false);
      }
    }
  }, [activeImage, allImages]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isVideoActive) {
      setIsVideoActive(false);
      setSelectedIndex(allImages.length - 1);
    } else if (selectedIndex === 0 && videoUrl) {
      setIsVideoActive(true);
    } else {
      setSelectedIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isVideoActive) {
      setIsVideoActive(false);
      setSelectedIndex(0);
    } else if (selectedIndex === allImages.length - 1 && videoUrl) {
      setIsVideoActive(true);
    } else {
      setSelectedIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
    }
  };

  const currentImage = allImages[selectedIndex] || allImages[0];
  const totalMediaCount = allImages.length + (videoUrl ? 1 : 0);

  return (
    <div className="space-y-4">
      {/* Main 4:5 Aspect Studio Photo / Video Frame */}
      <div className="relative aspect-4/5 rounded-3xl overflow-hidden bg-[#FAF6F3] border border-slate-200/80 shadow-2xs group select-none">
        {isVideoActive && videoUrl ? (
          <div className="relative w-full h-full bg-slate-950 flex items-center justify-center">
            <video
              src={videoUrl}
              controls
              autoPlay
              playsInline
              loop
              className="w-full h-full object-contain"
            />
          </div>
        ) : (
          <Image
            src={currentImage}
            alt={`${title} - View ${selectedIndex + 1}`}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="object-cover object-top transition-all duration-300 group-hover:scale-103"
          />
        )}

        {/* Counter / Media Type Badge */}
        <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-slate-900/70 backdrop-blur-xs text-white text-[11px] font-mono font-bold flex items-center gap-1.5 shadow-sm z-10">
          {isVideoActive ? (
            <>
              <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
              <span>Product Video</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              <span>{selectedIndex + 1} / {totalMediaCount}</span>
            </>
          )}
        </div>

        {/* Previous & Next Arrow Controls */}
        {totalMediaCount > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/95 hover:bg-white text-slate-800 flex items-center justify-center shadow-md sm:opacity-0 sm:group-hover:opacity-100 opacity-90 transition-all duration-200 hover:scale-110 focus:opacity-100 z-10 cursor-pointer"
              title="Previous media"
              aria-label="Previous media"
            >
              <ChevronLeft className="w-5 h-5 text-slate-800" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/95 hover:bg-white text-slate-800 flex items-center justify-center shadow-md sm:opacity-0 sm:group-hover:opacity-100 opacity-90 transition-all duration-200 hover:scale-110 focus:opacity-100 z-10 cursor-pointer"
              title="Next media"
              aria-label="Next media"
            >
              <ChevronRight className="w-5 h-5 text-slate-800" />
            </button>
          </>
        )}
      </div>

      {/* Interactive Media Thumbnails Strip */}
      {totalMediaCount > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5 sm:gap-3">
          {allImages.map((img, idx) => (
            <button
              key={`${img}-${idx}`}
              type="button"
              onClick={() => {
                setIsVideoActive(false);
                setSelectedIndex(idx);
                onSelectImage?.(img);
              }}
              className={`relative aspect-square rounded-2xl overflow-hidden border-2 bg-white transition-all p-0.5 group cursor-pointer ${
                !isVideoActive && selectedIndex === idx
                  ? 'border-[#064E3B] ring-3 ring-[#064E3B]/20 shadow-xs scale-102'
                  : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
              }`}
              title={`View photo ${idx + 1}`}
            >
              <Image
                src={img}
                alt={`${title} angle ${idx + 1}`}
                fill
                sizes="120px"
                className="object-cover object-top rounded-xl"
              />
              <span className="absolute bottom-1 right-1 text-[9px] font-black px-1.5 py-0.5 rounded-md bg-black/60 text-white font-mono">
                #{idx + 1}
              </span>
            </button>
          ))}

          {/* Optional Product Video Thumbnail */}
          {videoUrl && (
            <button
              type="button"
              onClick={() => setIsVideoActive(true)}
              className={`relative aspect-square rounded-2xl overflow-hidden border-2 bg-slate-900 text-white transition-all p-1 flex flex-col items-center justify-center gap-1 group cursor-pointer ${
                isVideoActive
                  ? 'border-[#064E3B] ring-3 ring-[#064E3B]/20 shadow-xs scale-102 bg-slate-950'
                  : 'border-slate-200 hover:border-slate-300 opacity-80 hover:opacity-100'
              }`}
              title="Play product video"
            >
              <div className="w-7 h-7 rounded-full bg-emerald-600/90 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                <Play className="w-3.5 h-3.5 text-white fill-white ml-0.5" />
              </div>
              <span className="text-[10px] font-bold tracking-tight text-emerald-200">Video</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Play,
  ZoomIn,
  ZoomOut,
  Maximize2,
  X,
  RotateCcw,
} from 'lucide-react';

interface ProductGalleryProps {
  images: string[];
  title: string;
  videoUrl?: string;
  activeImage?: string;
  onSelectImage?: (img: string) => void;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({
  images,
  title,
  videoUrl,
  activeImage,
  onSelectImage,
}) => {
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

  // Desktop Hover Zoom state
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [zoomPos, setZoomPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });

  // Fullscreen Lightbox state
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const [lightboxZoom, setLightboxZoom] = useState<number>(1);

  useEffect(() => {
    if (activeImage) {
      const idx = allImages.indexOf(activeImage);
      if (idx !== -1) {
        setSelectedIndex(idx);
        setIsVideoActive(false);
      }
    }
  }, [activeImage, allImages]);

  // Lightbox keyboard shortcuts (Esc, Left, Right)
  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsLightboxOpen(false);
      } else if (e.key === 'ArrowLeft') {
        setSelectedIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
      } else if (e.key === 'ArrowRight') {
        setSelectedIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, allImages.length]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setZoomPos({ x, y });
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (isVideoActive) {
      setIsVideoActive(false);
      setSelectedIndex(allImages.length - 1);
    } else if (selectedIndex === 0 && videoUrl) {
      setIsVideoActive(true);
    } else {
      setSelectedIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
    }
    setLightboxZoom(1);
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (isVideoActive) {
      setIsVideoActive(false);
      setSelectedIndex(0);
    } else if (selectedIndex === allImages.length - 1 && videoUrl) {
      setIsVideoActive(true);
    } else {
      setSelectedIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
    }
    setLightboxZoom(1);
  };

  const currentImage = allImages[selectedIndex] || allImages[0];
  const totalMediaCount = allImages.length + (videoUrl ? 1 : 0);

  return (
    <div className="space-y-4">
      {/* Main 4:5 Aspect Studio Photo / Video Frame */}
      <div
        className={`relative aspect-4/5 rounded-3xl overflow-hidden bg-[#FAF6F3] border border-slate-200/80 shadow-2xs group select-none ${
          isVideoActive ? '' : 'cursor-zoom-in'
        }`}
        onMouseEnter={() => !isVideoActive && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseMove={handleMouseMove}
        onClick={() => {
          if (!isVideoActive) {
            setIsLightboxOpen(true);
            setLightboxZoom(1);
          }
        }}
      >
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
          <div
            className="relative w-full h-full transition-transform duration-100 ease-out will-change-transform"
            style={
              isHovered
                ? {
                    transform: 'scale(2.4)',
                    transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                  }
                : {
                    transform: 'scale(1)',
                    transformOrigin: 'center center',
                  }
            }
          >
            <Image
              src={currentImage}
              alt={`${title} - View ${selectedIndex + 1}`}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover object-top"
            />
          </div>
        )}

        {/* Counter / Media Type Badge */}
        <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-slate-900/75 backdrop-blur-xs text-white text-[11px] font-mono font-bold flex items-center gap-1.5 shadow-sm z-10 pointer-events-none">
          {isVideoActive ? (
            <>
              <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
              <span>Product Video</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                {selectedIndex + 1} / {totalMediaCount}
              </span>
            </>
          )}
        </div>

        {/* Interactive Hover Zoom & Click Hint Badge */}
        {!isVideoActive && (
          <div className="absolute bottom-3.5 right-3.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-[#064E3B] text-white text-[11px] font-bold backdrop-blur-xs flex items-center gap-1.5 shadow-md transition-all z-10 pointer-events-none">
            <ZoomIn className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">
              {isHovered ? 'Move cursor to inspect • Click to expand' : 'Hover to Zoom'}
            </span>
            <span className="sm:hidden">Tap to Zoom</span>
          </div>
        )}

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

      {/* ======================================================== */}
      {/* Fullscreen High-Resolution Lightbox Modal                */}
      {/* ======================================================== */}
      {isLightboxOpen && !isVideoActive && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200 select-none"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Top Bar with Title, Zoom Controls & Close */}
          <div
            className="flex items-center justify-between gap-4 text-white z-20 pb-3 border-b border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="min-w-0">
              <h4 className="text-sm sm:text-base font-bold text-white truncate">{title}</h4>
              <p className="text-xs text-slate-400 font-mono">
                Photo {selectedIndex + 1} of {allImages.length} • {Math.round(lightboxZoom * 100)}% Zoom
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Zoom Out Button */}
              <button
                type="button"
                onClick={() => setLightboxZoom((prev) => Math.max(1, +(prev - 0.5).toFixed(1)))}
                disabled={lightboxZoom <= 1}
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              {/* Reset Zoom Button */}
              <button
                type="button"
                onClick={() => setLightboxZoom(1)}
                className="px-2.5 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono font-bold text-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3 h-3 text-emerald-400" />
                <span>100%</span>
              </button>

              {/* Zoom In Button */}
              <button
                type="button"
                onClick={() => setLightboxZoom((prev) => Math.min(3, +(prev + 0.5).toFixed(1)))}
                disabled={lightboxZoom >= 3}
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="w-9 h-9 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white flex items-center justify-center transition-colors cursor-pointer ml-2"
                title="Close Lightbox (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Zoomable Viewport */}
          <div
            className="relative flex-1 flex items-center justify-center overflow-auto my-4 cursor-grab active:cursor-grabbing"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsLightboxOpen(false);
            }}
          >
            {/* Previous Image Arrow */}
            {allImages.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white flex items-center justify-center shadow-xl border border-slate-700 transition-all z-20 cursor-pointer"
                title="Previous Image (Left Arrow)"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* High-Resolution Center Image */}
            <div
              className="relative transition-transform duration-200 ease-out"
              style={{
                transform: `scale(${lightboxZoom})`,
                maxWidth: '90vw',
                maxHeight: '75vh',
              }}
              onClick={(e) => {
                e.stopPropagation();
                // Toggle zoom on click
                setLightboxZoom((prev) => (prev > 1 ? 1 : 2));
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentImage}
                alt={`${title} - Zoomed View ${selectedIndex + 1}`}
                className="max-w-[85vw] max-h-[72vh] object-contain rounded-2xl shadow-2xl select-none"
              />
            </div>

            {/* Next Image Arrow */}
            {allImages.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white flex items-center justify-center shadow-xl border border-slate-700 transition-all z-20 cursor-pointer"
                title="Next Image (Right Arrow)"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Bottom Thumbnails Strip inside Lightbox */}
          {allImages.length > 1 && (
            <div
              className="flex items-center justify-center gap-3 overflow-x-auto py-2 z-20 border-t border-slate-800"
              onClick={(e) => e.stopPropagation()}
            >
              {allImages.map((img, idx) => (
                <button
                  key={`lightbox-${img}-${idx}`}
                  type="button"
                  onClick={() => {
                    setSelectedIndex(idx);
                    setLightboxZoom(1);
                    onSelectImage?.(img);
                  }}
                  className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                    selectedIndex === idx
                      ? 'border-emerald-500 ring-2 ring-emerald-400 scale-105'
                      : 'border-slate-700 opacity-60 hover:opacity-100'
                  }`}
                  title={`View photo ${idx + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    alt={`Thumb ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

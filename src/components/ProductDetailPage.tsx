import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  ShoppingBag,
  Share2,
  Check,
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  X,
} from 'lucide-react';
import { FragranceProduct, DecantSize } from '../types';
import { getItemMaxStock } from '../utils/checkout';

interface ProductDetailPageProps {
  product: FragranceProduct | null;
  allProducts: FragranceProduct[];
  onNavigateHome: () => void;
  onNavigateToProduct: (product: FragranceProduct) => void;
  onAddToCart: (product: FragranceProduct, size: string, price: number, qty: number) => void;
  onBuyNow: (product: FragranceProduct, size: string, price: number, qty: number) => void;
  showToast: (msg: string) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  allProducts,
  onNavigateHome,
  onNavigateToProduct,
  onAddToCart,
  onBuyNow,
  showToast,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Desktop hover-to-zoom state
  const [canHoverZoom, setCanHoverZoom] = useState(false);
  const [isHoveringImage, setIsHoveringImage] = useState(false);
  const [hoverOrigin, setHoverOrigin] = useState({ x: 50, y: 50 });

  // Mobile zoom modal state
  const [isMobileZoomOpen, setIsMobileZoomOpen] = useState(false);
  const [mobileZoomLevel, setMobileZoomLevel] = useState<1 | 2 | 3>(2);

  // Swipe / drag gallery refs & state
  const [isDragging, setIsDragging] = useState(false);
  const galleryTrackRef = useRef<HTMLDivElement>(null);
  const selectedImageIndexRef = useRef(0);
  const dragStateRef = useRef({
    active: false,
    startX: 0,
    startScrollLeft: 0,
    moved: false,
  });
  const touchStateRef = useRef({
    active: false,
    startX: 0,
    startY: 0,
    startIndex: 0,
  });

  const hasVariants = !!product && Array.isArray(product.sizes) && product.sizes.length > 0;
  const currentSize: DecantSize = product
    ? hasVariants
      ? product.sizes[selectedSizeIndex] || product.sizes[0]
      : { size: 'Standard', price: product.startingPrice }
    : { size: 'Standard', price: 0 };
  const maxStock = product ? getItemMaxStock(product, currentSize.size) : null;

  const galleryImages = useMemo(() => {
    if (!product) return [];
    return Array.from(
      new Set(
        [
          product.image,
          ...(product.images || []),
          ...(product.additionalImages || []),
          ...(product.sizes || []).map((s) => s.image).filter(Boolean),
        ].filter(Boolean) as string[]
      )
    );
  }, [product]);

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const update = () => setCanHoverZoom(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const scrollToImage = useCallback(
    (idx: number, smooth = true) => {
      if (galleryImages.length === 0) return;
      const clamped = Math.min(galleryImages.length - 1, Math.max(0, idx));
      selectedImageIndexRef.current = clamped;
      setSelectedImageIndex(clamped);

      const track = galleryTrackRef.current;
      if (!track || track.clientWidth <= 0) return;
      track.scrollTo({
        left: clamped * track.clientWidth,
        behavior: smooth ? 'smooth' : 'auto',
      });
    },
    [galleryImages.length]
  );

  useEffect(() => {
    selectedImageIndexRef.current = 0;
    setSelectedImageIndex(0);
    setSelectedSizeIndex(0);
    setQuantity(1);
    setAdded(false);
    setIsHoveringImage(false);
    setIsMobileZoomOpen(false);
    setMobileZoomLevel(2);
    if (galleryTrackRef.current) {
      galleryTrackRef.current.scrollTo({ left: 0, behavior: 'auto' });
    }
    if (product?.id) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [product?.id]);

  useEffect(() => {
    const handleResize = () => {
      scrollToImage(selectedImageIndexRef.current, false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [scrollToImage]);

  useEffect(() => {
    if (!isMobileZoomOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileZoomOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileZoomOpen]);

  useEffect(() => {
    if (maxStock !== null && quantity > maxStock) {
      setQuantity(Math.max(1, maxStock));
    }
  }, [maxStock, quantity]);

  const handleGalleryScroll = () => {
    const track = galleryTrackRef.current;
    if (!track || track.clientWidth <= 0 || galleryImages.length <= 1) return;
    const nextIndex = Math.min(
      galleryImages.length - 1,
      Math.max(0, Math.round(track.scrollLeft / track.clientWidth))
    );
    if (nextIndex !== selectedImageIndexRef.current) {
      selectedImageIndexRef.current = nextIndex;
      setSelectedImageIndex(nextIndex);
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length !== 1) return;
    setIsHoveringImage(false);
    const touch = e.touches[0];
    touchStateRef.current = {
      active: true,
      startX: touch.clientX,
      startY: touch.clientY,
      startIndex: selectedImageIndexRef.current,
    };
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchStateRef.current.active || e.changedTouches.length === 0) return;
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStateRef.current.startX;
    const deltaY = touch.clientY - touchStateRef.current.startY;
    const startIdx = touchStateRef.current.startIndex;
    touchStateRef.current.active = false;

    const track = galleryTrackRef.current;
    if (!track || track.clientWidth <= 0 || galleryImages.length <= 1) return;

    const isHorizontalSwipe =
      Math.abs(deltaX) > 36 && Math.abs(deltaX) > Math.abs(deltaY) * 1.15;

    if (isHorizontalSwipe) {
      const currentIdx = Math.round(track.scrollLeft / track.clientWidth);
      if (currentIdx === startIdx) {
        const targetIdx = Math.min(
          galleryImages.length - 1,
          Math.max(0, deltaX < 0 ? startIdx + 1 : startIdx - 1)
        );
        scrollToImage(targetIdx, true);
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0 || galleryImages.length <= 1) return;
    const target = e.target as HTMLElement;
    if (target.closest('button, a')) return;

    const track = galleryTrackRef.current;
    if (!track) return;

    dragStateRef.current = {
      active: true,
      startX: e.clientX,
      startScrollLeft: track.scrollLeft,
      moved: false,
    };
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const track = galleryTrackRef.current;
      if (!track || !dragStateRef.current.active) return;
      const deltaX = e.clientX - dragStateRef.current.startX;
      if (Math.abs(deltaX) > 6) {
        dragStateRef.current.moved = true;
      }
      track.scrollLeft = dragStateRef.current.startScrollLeft - deltaX;
    };

    const handleMouseUp = (e: MouseEvent) => {
      const track = galleryTrackRef.current;
      if (!dragStateRef.current.active) {
        setIsDragging(false);
        return;
      }

      const deltaX = e.clientX - dragStateRef.current.startX;
      const currentScrollLeft = track ? track.scrollLeft : 0;
      const width = track ? track.clientWidth : 1;
      const baseIndex = Math.round(dragStateRef.current.startScrollLeft / Math.max(1, width));

      dragStateRef.current.active = false;
      setIsDragging(false);

      let targetIdx = Math.round(currentScrollLeft / Math.max(1, width));
      if (Math.abs(deltaX) > Math.min(60, width * 0.12)) {
        targetIdx = deltaX < 0 ? baseIndex + 1 : baseIndex - 1;
      }
      targetIdx = Math.min(galleryImages.length - 1, Math.max(0, targetIdx));

      requestAnimationFrame(() => {
        scrollToImage(targetIdx, true);
        setTimeout(() => {
          dragStateRef.current.moved = false;
        }, 50);
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, galleryImages.length, scrollToImage]);

  const handleImageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canHoverZoom || isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const x = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100));
    setHoverOrigin({ x, y });
  };

  if (!product) {
    return (
      <div className="min-h-[70vh] bg-[#F4F2EE] text-[#08090B] flex flex-col items-center justify-center px-4 py-20 text-center">
        <div className="max-w-md space-y-4">
          <h1 className="font-display font-black text-4xl sm:text-5xl uppercase text-[#08090B]">
            Product Not Found
          </h1>
          <p className="text-sm text-zinc-600 leading-relaxed">
            The product you are looking for may have sold out or been removed.
          </p>
          <div className="pt-4">
            <button
              type="button"
              onClick={onNavigateHome}
              className="btn-f1 inline-flex items-center bg-[#E10600] hover:bg-[#ff1e18] text-white px-7 py-3 font-display text-sm font-bold uppercase tracking-[0.08em] transition-colors cursor-pointer"
            >
              <span className="btn-f1-inner">
                <ArrowLeft className="w-4 h-4" />
                <span>Return To Shop</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const activeImage = galleryImages[selectedImageIndex] || product.image;
  const totalPrice = currentSize.price * quantity;

  const handleSelectVariant = (idx: number) => {
    setSelectedSizeIndex(idx);
    if (galleryImages.length === 0) return;

    const variant = product.sizes[idx];
    let targetImgIdx = -1;
    if (variant?.image) {
      targetImgIdx = galleryImages.indexOf(variant.image);
    }
    if (targetImgIdx === -1) {
      targetImgIdx = Math.min(idx, galleryImages.length - 1);
    }
    if (targetImgIdx >= 0) {
      scrollToImage(targetImgIdx, true);
    }
  };

  const sp = product.scentProfile || product.scent_profile || {};
  const fullDescription = (
    product.description ||
    sp.scentDescription ||
    product.shortDescription ||
    ''
  ).trim();

  const handleAddToCartClick = () => {
    onAddToCart(product, currentSize.size, currentSize.price, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNowClick = () => {
    onBuyNow(product, currentSize.size, currentSize.price, quantity);
  };

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    showToast('Product link copied to clipboard');
    setTimeout(() => setCopiedLink(false), 2400);
  };

  const relatedProducts = allProducts.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <div className="bg-[#F4F2EE] text-[#08090B] min-h-screen selection:bg-[#E10600] selection:text-white">
      {/* Breadcrumb Header */}
      <div className="bg-[#08090B] text-[#C4C9D4] border-b border-white/10">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between text-[11px] font-mono">
          <div className="flex items-center gap-2 truncate">
            <button
              type="button"
              onClick={onNavigateHome}
              className="hover:text-white transition-colors uppercase tracking-wider cursor-pointer"
            >
              Home
            </button>
            {product.category && (
              <>
                <ChevronRight className="w-3 h-3 text-zinc-500 shrink-0" />
                <span className="uppercase tracking-wider text-zinc-400 shrink-0">
                  {product.category}
                </span>
              </>
            )}
            <ChevronRight className="w-3 h-3 text-zinc-500 shrink-0" />
            <span className="text-white font-semibold truncate uppercase">
              {product.name}
            </span>
          </div>

          <button
            type="button"
            onClick={onNavigateHome}
            className="hidden sm:flex items-center gap-1.5 text-[#C4C9D4] hover:text-[#E10600] transition-colors uppercase tracking-wider shrink-0 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Shop</span>
          </button>
        </div>
      </div>

      {/* Main Product Hero (Gallery + Purchase Module) */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Product Gallery (Swipeable on Phone & PC + Hover Zoom on PC + Zoom Button on Phone) */}
          <div className="lg:col-span-7 flex flex-col gap-4 lg:sticky lg:top-24">
            <div
              className="relative w-full aspect-square sm:aspect-[4/3] lg:aspect-square bg-white border border-zinc-300 overflow-hidden group"
              onMouseEnter={() => {
                if (canHoverZoom) setIsHoveringImage(true);
              }}
              onMouseLeave={() => setIsHoveringImage(false)}
              onMouseMove={handleImageMouseMove}
            >
              {/* Horizontally Swipeable Photo Track */}
              <div
                ref={galleryTrackRef}
                onScroll={handleGalleryScroll}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown}
                aria-roledescription="carousel"
                aria-label="Product image gallery"
                style={{ touchAction: 'pan-x pan-y', WebkitOverflowScrolling: 'touch' }}
                className={`flex w-full h-full overflow-x-auto overflow-y-hidden no-scrollbar overscroll-x-contain select-none ${
                  isDragging
                    ? 'cursor-grabbing'
                    : canHoverZoom
                    ? 'snap-x snap-mandatory cursor-zoom-in'
                    : 'snap-x snap-mandatory'
                }`}
              >
                {galleryImages.map((img, idx) => {
                  const isZoomActive =
                    canHoverZoom && isHoveringImage && !isDragging && idx === selectedImageIndex;
                  return (
                    <div
                      key={`${img}-${idx}`}
                      className="w-full h-full shrink-0 snap-start snap-always flex items-center justify-center overflow-hidden bg-white"
                    >
                      <img
                        src={img}
                        alt={`${product.name} view ${idx + 1}`}
                        draggable={false}
                        className="w-full h-full object-contain pointer-events-none transition-transform duration-150 ease-out"
                        style={
                          isZoomActive
                            ? {
                                transform: 'scale(1.9)',
                                transformOrigin: `${hoverOrigin.x}% ${hoverOrigin.y}%`,
                              }
                            : undefined
                        }
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Desktop Prev / Next Controls */}
              {galleryImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => scrollToImage(selectedImageIndex - 1, true)}
                    disabled={selectedImageIndex === 0}
                    aria-label="Previous product image"
                    className="hidden md:flex items-center justify-center w-10 h-10 bg-white/90 hover:bg-[#08090B] hover:text-white text-[#08090B] border border-zinc-300 absolute left-3 top-1/2 -translate-y-1/2 z-20 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 disabled:opacity-0 transition-all duration-150 cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollToImage(selectedImageIndex + 1, true)}
                    disabled={selectedImageIndex === galleryImages.length - 1}
                    aria-label="Next product image"
                    className="hidden md:flex items-center justify-center w-10 h-10 bg-white/90 hover:bg-[#08090B] hover:text-white text-[#08090B] border border-zinc-300 absolute right-3 top-1/2 -translate-y-1/2 z-20 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 disabled:opacity-0 transition-all duration-150 cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Share Button */}
              <button
                type="button"
                onClick={handleCopyShareLink}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 p-2.5 bg-white/95 hover:bg-[#08090B] hover:text-white text-[#08090B] transition-colors border border-zinc-300 cursor-pointer"
                title="Share product link"
                aria-label="Share product link"
              >
                {copiedLink ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Share2 className="w-4 h-4" />
                )}
              </button>

              {/* Image Index Counter */}
              {galleryImages.length > 1 && (
                <div className="absolute bottom-3 left-3 z-20 bg-[#08090B]/80 text-white text-[10px] font-mono px-2.5 py-1 tabular-nums pointer-events-none">
                  {selectedImageIndex + 1} / {galleryImages.length}
                </div>
              )}

              {/* Phone Zoom Button */}
              <button
                type="button"
                onClick={() => {
                  setMobileZoomLevel(2);
                  setIsMobileZoomOpen(true);
                }}
                aria-label="Zoom product image"
                title="Zoom image"
                className="md:hidden absolute bottom-3 right-3 z-20 w-11 h-11 bg-[#08090B]/85 hover:bg-[#E10600] text-white border border-white/20 flex items-center justify-center shadow-lg transition-colors cursor-pointer"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
            </div>

            {galleryImages.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => scrollToImage(idx, true)}
                    className={`relative w-20 h-20 sm:w-24 sm:h-24 bg-white border transition-colors cursor-pointer overflow-hidden shrink-0 flex items-center justify-center ${
                      selectedImageIndex === idx
                        ? 'border-[#E10600] ring-1 ring-[#E10600]'
                        : 'border-zinc-300 opacity-70 hover:opacity-100 hover:border-[#08090B]'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} thumbnail ${idx + 1}`}
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Purchase Module */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-8 border border-zinc-300 space-y-6 lg:sticky lg:top-24">
            {product.category && (
              <div className="flex items-center justify-end border-b border-zinc-200 pb-3 text-[11px] font-mono uppercase tracking-[0.16em]">
                <span className="text-zinc-500">{product.category}</span>
              </div>
            )}

            {/* Product Title */}
            <div>
              <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-[#08090B] uppercase tracking-tight leading-[0.94]">
                {product.name}
              </h1>
              {product.shortDescription && (
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed mt-3">
                  {product.shortDescription}
                </p>
              )}
            </div>

            {/* Price Block */}
            <div className="bg-[#08090B] text-white p-4 sm:p-5 flex items-center justify-between border-b-2 border-[#E10600]">
              <div>
                <span className="font-mono text-[10px] tracking-[0.18em] text-[#9CA3AF] uppercase block">
                  {hasVariants ? `${currentSize.size} · ` : ''}
                  {quantity}x Unit
                </span>
                <span className="font-mono text-2xl sm:text-3xl font-bold text-white tabular-nums mt-0.5 block">
                  ৳ {totalPrice.toLocaleString()}
                </span>
              </div>
              <div className="text-right">
                <span className="font-mono text-[10px] tracking-[0.16em] uppercase text-emerald-400 font-semibold block">
                  In Stock
                </span>
              </div>
            </div>

            {/* Variant / Option Selector (Text + Price only, no image) */}
            {hasVariants && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold tracking-[0.16em] uppercase text-[#08090B]">
                    Select Option
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {product.sizes.map((s, idx) => {
                    const isSelected = selectedSizeIndex === idx;

                    return (
                      <button
                        key={s.size || idx}
                        type="button"
                        onClick={() => handleSelectVariant(idx)}
                        className={`py-2.5 px-3 border transition-colors text-center cursor-pointer ${
                          isSelected
                            ? 'border-[#E10600] bg-[#E10600] text-white'
                            : 'border-zinc-300 bg-[#F4F2EE] text-[#08090B] hover:border-[#08090B]'
                        }`}
                      >
                        <span className="text-xs font-mono font-bold uppercase block">
                          {s.size}
                        </span>
                        <span
                          className={`text-[11px] font-mono block tabular-nums mt-0.5 ${
                            isSelected ? 'text-white/95' : 'text-zinc-600'
                          }`}
                        >
                          ৳ {s.price.toLocaleString()}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity & Primary CTAs */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row items-stretch gap-3">
                <div className="flex items-center border border-zinc-300 bg-[#F4F2EE] shrink-0 justify-between sm:justify-start">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-3 text-[#08090B] hover:bg-zinc-200 transition-colors font-mono cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="px-4 py-3 text-xs font-bold font-mono min-w-[40px] text-center tabular-nums">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((q) => (maxStock !== null ? Math.min(maxStock, q + 1) : q + 1))
                    }
                    disabled={maxStock !== null && quantity >= maxStock}
                    className="px-4 py-3 text-[#08090B] hover:bg-zinc-200 transition-colors font-mono cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCartClick}
                  disabled={added}
                  className="btn-f1 flex-1 bg-[#08090B] hover:bg-[#111317] text-white py-3.5 px-6 font-display text-sm sm:text-base font-bold tracking-[0.08em] uppercase flex items-center justify-center transition-colors cursor-pointer"
                >
                  <span className="btn-f1-inner">
                    {added ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Added To Bag</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>Add To Bag</span>
                      </>
                    )}
                  </span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleBuyNowClick}
                className="btn-f1 w-full bg-[#E10600] hover:bg-[#ff1e18] text-white py-3.5 px-6 font-display text-sm sm:text-base font-bold tracking-[0.08em] uppercase flex items-center justify-center transition-colors cursor-pointer"
              >
                <span className="btn-f1-inner">
                  <span>Buy Now · ৳ {totalPrice.toLocaleString()}</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Simple Product Description */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-white border border-zinc-300 p-6 sm:p-8 space-y-3">
          <h2 className="font-display font-bold text-xl sm:text-2xl uppercase text-[#08090B] border-b border-zinc-200 pb-3">
            Description
          </h2>
          {fullDescription ? (
            <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed whitespace-pre-line max-w-4xl">
              {fullDescription}
            </p>
          ) : (
            <p className="text-xs sm:text-sm text-zinc-500">
              No description available for this product.
            </p>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-8 border-t border-zinc-300">
          <div className="mb-6">
            <h2 className="font-display text-3xl text-[#08090B] uppercase font-black tracking-tight">
              You May Also Like
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {relatedProducts.map((relProd) => (
              <div
                key={relProd.id}
                onClick={() => onNavigateToProduct(relProd)}
                className="bg-white border border-zinc-300 hover:border-[#08090B] flex flex-col justify-between cursor-pointer group transition-colors"
              >
                <div className="w-full aspect-square bg-[#FAF9F6] flex items-center justify-center overflow-hidden border-b border-zinc-200/70">
                  <img
                    src={relProd.image}
                    alt={relProd.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="p-4">
                  {relProd.category && (
                    <span className="text-[10px] font-mono tracking-[0.14em] text-zinc-500 uppercase">
                      {relProd.category}
                    </span>
                  )}
                  <h4 className="font-display text-lg font-bold uppercase text-[#08090B] mt-0.5 line-clamp-1 group-hover:text-[#E10600] transition-colors">
                    {relProd.name}
                  </h4>
                  <p className="text-xs font-mono font-bold text-[#08090B] mt-1 tabular-nums">
                    From ৳ {relProd.startingPrice.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Mobile Fullscreen Zoom Viewer */}
      {isMobileZoomOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#08090B]/95 flex flex-col select-none animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-label="Zoomed product image"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/15 bg-[#08090B] text-white shrink-0">
            <span className="font-mono text-xs uppercase tracking-wider text-[#C4C9D4] truncate pr-3">
              {product.name} · {mobileZoomLevel}x
            </span>
            <button
              type="button"
              onClick={() => setIsMobileZoomOpen(false)}
              aria-label="Close zoom viewer"
              className="w-10 h-10 border border-white/20 flex items-center justify-center text-white hover:border-[#E10600] cursor-pointer shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 2D Pannable Image Stage */}
          <div
            className={`flex-1 overflow-auto bg-white ${
              mobileZoomLevel === 1 ? 'flex items-center justify-center p-4' : 'block'
            }`}
            style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x pan-y pinch-zoom' }}
          >
            <img
              src={activeImage}
              alt={`${product.name} zoomed view`}
              className="object-contain transition-all duration-200"
              style={
                mobileZoomLevel === 1
                  ? { width: '100%', height: '100%' }
                  : {
                      width: `${mobileZoomLevel * 100}%`,
                      height: `${mobileZoomLevel * 100}%`,
                      maxWidth: 'none',
                      maxHeight: 'none',
                    }
              }
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Bottom Zoom & Image Controls */}
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-white/15 bg-[#08090B] text-white shrink-0">
            {galleryImages.length > 1 ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scrollToImage(selectedImageIndex - 1, true)}
                  disabled={selectedImageIndex === 0}
                  aria-label="Previous image"
                  className="w-10 h-10 border border-white/20 flex items-center justify-center disabled:opacity-35 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-mono text-xs tabular-nums px-1">
                  {selectedImageIndex + 1}/{galleryImages.length}
                </span>
                <button
                  type="button"
                  onClick={() => scrollToImage(selectedImageIndex + 1, true)}
                  disabled={selectedImageIndex === galleryImages.length - 1}
                  aria-label="Next image"
                  className="w-10 h-10 border border-white/20 flex items-center justify-center disabled:opacity-35 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#9CA3AF]">
                Drag to pan
              </span>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setMobileZoomLevel((z) => (z === 3 ? 2 : z === 2 ? 1 : 1))
                }
                disabled={mobileZoomLevel === 1}
                aria-label="Zoom out"
                className="w-10 h-10 border border-white/20 flex items-center justify-center disabled:opacity-35 cursor-pointer"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setMobileZoomLevel((z) => (z === 1 ? 2 : z === 2 ? 3 : 3))
                }
                disabled={mobileZoomLevel === 3}
                aria-label="Zoom in"
                className="w-10 h-10 bg-[#E10600] text-white flex items-center justify-center disabled:opacity-35 cursor-pointer"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

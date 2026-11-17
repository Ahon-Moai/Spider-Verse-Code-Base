import React, { useState, useEffect } from 'react';
import {
  ChevronRight,
  ShoppingBag,
  ShieldCheck,
  Share2,
  Check,
  Layers,
  ArrowLeft,
  Info,
  Clock,
  Box,
  PackageCheck,
} from 'lucide-react';
import { FragranceProduct, DecantSize, MainAccord } from '../types';

interface ProductDetailPageProps {
  product: FragranceProduct | null;
  allProducts: FragranceProduct[];
  onNavigateHome: () => void;
  onNavigateToProduct: (product: FragranceProduct) => void;
  onAddToCart: (product: FragranceProduct, size: string, price: number, qty: number) => void;
  onBuyNow: (product: FragranceProduct, size: string, price: number, qty: number) => void;
  showToast: (msg: string) => void;
}

const formatDivisionLabel = (gender?: string) => {
  if (!gender) return 'Collector Edition';
  if (gender === 'Him') return '1:18 Pro Diecast';
  if (gender === 'Her') return '1:43 Display Grid';
  return gender;
};

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  allProducts,
  onNavigateHome,
  onNavigateToProduct,
  onAddToCart,
  onBuyNow,
  showToast,
}) => {
  if (!product) {
    return (
      <div className="min-h-[70vh] bg-[#F4F2EE] text-[#08090B] flex flex-col items-center justify-center px-4 py-20 text-center">
        <div className="max-w-md space-y-4">
          <span className="text-xs font-mono tracking-[0.22em] text-[#E10600] uppercase font-semibold">
            Apex Paddock Garage
          </span>
          <h1 className="font-display font-black text-4xl sm:text-5xl uppercase text-[#08090B]">
            Model Not Found
          </h1>
          <p className="text-sm text-zinc-600 leading-relaxed">
            The Formula 1 scale car edition you are looking for may have sold out or been retired from the grid.
          </p>
          <div className="pt-4">
            <button
              type="button"
              onClick={onNavigateHome}
              className="btn-f1 inline-flex items-center bg-[#E10600] hover:bg-[#ff1e18] text-white px-7 py-3 font-display text-sm font-bold uppercase tracking-[0.08em] transition-colors cursor-pointer"
            >
              <span className="btn-f1-inner">
                <ArrowLeft className="w-4 h-4" />
                <span>Return To Paddock</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const galleryImages = Array.from(
    new Set(
      [
        product.image,
        ...(product.images || []),
        ...(product.additionalImages || []),
      ].filter(Boolean)
    )
  );

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'notes' | 'specs' | 'care'>('notes');

  useEffect(() => {
    setSelectedImageIndex(0);
    setSelectedSizeIndex(0);
    setQuantity(1);
    setAdded(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product.id]);

  const activeImage = galleryImages[selectedImageIndex] || product.image;
  const currentSize: DecantSize =
    product.sizes[selectedSizeIndex] ||
    product.sizes[0] || { size: '1:43 Display', price: product.startingPrice };
  const totalPrice = currentSize.price * quantity;

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
    showToast('Model link copied to clipboard');
    setTimeout(() => setCopiedLink(false), 2400);
  };

  const attributes =
    Array.isArray(product.attributes) && product.attributes.length > 0
      ? product.attributes.filter((a) => a.enabled !== false)
      : [
          { id: 'chassis-detail', name: 'Chassis Detail', value: 92, enabled: true },
          { id: 'aero-accuracy', name: 'Aero Accuracy', value: 88, enabled: true },
          { id: 'livery-finish', name: 'Livery Tampo', value: 94, enabled: true },
          { id: 'display-presence', name: 'Display Presence', value: 90, enabled: true },
        ];

  const sp = product.scentProfile || product.scent_profile || {};
  const accordsList: MainAccord[] =
    Array.isArray(sp.accords) && sp.accords.length > 0
      ? sp.accords
      : Array.isArray(product.accords) && product.accords.length > 0
      ? product.accords
      : [];

  const relatedProducts = allProducts.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <div className="bg-[#F4F2EE] text-[#08090B] min-h-screen selection:bg-[#E10600] selection:text-white">
      {/* 1. Breadcrumb Header */}
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
            <ChevronRight className="w-3 h-3 text-zinc-500 shrink-0" />
            <span className="uppercase tracking-wider text-zinc-400 shrink-0">
              {product.brand}
            </span>
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
            <span>Back to Grid</span>
          </button>
        </div>
      </div>

      {/* 2. Main Product Hero (Contiguous Gallery + Purchase Module) */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* A. Product Gallery */}
          <div className="lg:col-span-7 flex flex-col gap-4 lg:sticky lg:top-24">
            <div className="relative w-full aspect-square sm:aspect-[4/3] lg:aspect-square bg-white border border-zinc-300 flex items-center justify-center p-8 sm:p-12 overflow-hidden group">
              <img
                src={activeImage}
                alt={product.name}
                className="max-h-[82%] max-w-[82%] object-contain transition-transform duration-500 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />

              {/* Clean unboxed top-left label */}
              <div className="absolute top-4 left-4 flex items-center gap-2 text-[10px] font-mono tracking-[0.16em] uppercase text-[#08090B] bg-[#F4F2EE] border border-zinc-300 px-3 py-1.5">
                <span>Official Licensed F1 Model</span>
                {product.gender && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-[#E10600] font-semibold">
                      {formatDivisionLabel(product.gender)}
                    </span>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={handleCopyShareLink}
                className="absolute top-4 right-4 p-2.5 bg-white hover:bg-[#08090B] hover:text-white text-[#08090B] transition-colors border border-zinc-300 cursor-pointer"
                title="Share model link"
                aria-label="Share model link"
              >
                {copiedLink ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Share2 className="w-4 h-4" />
                )}
              </button>

              <div className="absolute bottom-4 right-4 text-[10px] font-mono text-zinc-400 tracking-[0.16em] uppercase">
                Zinc Alloy · Rubber Slicks
              </div>
            </div>

            {galleryImages.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-20 h-20 sm:w-24 sm:h-24 bg-white border transition-colors cursor-pointer p-2 shrink-0 flex items-center justify-center ${
                      selectedImageIndex === idx
                        ? 'border-[#E10600] ring-1 ring-[#E10600]'
                        : 'border-zinc-300 opacity-70 hover:opacity-100 hover:border-[#08090B]'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} view ${idx + 1}`}
                      className="max-h-full max-w-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* B. Contiguous Purchase Module */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-8 border border-zinc-300 space-y-6 lg:sticky lg:top-24">
            {/* Brand & ID Metadata */}
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3 text-[11px] font-mono uppercase tracking-[0.16em]">
              <span className="text-[#E10600] font-bold">
                {product.brand} · {product.concentration || 'Diecast Alloy'}
              </span>
              <span className="text-zinc-400">{product.category}</span>
            </div>

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

            {/* Price Telemetry Block */}
            <div className="bg-[#08090B] text-white p-4 sm:p-5 flex items-center justify-between border-b-2 border-[#E10600]">
              <div>
                <span className="font-mono text-[10px] tracking-[0.18em] text-[#9CA3AF] uppercase block">
                  {currentSize.size} · {quantity}x Unit
                </span>
                <span className="font-mono text-2xl sm:text-3xl font-bold text-white tabular-nums mt-0.5 block">
                  ৳ {totalPrice.toLocaleString()}
                </span>
              </div>
              <div className="text-right">
                <span className="font-mono text-[10px] tracking-[0.16em] uppercase text-emerald-400 font-semibold block">
                  In Stock
                </span>
                <span className="text-[11px] text-[#9CA3AF]">Wing-Safe Boxed</span>
              </div>
            </div>

            {/* Scale / Edition Option Cards */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold tracking-[0.16em] uppercase text-[#08090B]">
                  Select Scale / Edition
                </span>
                <span className="text-zinc-500">
                  Active: <strong className="text-[#08090B]">{currentSize.size}</strong>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {product.sizes.map((s, idx) => {
                  const isSelected = selectedSizeIndex === idx;
                  const sizeImage = s.image || activeImage;

                  return (
                    <button
                      key={s.size || idx}
                      type="button"
                      onClick={() => setSelectedSizeIndex(idx)}
                      className={`group relative flex flex-col overflow-hidden border transition-colors text-left cursor-pointer ${
                        isSelected
                          ? 'border-[#E10600] ring-1 ring-[#E10600] bg-white'
                          : 'border-zinc-300 hover:border-[#08090B] bg-white'
                      }`}
                    >
                      <div className="w-full aspect-[4/3] bg-[#FAF9F6] p-2.5 flex items-center justify-center overflow-hidden">
                        <img
                          src={sizeImage}
                          alt={s.size}
                          className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      <div
                        className={`w-full py-2 px-2 text-center transition-colors ${
                          isSelected
                            ? 'bg-[#E10600] text-white'
                            : 'bg-[#111317] text-white group-hover:bg-[#08090B]'
                        }`}
                      >
                        <span className="text-xs font-mono font-bold uppercase block">
                          {s.size}
                        </span>
                        <span className="text-[11px] font-mono block opacity-90 tabular-nums">
                          ৳ {s.price}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

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
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-3 text-[#08090B] hover:bg-zinc-200 transition-colors font-mono cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCartClick}
                  disabled={added}
                  className="btn-f1 flex-1 bg-[#08090B] hover:bg-[#1F242C] text-white py-3.5 px-6 font-display text-sm sm:text-base font-bold tracking-[0.08em] uppercase flex items-center justify-center transition-colors cursor-pointer"
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

            {/* Guarantees */}
            <div className="pt-4 border-t border-zinc-200 space-y-2.5 text-xs text-zinc-600">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#E10600] shrink-0" />
                <span>Officially licensed constructor livery and race-number markings.</span>
              </div>
              <div className="flex items-center gap-2.5">
                <PackageCheck className="w-4 h-4 text-[#08090B] shrink-0" />
                <span>Foam-cradled collector packaging protecting front and rear aero wings.</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Box className="w-4 h-4 text-[#08090B] shrink-0" />
                <span>Free nationwide shipping on orders over ৳ 3,000.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Technical Specifications, Aero & Display Telemetry */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-white border border-zinc-300 p-6 sm:p-10 space-y-10">
          {/* Tabs */}
          <div className="flex items-center gap-6 border-b border-zinc-200 overflow-x-auto no-scrollbar pb-3">
            {[
              { id: 'notes', label: 'Engineering & Livery Details' },
              { id: 'specs', label: 'Chassis Specifications' },
              { id: 'care', label: 'Display & Care' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as 'notes' | 'specs' | 'care')}
                className={`text-xs font-mono tracking-[0.16em] uppercase font-bold transition-colors pb-2 border-b-2 cursor-pointer whitespace-nowrap shrink-0 ${
                  activeTab === tab.id
                    ? 'border-[#E10600] text-[#08090B]'
                    : 'border-transparent text-zinc-400 hover:text-[#08090B]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'notes' && (
            <div className="space-y-10 animate-fade-in">
              <div className="max-w-3xl space-y-3">
                <h3 className="font-display font-bold text-2xl sm:text-3xl uppercase text-[#08090B]">
                  Aerodynamics & Livery Breakdown
                </h3>
                <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed">
                  {sp.scentDescription ||
                    product.description ||
                    product.shortDescription ||
                    'Precision-cast Formula 1 scale model engineered with multi-element aero wings, rubber Pirelli-tread slicks, and high-gloss sponsor tampos.'}
                </p>

                {sp.recommendationExplanation && (
                  <div className="bg-[#F4F2EE] border border-zinc-300 p-4 space-y-1 mt-4">
                    <span className="font-mono text-[10px] tracking-[0.18em] text-[#E10600] uppercase font-bold block">
                      Collector & Track Fit
                    </span>
                    <p className="text-xs text-zinc-800 leading-relaxed">
                      {sp.recommendationExplanation}
                    </p>
                  </div>
                )}
              </div>

              {/* Clean Text Metadata Grid */}
              {((sp.fragranceFamilies && sp.fragranceFamilies.length > 0) ||
                (sp.seasons && sp.seasons.length > 0) ||
                (sp.occasions && sp.occasions.length > 0) ||
                (sp.moods && sp.moods.length > 0)) && (
                <div className="bg-[#F4F2EE] border border-zinc-300 p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 text-xs">
                  {sp.fragranceFamilies && sp.fragranceFamilies.length > 0 && (
                    <div className="space-y-1">
                      <span className="font-mono text-[10px] uppercase text-zinc-500 block">
                        Racing Class
                      </span>
                      <p className="font-semibold text-[#08090B]">
                        {sp.fragranceFamilies.join(' · ')}
                      </p>
                    </div>
                  )}
                  {sp.seasons && sp.seasons.length > 0 && (
                    <div className="space-y-1">
                      <span className="font-mono text-[10px] uppercase text-zinc-500 block">
                        Championship Era
                      </span>
                      <p className="font-semibold text-[#08090B]">
                        {sp.seasons.join(' · ')}
                      </p>
                    </div>
                  )}
                  {sp.occasions && sp.occasions.length > 0 && (
                    <div className="space-y-1">
                      <span className="font-mono text-[10px] uppercase text-zinc-500 block">
                        Use Case
                      </span>
                      <p className="font-semibold text-[#08090B]">
                        {sp.occasions.join(' · ')}
                      </p>
                    </div>
                  )}
                  {sp.moods && sp.moods.length > 0 && (
                    <div className="space-y-1">
                      <span className="font-mono text-[10px] uppercase text-zinc-500 block">
                        Build Trim
                      </span>
                      <p className="font-semibold text-[#08090B]">
                        {sp.moods.join(' · ')}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Chassis Composition Telemetry */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
                  <h4 className="font-mono text-xs tracking-[0.16em] uppercase font-bold text-[#08090B] flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#E10600]" />
                    <span>Chassis Composition</span>
                  </h4>
                  <span className="font-mono text-[10px] text-zinc-500 uppercase">
                    Material Index
                  </span>
                </div>

                {accordsList.length > 0 ? (
                  <div className="space-y-2 max-w-xl">
                    {accordsList.map((acc, idx) => (
                      <div key={acc.id || idx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="uppercase font-semibold text-[#08090B]">{acc.name}</span>
                          <span className="text-zinc-500 tabular-nums">{acc.intensity}%</span>
                        </div>
                        <div className="w-full h-2.5 bg-[#F4F2EE] overflow-hidden">
                          <div
                            className="h-full transition-all duration-300"
                            style={{
                              width: `${Math.max(15, Math.min(100, acc.intensity))}%`,
                              backgroundColor: acc.color || '#E10600',
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500">
                    Zinc alloy monocoque · ABS carbon-effect wings · Soft-compound rubber slicks.
                  </p>
                )}

                {/* Aero & Mechanical Breakdown */}
                {((sp.topNotes && sp.topNotes.length > 0) ||
                  (sp.heartNotes && sp.heartNotes.length > 0) ||
                  (sp.baseNotes && sp.baseNotes.length > 0)) && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-zinc-200">
                    {sp.topNotes && sp.topNotes.length > 0 && (
                      <div className="bg-[#F4F2EE] border border-zinc-300 p-5 space-y-2">
                        <span className="font-mono text-[11px] tracking-[0.16em] text-[#E10600] uppercase font-bold block">
                          Front Aero & Nose
                        </span>
                        <p className="text-xs text-[#08090B] font-medium leading-relaxed">
                          {sp.topNotes.join(' · ')}
                        </p>
                      </div>
                    )}
                    {sp.heartNotes && sp.heartNotes.length > 0 && (
                      <div className="bg-[#F4F2EE] border border-zinc-300 p-5 space-y-2">
                        <span className="font-mono text-[11px] tracking-[0.16em] text-[#E10600] uppercase font-bold block">
                          Cockpit & Halo
                        </span>
                        <p className="text-xs text-[#08090B] font-medium leading-relaxed">
                          {sp.heartNotes.join(' · ')}
                        </p>
                      </div>
                    )}
                    {sp.baseNotes && sp.baseNotes.length > 0 && (
                      <div className="bg-[#F4F2EE] border border-zinc-300 p-5 space-y-2">
                        <span className="font-mono text-[11px] tracking-[0.16em] text-[#E10600] uppercase font-bold block">
                          Rear Wing & Tires
                        </span>
                        <p className="text-xs text-[#08090B] font-medium leading-relaxed">
                          {sp.baseNotes.join(' · ')}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Performance Telemetry Cards */}
              <div className="space-y-5 pt-6 border-t border-zinc-200">
                <span className="font-mono text-xs tracking-[0.16em] text-[#08090B] uppercase font-bold block">
                  Scale Craftsmanship Telemetry
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {attributes.map((attr) => {
                    const score = ((attr.value / 100) * 10).toFixed(1);
                    return (
                      <div
                        key={attr.id || attr.name}
                        className="bg-[#111317] text-white border border-[#08090B] p-5 flex flex-col justify-between space-y-3"
                      >
                        <span className="font-mono text-[10px] tracking-[0.18em] text-[#9CA3AF] uppercase">
                          {attr.name}
                        </span>
                        <div className="flex items-baseline gap-1 font-mono tabular-nums">
                          <span className="text-2xl font-bold text-white">{score}</span>
                          <span className="text-xs text-[#9CA3AF]">/ 10</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/10 overflow-hidden">
                          <div
                            className="h-full bg-[#E10600] transition-all duration-500"
                            style={{ width: `${attr.value}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => showToast('Model build rating submitted!')}
                  className="btn-f1 border-2 border-[#08090B] hover:bg-[#E10600] hover:border-[#E10600] hover:text-white text-[#08090B] py-3 px-7 font-display text-sm font-bold tracking-[0.08em] uppercase transition-colors cursor-pointer"
                >
                  <span className="btn-f1-inner">Rate Chassis Detail</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="space-y-6 animate-fade-in max-w-4xl">
              <h3 className="font-display font-bold text-2xl sm:text-3xl uppercase text-[#08090B]">
                Chassis Specifications
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {[
                  { label: 'Scale Manufacturer', value: product.brand },
                  { label: 'Build Format', value: product.concentration || 'Diecast Zinc Alloy' },
                  {
                    label: 'Racing Class',
                    value:
                      sp.fragranceFamilies && sp.fragranceFamilies.length > 0
                        ? sp.fragranceFamilies.join(', ')
                        : product.category,
                  },
                  {
                    label: 'Division',
                    value: formatDivisionLabel(sp.genderPositioning || product.gender),
                  },
                  { label: 'Wheel Steering', value: sp.intensity || 'Articulated Front Axle' },
                  { label: 'Aero Wing Detail', value: sp.projection || 'Multi-Element DRS Wing' },
                  { label: 'Tire Compound', value: sp.longevity || 'Molded Rubber Slicks' },
                  { label: 'Livery Decals', value: sp.sweetness || 'Pad-Printed Tampo' },
                  {
                    label: 'Chassis Materials',
                    value: 'Diecast Metal Monocoque · Precision ABS Aero',
                  },
                  {
                    label: 'Quality Protocol',
                    value: 'Wing & Livery Inspected · Foam-Cradled Dispatch',
                  },
                ].map((row) => (
                  <div key={row.label} className="bg-[#F4F2EE] border border-zinc-300 p-4 space-y-1">
                    <span className="font-mono text-[10px] text-zinc-500 uppercase block">
                      {row.label}
                    </span>
                    <span className="font-semibold text-[#08090B] block">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'care' && (
            <div className="space-y-6 animate-fade-in max-w-4xl text-xs sm:text-sm text-zinc-700 leading-relaxed">
              <h3 className="font-display font-bold text-2xl sm:text-3xl uppercase text-[#08090B]">
                Display & Collector Care
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#F4F2EE] border border-zinc-300 p-5 space-y-2">
                  <h4 className="font-mono font-bold text-[#08090B] uppercase tracking-wide text-xs flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#E10600]" />
                    <span>1. Unboxing & Wing Safety</span>
                  </h4>
                  <p>
                    Lift the car exclusively by the main central floor tray or engine cover rather than front wing endplates or suspension wishbones. Keep original screws for plinth display.
                  </p>
                </div>

                <div className="bg-[#F4F2EE] border border-zinc-300 p-5 space-y-2">
                  <h4 className="font-mono font-bold text-[#08090B] uppercase tracking-wide text-xs flex items-center gap-2">
                    <Info className="w-4 h-4 text-[#E10600]" />
                    <span>2. Dust & UV Preservation</span>
                  </h4>
                  <p>
                    Display away from direct midday sunlight to protect fluorescent team liveries and soft rubber tires. Use a clean anti-static brush or acrylic display cover for zero-scratch maintenance.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Related Products */}
      {relatedProducts.length > 0 && (
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-8 border-t border-zinc-300">
          <div className="mb-6">
            <span className="font-mono text-[10px] tracking-[0.2em] text-[#E10600] uppercase font-semibold block">
              Grid Teammates
            </span>
            <h2 className="font-display text-3xl text-[#08090B] uppercase font-black tracking-tight mt-0.5">
              Complete Your Starting Grid
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {relatedProducts.map((relProd) => (
              <div
                key={relProd.id}
                onClick={() => onNavigateToProduct(relProd)}
                className="bg-white border border-zinc-300 hover:border-[#08090B] p-4 flex flex-col justify-between cursor-pointer group transition-colors"
              >
                <div className="w-full aspect-square bg-[#FAF9F6] p-4 flex items-center justify-center overflow-hidden mb-3 border border-zinc-200/70">
                  <img
                    src={relProd.image}
                    alt={relProd.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-mono tracking-[0.14em] text-zinc-500 uppercase">
                    {relProd.brand}
                  </span>
                  <h4 className="font-display text-lg font-bold uppercase text-[#08090B] mt-0.5 line-clamp-1 group-hover:text-[#E10600] transition-colors">
                    {relProd.name}
                  </h4>
                  <p className="text-xs font-mono font-bold text-[#08090B] mt-1 tabular-nums">
                    From ৳ {relProd.startingPrice}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

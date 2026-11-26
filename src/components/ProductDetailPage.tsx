import React, { useState, useEffect } from 'react';
import {
  ChevronRight,
  ShoppingBag,
  Share2,
  Check,
  ArrowLeft,
} from 'lucide-react';
import { FragranceProduct, DecantSize } from '../types';

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

  useEffect(() => {
    setSelectedImageIndex(0);
    setSelectedSizeIndex(0);
    setQuantity(1);
    setAdded(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product.id]);

  const activeImage = galleryImages[selectedImageIndex] || product.image;
  const hasVariants = Array.isArray(product.sizes) && product.sizes.length > 0;
  const currentSize: DecantSize = hasVariants
    ? product.sizes[selectedSizeIndex] || product.sizes[0]
    : { size: 'Standard', price: product.startingPrice };
  const totalPrice = currentSize.price * quantity;

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
          {/* Product Gallery */}
          <div className="lg:col-span-7 flex flex-col gap-4 lg:sticky lg:top-24">
            <div className="relative w-full aspect-square sm:aspect-[4/3] lg:aspect-square bg-white border border-zinc-300 flex items-center justify-center p-8 sm:p-12 overflow-hidden group">
              <img
                src={activeImage}
                alt={product.name}
                className="max-h-[85%] max-w-[85%] object-contain transition-transform duration-500 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />

              <button
                type="button"
                onClick={handleCopyShareLink}
                className="absolute top-4 right-4 p-2.5 bg-white hover:bg-[#08090B] hover:text-white text-[#08090B] transition-colors border border-zinc-300 cursor-pointer"
                title="Share product link"
                aria-label="Share product link"
              >
                {copiedLink ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Share2 className="w-4 h-4" />
                )}
              </button>
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
                        onClick={() => setSelectedSizeIndex(idx)}
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
    </div>
  );
};

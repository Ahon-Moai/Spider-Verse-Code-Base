import React, { useState, useEffect } from 'react';
import {
  ChevronRight,
  ShoppingBag,
  ArrowLeft,
  ChevronDown,
  Plus,
} from 'lucide-react';
import { FragranceProduct, Collection, DecantSize } from '../types';
import { fetchCollectionBySlug, fetchPublicProducts } from '../services/api';

const getScaleSpecLabel = (sizeStr: string): string => {
  const s = sizeStr.toLowerCase();
  if (s.includes('1:18')) return '~31cm Alloy';
  if (s.includes('1:24')) return '~23cm Alloy';
  if (s.includes('1:43')) return '~13cm Display';
  if (s.includes('1:64')) return '~8cm Pocket';
  if (s.includes('rc')) return '2.4GHz Radio';
  return 'Collector Spec';
};

const formatDivisionLabel = (gender?: string) => {
  if (!gender) return '';
  if (gender === 'Him') return '1:18 Pro';
  if (gender === 'Her') return '1:43 Display';
  return gender;
};

const CollectionProductCard: React.FC<{
  product: FragranceProduct;
  onNavigateToProduct: (product: FragranceProduct) => void;
  onAddToCart: (product: FragranceProduct, size: string, price: number, qty: number) => void;
}> = ({ product, onNavigateToProduct, onAddToCart }) => {
  const defaultSize = product.sizes?.[0] || { size: '1:43 Display', price: product.startingPrice };
  const [selectedSize, setSelectedSize] = useState<DecantSize>(defaultSize);

  return (
    <div
      onClick={() => onNavigateToProduct(product)}
      className="group bg-transparent border-0 sm:bg-white sm:border sm:border-zinc-200/90 sm:hover:border-[#08090B] transition-all duration-200 sm:hover:-translate-y-0.5 flex flex-col justify-between cursor-pointer h-full"
    >
      <div>
        <div className="relative w-full aspect-square bg-transparent sm:bg-[#FAF9F6] border-0 sm:border-b sm:border-zinc-200/70 flex items-center justify-center overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            decoding="async"
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            referrerPolicy="no-referrer"
          />

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product, selectedSize.size, selectedSize.price, 1);
            }}
            className="absolute bottom-2 right-2 sm:bottom-2.5 sm:right-2.5 bg-[#08090B] hover:bg-[#E10600] text-white p-2 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
            aria-label={`Quick add ${selectedSize.size} ${product.name}`}
            title={`Quick add ${selectedSize.size}`}
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="px-0 pt-2.5 pb-1.5 sm:p-4 sm:pb-2 space-y-1">
          <div className="flex items-center justify-between gap-2 text-[10px] font-mono tracking-[0.12em] sm:tracking-[0.14em] text-zinc-500 uppercase">
            <span className="truncate">{product.brand}</span>
            {product.gender && (
              <span className="text-[#E10600] font-semibold shrink-0">
                {formatDivisionLabel(product.gender)}
              </span>
            )}
          </div>
          <h3 className="font-display text-base sm:text-xl font-bold uppercase text-[#08090B] leading-tight line-clamp-2 sm:line-clamp-1 group-hover:text-[#E10600] transition-colors">
            {product.name}
          </h3>
          <p className="text-[11px] font-mono text-zinc-500 uppercase truncate">
            {product.category}
          </p>
        </div>
      </div>

      <div className="px-0 pt-1.5 pb-1 sm:p-4 sm:pt-3 sm:mt-1 border-0 sm:border-t sm:border-zinc-200/80 space-y-2 sm:space-y-2.5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-baseline justify-between gap-2 tabular-nums">
          <span className="font-mono text-sm font-bold text-[#08090B] shrink-0">
            ৳ {selectedSize.price.toLocaleString()}
          </span>
          <span className="font-mono text-[10px] sm:text-[11px] text-zinc-500 truncate">{selectedSize.size}</span>
        </div>

        {product.sizes && product.sizes.length > 0 && (
          <div className="relative">
            <select
              value={selectedSize.size}
              onChange={(e) => {
                const matched = product.sizes.find((s) => s.size === e.target.value);
                if (matched) setSelectedSize(matched);
              }}
              aria-label={`Select scale for ${product.name}`}
              className="w-full appearance-none bg-white/80 sm:bg-[#F4F2EE] hover:bg-zinc-200/70 border border-zinc-300 text-[#08090B] text-[11px] font-mono py-2 pl-2 sm:pl-2.5 pr-6 sm:pr-7 focus:outline-none focus:border-[#08090B] cursor-pointer transition-colors"
            >
              {product.sizes.map((sz, idx) => (
                <option key={sz.size || idx} value={sz.size}>
                  {sz.size} ({getScaleSpecLabel(sz.size)}) — ৳{sz.price}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-600 absolute right-2 sm:right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        )}

        <button
          type="button"
          onClick={() => onAddToCart(product, selectedSize.size, selectedSize.price, 1)}
          className="btn-f1 w-full bg-[#E10600] hover:bg-[#ff1e18] text-white py-2 sm:py-2.5 font-display text-xs sm:text-sm font-bold uppercase tracking-[0.08em] flex items-center justify-center transition-colors cursor-pointer"
        >
          <span className="btn-f1-inner">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Add To Bag</span>
          </span>
        </button>
      </div>
    </div>
  );
};

interface CollectionPageProps {
  collectionSlug: string;
  allProducts: FragranceProduct[];
  onNavigateHome: () => void;
  onNavigateToCollection: (slug: string) => void;
  onNavigateToProduct: (product: FragranceProduct) => void;
  onAddToCart: (product: FragranceProduct, size: string, price: number, qty: number) => void;
  showToast: (msg: string) => void;
}

export const CollectionPage: React.FC<CollectionPageProps> = ({
  collectionSlug,
  onNavigateHome,
  onNavigateToProduct,
  onAddToCart,
}) => {
  const [collection, setCollection] = useState<Collection | null>(null);
  const [filteredProducts, setFilteredProducts] = useState<FragranceProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [sortBy, setSortBy] = useState<string>(() => {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get('sort') || 'featured';
  });

  function ucwords(str: string) {
    return str.replace(/\b\w/g, (l) => l.toUpperCase());
  }

  useEffect(() => {
    let isMounted = true;
    fetchCollectionBySlug(collectionSlug).then((col) => {
      if (isMounted) {
        if (col) {
          const normalizedTitle =
            /^all fragrances?$/i.test((col.title || '').trim()) ||
            (collectionSlug === 'all' && /fragrance/i.test(col.title || ''))
              ? 'All Products'
              : col.title;
          setCollection({ ...col, title: normalizedTitle });
          document.title = `${normalizedTitle} — SPIDER VERSE`;
        } else {
          const formattedTitle =
            collectionSlug === 'all' ? 'All Products' : ucwords(collectionSlug.replace(/-/g, ' '));
          setCollection({
            id: 'col-' + collectionSlug,
            title: formattedTitle,
            slug: collectionSlug,
            description: `Curated ${formattedTitle} collection.`,
          });
          document.title = `${formattedTitle} — SPIDER VERSE`;
        }
      }
    });
    return () => {
      isMounted = false;
    };
  }, [collectionSlug]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (sortBy && sortBy !== 'featured') params.set('sort', sortBy);
    const queryStr = params.toString();
    const newRelativePathQuery = window.location.pathname + (queryStr ? '?' + queryStr : '');
    window.history.replaceState(null, '', newRelativePathQuery);
  }, [sortBy, collectionSlug]);

  useEffect(() => {
    let isMounted = true;
    setLoadingProducts(true);

    fetchPublicProducts({
      collection: collectionSlug,
      sort: sortBy,
    }).then((prods) => {
      if (isMounted) {
        setFilteredProducts(prods || []);
        setLoadingProducts(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [collectionSlug, sortBy]);

  return (
    <div className="bg-[#F4F2EE] text-[#08090B] min-h-screen selection:bg-[#E10600] selection:text-white">
      {/* 1. Dark Breadcrumb Bar */}
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
            <span className="text-white font-semibold truncate uppercase">
              {collection?.title || ucwords(collectionSlug.replace(/-/g, ' '))}
            </span>
          </div>

          <button
            type="button"
            onClick={onNavigateHome}
            className="hidden sm:flex items-center gap-1.5 text-[#C4C9D4] hover:text-[#E10600] transition-colors uppercase tracking-wider shrink-0 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Paddock</span>
          </button>
        </div>
      </div>

      {/* 2. Dark Obsidian Collection Banner */}
      <div className="bg-[#111317] text-white border-b border-white/10 relative overflow-hidden">
        {collection?.image && (
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-25 pointer-events-none hidden md:block">
            <img src={collection.image} alt={collection.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#111317] via-[#111317]/75 to-transparent" />
          </div>
        )}

        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 relative z-10 space-y-3">
          <span className="font-mono text-[10px] tracking-[0.22em] text-[#E10600] uppercase font-semibold block">
            Spider Verse Series Editions
          </span>
          <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl uppercase tracking-tight text-white leading-none">
            {collection?.title || (collectionSlug === 'all' ? 'All Products' : ucwords(collectionSlug.replace(/-/g, ' ')))}
          </h1>
          <p className="text-xs sm:text-sm text-[#C4C9D4] max-w-2xl leading-relaxed">
            {collection?.description && !/fragrance|decant|flacon/i.test(collection.description)
              ? collection.description
              : 'Precision Formula 1 diecast toy cars and RC race models engineered for display and high-speed play.'}
          </p>
          <div className="pt-2 flex items-center gap-3 text-xs font-mono text-[#9CA3AF] tabular-nums">
            <span>{filteredProducts.length} Models Available</span>
            <span aria-hidden="true">·</span>
            <span className="text-white">Officially Licensed Liveries</span>
          </div>
        </div>
      </div>

      {/* 3. Main Catalog Layout */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Control Bar */}
        <div className="bg-white border border-zinc-300 p-4 mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <span className="text-xs text-zinc-600 font-mono">
            Showing <strong className="text-[#08090B] tabular-nums">{filteredProducts.length}</strong> products
          </span>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider hidden sm:inline">
              Sort By:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#F4F2EE] border border-zinc-300 text-[#08090B] text-xs font-mono px-3 py-2 focus:outline-none focus:border-[#08090B] cursor-pointer"
            >
              <option value="featured">Featured</option>
              <option value="best-selling">Best Selling</option>
              <option value="newest">Newest Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
            </select>
          </div>
        </div>

        {/* Full-Width Product Grid */}
        {loadingProducts ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((idx) => (
              <div key={idx} className="bg-white border border-zinc-200 p-4 space-y-3">
                <div className="w-full aspect-square bg-zinc-200/70" />
                <div className="h-3 bg-zinc-200/70 w-1/2" />
                <div className="h-4 bg-zinc-200 w-3/4" />
                <div className="h-3 bg-zinc-200/70 w-1/3" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white border border-zinc-300 p-12 text-center space-y-4">
            <h3 className="font-display font-bold text-2xl uppercase text-[#08090B]">
              No Products Found
            </h3>
            <p className="text-xs text-zinc-600 max-w-md mx-auto leading-relaxed">
              No items are currently assigned to this category.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={onNavigateHome}
                className="btn-f1 inline-flex items-center bg-[#E10600] hover:bg-[#ff1e18] text-white px-7 py-2.5 font-display text-sm font-bold uppercase tracking-[0.08em] transition-colors cursor-pointer"
              >
                <span className="btn-f1-inner">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Shop</span>
                </span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-3.5 gap-y-7 sm:gap-5">
            {filteredProducts.map((product) => (
              <CollectionProductCard
                key={product.id}
                product={product}
                onNavigateToProduct={onNavigateToProduct}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

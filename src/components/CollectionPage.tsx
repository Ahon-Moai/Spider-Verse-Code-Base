import React, { useState, useEffect, useMemo } from 'react';
import {
  ChevronRight,
  X,
  ShoppingBag,
  ArrowLeft,
  Filter,
  RefreshCw,
  ChevronDown,
  Plus,
} from 'lucide-react';
import { FragranceProduct, Collection, FilterState, DecantSize } from '../types';
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
      className="group bg-white border border-zinc-200/90 hover:border-[#08090B] transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between p-4 cursor-pointer"
    >
      <div>
        <div className="relative w-full aspect-square bg-[#FAF9F6] border border-zinc-200/70 p-4 flex items-center justify-center overflow-hidden mb-3.5">
          <img
            src={product.image}
            alt={product.name}
            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            referrerPolicy="no-referrer"
          />

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product, selectedSize.size, selectedSize.price, 1);
            }}
            className="absolute bottom-2.5 right-2.5 bg-[#08090B] hover:bg-[#E10600] text-white p-2 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
            aria-label={`Quick add ${selectedSize.size} ${product.name}`}
            title={`Quick add ${selectedSize.size}`}
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono tracking-[0.14em] text-zinc-500 uppercase">
            <span className="truncate">{product.brand}</span>
            {product.gender && (
              <span className="text-[#E10600] font-semibold">
                {formatDivisionLabel(product.gender)}
              </span>
            )}
          </div>
          <h3 className="font-display text-lg sm:text-xl font-bold uppercase text-[#08090B] leading-tight line-clamp-1 group-hover:text-[#E10600] transition-colors">
            {product.name}
          </h3>
          <p className="text-[11px] font-mono text-zinc-500 uppercase truncate">
            {product.category}
          </p>
        </div>
      </div>

      <div className="pt-3 mt-3 border-t border-zinc-200/80 space-y-2.5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-baseline justify-between tabular-nums">
          <span className="font-mono text-sm font-bold text-[#08090B]">
            ৳ {selectedSize.price.toLocaleString()}
          </span>
          <span className="font-mono text-[11px] text-zinc-500">{selectedSize.size}</span>
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
              className="w-full appearance-none bg-[#F4F2EE] hover:bg-zinc-200/70 border border-zinc-300 text-[#08090B] text-[11px] font-mono py-2 pl-2.5 pr-7 focus:outline-none focus:border-[#08090B] cursor-pointer transition-colors"
            >
              {product.sizes.map((sz, idx) => (
                <option key={sz.size || idx} value={sz.size}>
                  {sz.size} ({getScaleSpecLabel(sz.size)}) — ৳{sz.price}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-600 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        )}

        <button
          type="button"
          onClick={() => onAddToCart(product, selectedSize.size, selectedSize.price, 1)}
          className="btn-f1 w-full bg-[#E10600] hover:bg-[#ff1e18] text-white py-2.5 font-display text-sm font-bold uppercase tracking-[0.08em] flex items-center justify-center transition-colors cursor-pointer"
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

const DEFAULT_FILTER_STATE: FilterState = {
  gender: [],
  family: [],
  season: [],
  occasion: [],
  brand: [],
  size: [],
  concentration: [],
  minPrice: '',
  maxPrice: '',
  featured: false,
  newArrival: false,
  sort: 'featured',
  search: '',
};

export const CollectionPage: React.FC<CollectionPageProps> = ({
  collectionSlug,
  allProducts,
  onNavigateHome,
  onNavigateToProduct,
  onAddToCart,
  showToast,
}) => {
  const [collection, setCollection] = useState<Collection | null>(null);
  const [filteredProducts, setFilteredProducts] = useState<FragranceProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const [filters, setFilters] = useState<FilterState>(() => {
    const searchParams = new URLSearchParams(window.location.search);
    return {
      gender: searchParams.get('gender') ? searchParams.get('gender')!.split(',') : [],
      family: searchParams.get('family') ? searchParams.get('family')!.split(',') : [],
      season: searchParams.get('season') ? searchParams.get('season')!.split(',') : [],
      occasion: searchParams.get('occasion') ? searchParams.get('occasion')!.split(',') : [],
      brand: searchParams.get('brand') ? searchParams.get('brand')!.split(',') : [],
      size: searchParams.get('size') ? searchParams.get('size')!.split(',') : [],
      concentration: searchParams.get('concentration')
        ? searchParams.get('concentration')!.split(',')
        : [],
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      featured: searchParams.get('featured') === 'true',
      newArrival: searchParams.get('newArrival') === 'true',
      sort: searchParams.get('sort') || 'featured',
      search: searchParams.get('search') || '',
    };
  });

  function ucwords(str: string) {
    return str.replace(/\b\w/g, (l) => l.toUpperCase());
  }

  useEffect(() => {
    let isMounted = true;
    fetchCollectionBySlug(collectionSlug).then((col) => {
      if (isMounted) {
        if (col) {
          setCollection(col);
          document.title = `${col.title} — APEX PADDOCK`;
        } else {
          const formattedTitle = ucwords(collectionSlug.replace(/-/g, ' '));
          setCollection({
            id: 'col-' + collectionSlug,
            title: formattedTitle,
            slug: collectionSlug,
            description: `Curated ${formattedTitle} Formula 1 toy cars and scale models.`,
          });
          document.title = `${formattedTitle} — APEX PADDOCK`;
        }
      }
    });
    return () => {
      isMounted = false;
    };
  }, [collectionSlug]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.gender.length) params.set('gender', filters.gender.join(','));
    if (filters.family.length) params.set('family', filters.family.join(','));
    if (filters.season.length) params.set('season', filters.season.join(','));
    if (filters.occasion.length) params.set('occasion', filters.occasion.join(','));
    if (filters.brand.length) params.set('brand', filters.brand.join(','));
    if (filters.size.length) params.set('size', filters.size.join(','));
    if (filters.concentration.length) params.set('concentration', filters.concentration.join(','));
    if (filters.minPrice) params.set('minPrice', filters.minPrice);
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
    if (filters.featured) params.set('featured', 'true');
    if (filters.newArrival) params.set('newArrival', 'true');
    if (filters.sort && filters.sort !== 'featured') params.set('sort', filters.sort);
    if (filters.search) params.set('search', filters.search);

    const queryStr = params.toString();
    const newRelativePathQuery = window.location.pathname + (queryStr ? '?' + queryStr : '');
    window.history.replaceState(null, '', newRelativePathQuery);
  }, [filters, collectionSlug]);

  useEffect(() => {
    let isMounted = true;
    setLoadingProducts(true);

    const queryParams: Record<string, string> = {
      collection: collectionSlug,
      sort: filters.sort,
    };

    if (filters.gender.length) queryParams.gender = filters.gender.join(',');
    if (filters.family.length) queryParams.family = filters.family.join(',');
    if (filters.season.length) queryParams.season = filters.season.join(',');
    if (filters.occasion.length) queryParams.occasion = filters.occasion.join(',');
    if (filters.brand.length) queryParams.brand = filters.brand.join(',');
    if (filters.size.length) queryParams.size = filters.size.join(',');
    if (filters.concentration.length) queryParams.concentration = filters.concentration.join(',');
    if (filters.minPrice) queryParams.min_price = filters.minPrice;
    if (filters.maxPrice) queryParams.max_price = filters.maxPrice;
    if (filters.featured) queryParams.featured = '1';
    if (filters.newArrival) queryParams.new_arrival = '1';
    if (filters.search) queryParams.search = filters.search;

    fetchPublicProducts(queryParams).then((prods) => {
      if (isMounted) {
        setFilteredProducts(prods || []);
        setLoadingProducts(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [collectionSlug, filters]);

  const availableBrands = useMemo(() => {
    const set = new Set<string>();
    allProducts.forEach((p) => {
      if (p.brand) set.add(p.brand);
    });
    return Array.from(set).sort();
  }, [allProducts]);

  const DIVISION_OPTIONS = [
    { label: '1:18 Pro Diecast', value: 'Him' },
    { label: '1:43 Acrylic Grid', value: 'Her' },
    { label: 'RC & Track Play', value: 'Unisex' },
  ];

  const CLASS_OPTIONS = [
    'Modern Ground Effect',
    'Classic V10 / V8 Era',
    'Street Circuit Livery',
    'Carbon Test Spec',
    '2.4GHz RC Sprint',
    'Championship Edition',
    'Pit-Stop Diorama',
    'Team Twin Pack',
  ];

  const ERA_OPTIONS = ['2026 Grid', '2025 Season', '2024 Season', '2010s Hybrid', '1990s Legends'];
  const USAGE_OPTIONS = [
    'Desk & Shelf Display',
    'Acrylic Showcase',
    'RC Track Racing',
    'Kids & Gift Sets',
    'Diorama Building',
  ];
  const SCALE_OPTIONS = ['1:18', '1:24', '1:43', '1:64', 'RC Pro'];
  const BUILD_OPTIONS = ['Diecast Alloy', 'Resin Collector', '2.4GHz RC', 'Pull-Back'];

  const toggleArrayFilter = (group: keyof FilterState, val: string) => {
    setFilters((prev) => {
      const current = Array.isArray(prev[group]) ? (prev[group] as string[]) : [];
      const exists = current.includes(val);
      const updated = exists ? current.filter((item) => item !== val) : [...current, val];
      return { ...prev, [group]: updated };
    });
  };

  const handleClearAllFilters = () => {
    setFilters({ ...DEFAULT_FILTER_STATE, sort: filters.sort });
    showToast('Filters cleared');
  };

  const activeFilterCount =
    filters.gender.length +
    filters.family.length +
    filters.season.length +
    filters.occasion.length +
    filters.brand.length +
    filters.size.length +
    filters.concentration.length +
    (filters.minPrice ? 1 : 0) +
    (filters.maxPrice ? 1 : 0) +
    (filters.featured ? 1 : 0) +
    (filters.newArrival ? 1 : 0) +
    (filters.search ? 1 : 0);

  const FilterContent = () => (
    <div className="space-y-6 text-xs text-zinc-800">
      <div className="space-y-1.5">
        <label className="block font-mono text-[10px] tracking-widest text-zinc-500 uppercase font-semibold">
          Search Grid
        </label>
        <input
          type="text"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          placeholder="Team, driver, scale or car..."
          className="w-full bg-[#F4F2EE] border border-zinc-300 px-3 py-2 text-xs text-[#08090B] focus:outline-none focus:border-[#08090B]"
        />
      </div>

      <div className="space-y-2 pt-3 border-t border-zinc-200">
        <span className="block font-mono text-[10px] tracking-widest text-zinc-500 uppercase font-bold">
          Division
        </span>
        <div className="space-y-1.5">
          {DIVISION_OPTIONS.map((g) => {
            const isChecked = filters.gender.includes(g.value);
            return (
              <label key={g.value} className="flex items-center gap-2 cursor-pointer py-0.5">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleArrayFilter('gender', g.value)}
                  className="accent-[#E10600] cursor-pointer"
                />
                <span className={isChecked ? 'font-semibold text-[#08090B]' : 'text-zinc-700'}>
                  {g.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="space-y-2 pt-3 border-t border-zinc-200">
        <span className="block font-mono text-[10px] tracking-widest text-zinc-500 uppercase font-bold">
          Racing Class
        </span>
        <div className="space-y-1.5 max-h-48 overflow-y-auto no-scrollbar pr-1">
          {CLASS_OPTIONS.map((fam) => {
            const isChecked = filters.family.includes(fam);
            return (
              <label key={fam} className="flex items-center gap-2 cursor-pointer py-0.5">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleArrayFilter('family', fam)}
                  className="accent-[#E10600] cursor-pointer"
                />
                <span className={isChecked ? 'font-semibold text-[#08090B]' : 'text-zinc-700'}>
                  {fam}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="space-y-2 pt-3 border-t border-zinc-200">
        <span className="block font-mono text-[10px] tracking-widest text-zinc-500 uppercase font-bold">
          Season Era
        </span>
        <div className="space-y-1.5">
          {ERA_OPTIONS.map((season) => {
            const isChecked = filters.season.includes(season);
            return (
              <label key={season} className="flex items-center gap-2 cursor-pointer py-0.5">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleArrayFilter('season', season)}
                  className="accent-[#E10600] cursor-pointer"
                />
                <span className={isChecked ? 'font-semibold text-[#08090B]' : 'text-zinc-700'}>
                  {season}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {availableBrands.length > 0 && (
        <div className="space-y-2 pt-3 border-t border-zinc-200">
          <span className="block font-mono text-[10px] tracking-widest text-zinc-500 uppercase font-bold">
            Maker / Constructor
          </span>
          <div className="space-y-1.5 max-h-44 overflow-y-auto no-scrollbar pr-1">
            {availableBrands.map((b) => {
              const isChecked = filters.brand.includes(b);
              return (
                <label key={b} className="flex items-center gap-2 cursor-pointer py-0.5">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleArrayFilter('brand', b)}
                    className="accent-[#E10600] cursor-pointer"
                  />
                  <span className={isChecked ? 'font-semibold text-[#08090B]' : 'text-zinc-700'}>
                    {b}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-2 pt-3 border-t border-zinc-200">
        <span className="block font-mono text-[10px] tracking-widest text-zinc-500 uppercase font-bold">
          Display & Play
        </span>
        <div className="space-y-1.5 max-h-40 overflow-y-auto no-scrollbar pr-1">
          {USAGE_OPTIONS.map((occ) => {
            const isChecked = filters.occasion.includes(occ);
            return (
              <label key={occ} className="flex items-center gap-2 cursor-pointer py-0.5">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleArrayFilter('occasion', occ)}
                  className="accent-[#E10600] cursor-pointer"
                />
                <span className={isChecked ? 'font-semibold text-[#08090B]' : 'text-zinc-700'}>
                  {occ}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="space-y-2 pt-3 border-t border-zinc-200">
        <span className="block font-mono text-[10px] tracking-widest text-zinc-500 uppercase font-bold">
          Scale Ratio
        </span>
        <div className="flex flex-wrap gap-1.5">
          {SCALE_OPTIONS.map((sz) => {
            const isChecked = filters.size.includes(sz);
            return (
              <button
                key={sz}
                type="button"
                onClick={() => toggleArrayFilter('size', sz)}
                className={`px-2.5 py-1 text-[11px] border transition-colors cursor-pointer font-mono ${
                  isChecked
                    ? 'bg-[#E10600] text-white border-[#E10600]'
                    : 'bg-[#F4F2EE] text-zinc-700 border-zinc-300 hover:border-[#08090B]'
                }`}
              >
                {sz}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2 pt-3 border-t border-zinc-200">
        <span className="block font-mono text-[10px] tracking-widest text-zinc-500 uppercase font-bold">
          Build Material
        </span>
        <div className="space-y-1.5">
          {BUILD_OPTIONS.map((c) => {
            const isChecked = filters.concentration.includes(c);
            return (
              <label key={c} className="flex items-center gap-2 cursor-pointer py-0.5">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleArrayFilter('concentration', c)}
                  className="accent-[#E10600] cursor-pointer"
                />
                <span className={isChecked ? 'font-semibold text-[#08090B]' : 'text-zinc-700'}>
                  {c}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="space-y-2 pt-3 border-t border-zinc-200">
        <span className="block font-mono text-[10px] tracking-widest text-zinc-500 uppercase font-bold">
          Price Range (৳)
        </span>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={filters.minPrice}
            onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
            placeholder="Min ৳"
            className="w-1/2 bg-[#F4F2EE] border border-zinc-300 px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:border-[#08090B]"
          />
          <span className="text-zinc-400 font-mono">-</span>
          <input
            type="number"
            value={filters.maxPrice}
            onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
            placeholder="Max ৳"
            className="w-1/2 bg-[#F4F2EE] border border-zinc-300 px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:border-[#08090B]"
          />
        </div>
      </div>

      <div className="space-y-2 pt-3 border-t border-zinc-200">
        <span className="block font-mono text-[10px] tracking-widest text-zinc-500 uppercase font-bold">
          Highlights
        </span>
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 cursor-pointer py-0.5">
            <input
              type="checkbox"
              checked={filters.featured}
              onChange={(e) => setFilters({ ...filters, featured: e.target.checked })}
              className="accent-[#E10600] cursor-pointer"
            />
            <span className={filters.featured ? 'font-semibold text-[#08090B]' : 'text-zinc-700'}>
              Best Sellers / Pole Picks
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer py-0.5">
            <input
              type="checkbox"
              checked={filters.newArrival}
              onChange={(e) => setFilters({ ...filters, newArrival: e.target.checked })}
              className="accent-[#E10600] cursor-pointer"
            />
            <span className={filters.newArrival ? 'font-semibold text-[#08090B]' : 'text-zinc-700'}>
              New Arrivals
            </span>
          </label>
        </div>
      </div>

      {activeFilterCount > 0 && (
        <button
          type="button"
          onClick={handleClearAllFilters}
          className="btn-f1 w-full py-2.5 bg-[#08090B] hover:bg-[#E10600] text-white font-display text-sm font-bold uppercase tracking-[0.08em] transition-colors cursor-pointer"
        >
          <span className="btn-f1-inner">Clear All ({activeFilterCount})</span>
        </button>
      )}
    </div>
  );

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
            <span className="uppercase tracking-wider text-zinc-400 shrink-0">Series</span>
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
            Apex Paddock Series Editions
          </span>
          <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl uppercase tracking-tight text-white leading-none">
            {collection?.title || ucwords(collectionSlug.replace(/-/g, ' '))}
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
          <div className="flex items-center justify-between sm:justify-start gap-4">
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(true)}
              className="btn-f1 lg:hidden inline-flex items-center bg-[#08090B] hover:bg-[#E10600] text-white px-5 py-2 font-display text-sm uppercase tracking-[0.08em] font-bold transition-colors cursor-pointer"
            >
              <span className="btn-f1-inner">
                <Filter className="w-3.5 h-3.5" />
                <span>Filter ({activeFilterCount})</span>
              </span>
            </button>

            <span className="text-xs text-zinc-600 font-mono">
              Showing <strong className="text-[#08090B] tabular-nums">{filteredProducts.length}</strong> F1 models
            </span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider hidden sm:inline">
              Sort By:
            </span>
            <select
              value={filters.sort}
              onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
              className="bg-[#F4F2EE] border border-zinc-300 text-[#08090B] text-xs font-mono px-3 py-2 focus:outline-none focus:border-[#08090B] cursor-pointer"
            >
              <option value="featured">Featured / Pole Picks</option>
              <option value="best-selling">Best Selling</option>
              <option value="newest">Newest Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Model: A to Z</option>
            </select>
          </div>
        </div>

        {/* Active Filter Tags */}
        {activeFilterCount > 0 && (
          <div className="bg-white border border-zinc-300 p-3 mb-6 flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className="text-[10px] uppercase text-zinc-500 tracking-wider">Active:</span>

            {[
              ...filters.gender.map((g) => ({
                key: `gender-${g}`,
                label: `Division: ${formatDivisionLabel(g)}`,
                onRemove: () => toggleArrayFilter('gender', g),
              })),
              ...filters.family.map((f) => ({
                key: `family-${f}`,
                label: `Class: ${f}`,
                onRemove: () => toggleArrayFilter('family', f),
              })),
              ...filters.season.map((s) => ({
                key: `season-${s}`,
                label: `Era: ${s}`,
                onRemove: () => toggleArrayFilter('season', s),
              })),
              ...filters.brand.map((b) => ({
                key: `brand-${b}`,
                label: `Maker: ${b}`,
                onRemove: () => toggleArrayFilter('brand', b),
              })),
              ...filters.occasion.map((o) => ({
                key: `occ-${o}`,
                label: `Use: ${o}`,
                onRemove: () => toggleArrayFilter('occasion', o),
              })),
              ...filters.size.map((sz) => ({
                key: `size-${sz}`,
                label: `Scale: ${sz}`,
                onRemove: () => toggleArrayFilter('size', sz),
              })),
              ...filters.concentration.map((c) => ({
                key: `conc-${c}`,
                label: `Build: ${c}`,
                onRemove: () => toggleArrayFilter('concentration', c),
              })),
            ].map((chip) => (
              <span
                key={chip.key}
                className="bg-[#F4F2EE] text-[#08090B] border border-zinc-300 px-2.5 py-1 text-[11px] flex items-center gap-1.5"
              >
                <span>{chip.label}</span>
                <button
                  type="button"
                  onClick={chip.onRemove}
                  className="hover:text-[#E10600] cursor-pointer"
                  aria-label={`Remove ${chip.label}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {filters.minPrice && (
              <span className="bg-[#F4F2EE] text-[#08090B] border border-zinc-300 px-2.5 py-1 text-[11px] flex items-center gap-1.5">
                Min: ৳{filters.minPrice}
                <button
                  type="button"
                  onClick={() => setFilters({ ...filters, minPrice: '' })}
                  className="hover:text-[#E10600] cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.maxPrice && (
              <span className="bg-[#F4F2EE] text-[#08090B] border border-zinc-300 px-2.5 py-1 text-[11px] flex items-center gap-1.5">
                Max: ৳{filters.maxPrice}
                <button
                  type="button"
                  onClick={() => setFilters({ ...filters, maxPrice: '' })}
                  className="hover:text-[#E10600] cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.search && (
              <span className="bg-[#F4F2EE] text-[#08090B] border border-zinc-300 px-2.5 py-1 text-[11px] flex items-center gap-1.5">
                Search: "{filters.search}"
                <button
                  type="button"
                  onClick={() => setFilters({ ...filters, search: '' })}
                  className="hover:text-[#E10600] cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={handleClearAllFilters}
              className="text-[11px] font-bold text-[#E10600] hover:underline uppercase ml-auto cursor-pointer"
            >
              Clear All
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:col-span-3 bg-white border border-zinc-300 p-6 sticky top-24">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3 mb-5">
              <span className="text-xs font-mono uppercase font-bold tracking-widest text-[#08090B] flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#E10600]" />
                <span>Filter Grid</span>
              </span>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={handleClearAllFilters}
                  className="text-[10px] text-[#E10600] hover:underline uppercase font-mono cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
            <FilterContent />
          </div>

          {/* Product Grid */}
          <div className="lg:col-span-9">
            {loadingProducts ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5">
                {[1, 2, 3, 4, 5, 6].map((idx) => (
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
                  No F1 Models Match Your Filters
                </h3>
                <p className="text-xs text-zinc-600 max-w-md mx-auto leading-relaxed">
                  Adjust or clear active filter selections to inspect more diecast and RC race cars.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleClearAllFilters}
                    className="btn-f1 inline-flex items-center bg-[#E10600] hover:bg-[#ff1e18] text-white px-7 py-2.5 font-display text-sm font-bold uppercase tracking-[0.08em] transition-colors cursor-pointer"
                  >
                    <span className="btn-f1-inner">
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Reset All Filters</span>
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5">
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
      </div>

      {/* Mobile Slide-Over Filter Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/75 backdrop-blur-sm flex justify-end lg:hidden">
          <div className="relative w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 bg-[#08090B] text-white">
              <span className="text-xs font-mono uppercase font-bold tracking-widest flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#E10600]" />
                <span>Filter ({activeFilterCount})</span>
              </span>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1 text-zinc-400 hover:text-white cursor-pointer"
                aria-label="Close filter drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              <FilterContent />
            </div>

            <div className="p-4 border-t border-zinc-200 bg-[#F4F2EE] flex items-center gap-3">
              <button
                type="button"
                onClick={handleClearAllFilters}
                className="btn-f1 w-1/3 py-2.5 bg-zinc-200 hover:bg-zinc-300 text-[#08090B] font-display text-sm uppercase tracking-[0.08em] font-bold transition-colors cursor-pointer"
              >
                <span className="btn-f1-inner">Reset</span>
              </button>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="btn-f1 w-2/3 py-2.5 bg-[#E10600] hover:bg-[#ff1e18] text-white font-display text-sm uppercase tracking-[0.08em] font-bold transition-colors cursor-pointer"
              >
                <span className="btn-f1-inner">Apply Filters</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

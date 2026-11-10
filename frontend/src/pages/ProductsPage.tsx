import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts, Product } from '../api';
import { ProductCard } from '../components/ui/ProductCard';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Skeleton } from '../components/ui/Skeleton';
import { Button } from '../components/ui/Button';
import { Search, Filter, RefreshCw, Flag } from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || '';
  const searchParam = searchParams.get('search') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Local filter states
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam);
  const [searchTerm, setSearchTerm] = useState<string>(searchParam);
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'name'>('default');

  useEffect(() => {
    let isMounted = true;
    async function fetchCatalog() {
      try {
        setLoading(true);
        setError(null);
        // Only pass filters that API supports: category, search
        const data = await getProducts({
          category: selectedCategory || undefined,
          search: searchTerm || undefined,
        });
        if (isMounted) {
          setProducts(data);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || 'Error fetching telemetry catalog');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchCatalog();
    return () => {
      isMounted = false;
    };
  }, [selectedCategory, searchTerm]);

  // Client-side sorting (since API doesn't have sort query parameter)
  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === 'price-asc') {
      return (Number(a.starting_price) || 0) - (Number(b.starting_price) || 0);
    }
    if (sortBy === 'price-desc') {
      return (Number(b.starting_price) || 0) - (Number(a.starting_price) || 0);
    }
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    return 0;
  });

  const handleCategoryClick = (cat: string) => {
    setSelectedCategory(cat);
    const newParams = new URLSearchParams(searchParams);
    if (cat) {
      newParams.set('category', cat);
    } else {
      newParams.delete('category');
    }
    setSearchParams(newParams);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (searchTerm) {
      newParams.set('search', searchTerm);
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      {/* Top Header */}
      <SectionHeading
        tag="TELEMETRY PADDOCK"
        title="F1 DIECAST FLEET"
        subtitle="Full championship grid featuring precision scale models, aero packages, and superhero liveries."
      />

      {/* Control Strip: Search, Categories & Sorting */}
      <div className="bg-[#131720] border border-[#242c3d] p-4 sm:p-6 clip-corner-tr space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="md:col-span-7 flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search by car name, team, or spec..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0b0d10] border border-[#2d3748] px-4 py-2.5 pl-10 text-white placeholder-[#8e9bb0] focus:outline-none focus:border-[#e10600] font-body text-base clip-corner-tr"
              />
              <Search className="w-4 h-4 text-[#8e9bb0] absolute left-3.5 top-3.5" />
            </div>
            <Button type="submit" variant="primary" size="md">
              SEARCH
            </Button>
          </form>

          {/* Sort Control */}
          <div className="md:col-span-5 flex items-center justify-end gap-3 text-xs font-mono-telemetry">
            <span className="text-[#8e9bb0] uppercase flex items-center gap-1.5 shrink-0">
              <Filter className="w-3.5 h-3.5 text-[#e10600]" />
              SORT TELEMETRY:
            </span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-[#0b0d10] border border-[#2d3748] text-white px-3 py-2 text-xs font-mono-telemetry focus:outline-none focus:border-[#e10600] uppercase"
            >
              <option value="default">Default Grid Order</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name">Model Name A-Z</option>
            </select>
          </div>
        </div>

        {/* Category Pills Strip */}
        <div className="pt-2 border-t border-[#1f2635] flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-xs font-mono-telemetry text-[#8e9bb0] uppercase mr-2 shrink-0">
            DIVISIONS:
          </span>
          {[
            { label: 'ALL RACERS', value: '' },
            { label: '1:18 SCALE', value: '1:18 Scale' },
            { label: '1:43 SCALE', value: '1:43 Scale' },
            { label: '1:64 SCALE', value: '1:64 Scale' },
            { label: 'HERO EDITIONS', value: 'Hero Editions' },
            { label: 'CHAMPIONSHIP PODIUM', value: 'Championship' },
          ].map((cat) => (
            <button
              key={cat.value}
              onClick={() => handleCategoryClick(cat.value)}
              className={`text-xs font-mono-telemetry uppercase px-3 py-1.5 shrink-0 border clip-racing-tag transition-colors cursor-pointer ${
                selectedCategory === cat.value
                  ? 'bg-[#e10600] text-white border-[#ff3b36]'
                  : 'bg-[#0b0d10] text-[#8e9bb0] border-[#242c3d] hover:text-white hover:border-[#4a5568]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Content / Loading / Error */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <Skeleton key={n} variant="card" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-[#241315] border-2 border-[#e10600] p-10 text-center clip-corner-tr space-y-4">
          <Flag className="w-12 h-12 text-[#e10600] mx-auto" />
          <h3 className="text-2xl font-black italic text-white uppercase font-condensed">
            GRID TELEMETRY FAILURE
          </h3>
          <p className="text-sm text-[#8e9bb0] max-w-md mx-auto">{error}</p>
          <Button
            variant="outline"
            size="md"
            onClick={() => {
              setSelectedCategory('');
              setSearchTerm('');
            }}
          >
            <RefreshCw className="w-4 h-4" />
            RESET FILTERS & RELOAD
          </Button>
        </div>
      ) : sortedProducts.length === 0 ? (
        <div className="bg-[#131720] border border-[#242c3d] p-16 text-center clip-corner-tr space-y-4">
          <div className="w-16 h-16 bg-[#0b0d10] border border-[#2d3748] rounded-full mx-auto flex items-center justify-center text-[#e10600]">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-black italic text-white uppercase font-condensed">
            NO RACE CARS FOUND IN THIS DIVISION
          </h3>
          <p className="text-base text-[#8e9bb0] max-w-md mx-auto font-body">
            No active diecast matches your search "{searchTerm || selectedCategory}". Try clearing your filters or explore our full paddock.
          </p>
          <div className="pt-2">
            <Button
              variant="yellow"
              size="md"
              onClick={() => {
                setSelectedCategory('');
                setSearchTerm('');
              }}
            >
              VIEW ALL CARS
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <div className="text-xs font-mono-telemetry text-[#8e9bb0] uppercase mb-4">
            DISPLAYING <span className="text-white font-bold">{sortedProducts.length}</span> HIGH-OCTANE MACHINES
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {sortedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;

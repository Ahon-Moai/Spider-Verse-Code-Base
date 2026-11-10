import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductBySlugOrId, Product, ProductVariant } from '../api';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { StatBar } from '../components/ui/StatBar';
import { Skeleton } from '../components/ui/Skeleton';
import {
  ShieldCheck,
  Gauge,
  ShoppingBag,
  ArrowLeft,
  CheckCircle,
  Truck,
  RotateCcw,
} from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const { slugOrId } = useParams<{ slugOrId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadProduct() {
      if (!slugOrId) return;
      try {
        setLoading(true);
        setError(null);
        const data = await getProductBySlugOrId(slugOrId);
        if (isMounted) {
          if (data) {
            setProduct(data);
            if (data.variants && data.variants.length > 0) {
              setSelectedVariant(data.variants[0]);
            }
            // Set initial image
            const initialImg = data.image || (data.images && data.images[0]) || '';
            setSelectedImage(initialImg);
          } else {
            setError('Race vehicle not found on circuit.');
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || 'Failed to fetch telemetry data.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadProduct();
    return () => {
      isMounted = false;
    };
  }, [slugOrId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddToCartUI = () => {
    showToast(`Added ${product?.name} (${selectedVariant?.size || 'Standard Spec'}) to Pit Bag!`);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7">
            <Skeleton className="w-full aspect-[4/3] clip-corner-tr" />
          </div>
          <div className="lg:col-span-5 space-y-6">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="bg-[#181214] border-2 border-[#e10600] p-10 clip-corner-tr space-y-4">
          <Gauge className="w-16 h-16 text-[#e10600] mx-auto" />
          <h2 className="text-3xl font-black italic uppercase text-white font-condensed">
            TELEMETRY NOT FOUND
          </h2>
          <p className="text-sm text-[#8e9bb0] max-w-md mx-auto">{error || 'Vehicle not detected.'}</p>
          <div className="pt-4">
            <Link to="/products">
              <Button variant="primary">
                <ArrowLeft className="w-4 h-4" />
                RETURN TO GRID
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentPrice = selectedVariant ? selectedVariant.price : product.starting_price;
  const isOutOfStock = (selectedVariant?.stock_qty ?? product.inventory_qty ?? 10) <= 0;

  // Aggregate all gallery images
  const allImages = [
    ...(product.image ? [product.image] : []),
    ...(product.images || []),
    ...(product.additional_images || []),
  ].filter((img, idx, arr) => arr.indexOf(img) === idx);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#131720] border-2 border-[#e10600] text-white px-5 py-3 shadow-[0_0_25px_rgba(225,6,0,0.4)] text-sm font-mono-telemetry flex items-center gap-2 clip-corner-tr animate-bounce">
          <CheckCircle className="w-4 h-4 text-[#ffe600]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-mono-telemetry text-[#8e9bb0] uppercase">
        <Link to="/" className="hover:text-white transition-colors">
          GRID
        </Link>
        <span>/</span>
        <Link to="/products" className="hover:text-white transition-colors">
          PADDOCK CATALOG
        </Link>
        <span>/</span>
        <span className="text-[#e10600] font-bold truncate max-w-xs">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Vehicle Image Display & Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[16/11] bg-[#0c0e14] border-2 border-[#242c3d] clip-corner-both flex items-center justify-center p-6 overflow-hidden">
            <div className="absolute inset-0 bg-halftone-pattern opacity-20 pointer-events-none" />
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
              <Badge variant="red">{product.category || 'F1 DIECAST'}</Badge>
              {product.is_featured && <Badge variant="yellow">CHAMPIONSHIP PODIUM</Badge>}
            </div>

            {selectedImage && !selectedImage.includes('error') ? (
              <img
                src={selectedImage}
                alt={product.name}
                className="w-full h-full object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)]"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                  setSelectedImage('');
                }}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-[#242c3d] p-8">
                <svg
                  viewBox="0 0 240 100"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-full h-auto text-white drop-shadow-[0_10px_20px_rgba(225,6,0,0.4)]"
                >
                  <path d="M 10 65 L 45 60 L 55 55 L 25 55 Z" fill="#e10600" fillOpacity="0.8" />
                  <path d="M 45 60 Q 95 55 135 40 Q 170 38 195 55 L 225 60 L 235 50 L 235 30 L 205 30" stroke="#00d2ff" strokeWidth="2.5" />
                  <circle cx="60" cy="70" r="18" fill="#0b0d10" stroke="#333d4e" strokeWidth="5" />
                  <circle cx="60" cy="70" r="7" fill="#e10600" />
                  <circle cx="195" cy="70" r="19" fill="#0b0d10" stroke="#333d4e" strokeWidth="5" />
                  <circle cx="195" cy="70" r="8" fill="#ffe600" />
                </svg>
                <span className="text-xs font-mono-telemetry tracking-widest text-[#505f79] uppercase mt-4">
                  SCHEMATIC DIECAST VIEW
                </span>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {allImages.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-16 bg-[#131720] border-2 clip-corner-tr p-1 shrink-0 transition-colors ${
                    selectedImage === img ? 'border-[#e10600]' : 'border-[#242c3d] hover:border-[#4a5568]'
                  }`}
                >
                  <img src={img} alt={`Angle ${i + 1}`} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}

          {/* Telemetry Engineering Specifications */}
          <div className="bg-[#131720] border border-[#242c3d] p-6 clip-corner-tr space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1f2635]">
              <span className="text-xs font-mono-telemetry font-bold uppercase text-white flex items-center gap-2">
                <Gauge className="w-4 h-4 text-[#e10600]" />
                TELEMETRY BENCHMARK DATA
              </span>
              <span className="text-xs font-mono-telemetry text-[#ffe600]">SPEC V2.8</span>
            </div>

            <div className="space-y-3">
              <StatBar label="AERODYNAMIC DRAG COEFFICIENT" value={88} displayValue="0.68 CD" variant="red" />
              <StatBar label="MAX SIMULATED TOP SPEED" value={97} displayValue="352 KM/H" variant="yellow" />
              <StatBar label="DIECAST ALLOY RIGIDITY" value={95} displayValue="120 MPA" variant="blue" />
            </div>
          </div>
        </div>

        {/* Right Column: Pricing, Specs, Size Selection & UI-only Add to Cart */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="flex items-center justify-between text-xs font-mono-telemetry text-[#8e9bb0] uppercase mb-1">
              <span className="text-[#e10600] font-bold">{product.brand || 'SPIDER VERSE'}</span>
              <span>SKU: {selectedVariant?.sku || product.id}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black italic tracking-wide text-white uppercase font-condensed">
              {product.name}
            </h1>
          </div>

          {/* Timing-Board Price Display */}
          <div className="bg-[#0b0d10] border-2 border-[#e10600] p-4 clip-corner-tr flex items-baseline justify-between">
            <div>
              <div className="text-[10px] font-mono-telemetry uppercase text-[#8e9bb0]">
                CIRCUIT LAP PRICE
              </div>
              <div className="text-3xl sm:text-4xl font-black font-mono-telemetry text-white flex items-baseline gap-1">
                <span className="text-[#e10600]">৳</span>
                <span>{Number(currentPrice || 0).toLocaleString()}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-mono-telemetry uppercase text-[#8e9bb0]">
                PADDOCK STATUS
              </div>
              <span
                className={`text-xs font-mono-telemetry uppercase font-bold ${
                  isOutOfStock ? 'text-[#ff453a]' : 'text-[#00e676]'
                }`}
              >
                {isOutOfStock ? 'OUT OF STOCK' : 'IN PIT LANE (READY)'}
              </span>
            </div>
          </div>

          {/* Scale / Variant Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-mono-telemetry text-[#8e9bb0] uppercase">
                <span>SELECT DIECAST SCALE:</span>
                <span className="text-white font-bold">{selectedVariant?.size}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {product.variants.map((v, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedVariant(v)}
                    className={`p-3 border-2 clip-corner-tr text-left transition-all cursor-pointer ${
                      selectedVariant?.size === v.size
                        ? 'border-[#e10600] bg-[#e10600]/10 text-white shadow-[0_0_12px_rgba(225,6,0,0.3)]'
                        : 'border-[#242c3d] bg-[#131720] text-[#8e9bb0] hover:border-[#4a5568]'
                    }`}
                  >
                    <div className="text-xs font-mono-telemetry font-bold uppercase">{v.size}</div>
                    <div className="text-sm font-mono-telemetry font-black text-white mt-1">
                      ৳{Number(v.price).toLocaleString()}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-sm font-mono-telemetry uppercase tracking-wider text-[#8e9bb0]">
              CHASSIS REPORT
            </h3>
            <p className="text-sm sm:text-base text-[#a0aec0] font-body leading-relaxed">
              {product.description || product.short_description || 'High-precision F1 scale vehicle with aerodynamic front wings, authentic sponsor telemetry, and comic universe hero energy.'}
            </p>
          </div>

          {/* Primary Action Button (UI Only for Task 2) */}
          <div className="space-y-3 pt-2">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              disabled={isOutOfStock}
              onClick={handleAddToCartUI}
            >
              <ShoppingBag className="w-5 h-5" />
              <span>{isOutOfStock ? 'OUT OF STOCK' : 'ADD TO PIT BAG (UI)'}</span>
            </Button>

            <div className="text-center text-xs font-mono-telemetry text-[#8e9bb0]">
              * CART STATE INTEGRATION ACTIVE IN TASK 3
            </div>
          </div>

          {/* Perks & Guarantees */}
          <div className="border-t border-[#1f2635] pt-6 space-y-3 text-xs text-[#8e9bb0]">
            <div className="flex items-center gap-3">
              <Truck className="w-4 h-4 text-[#ffe600]" />
              <span>Express Dhaka dispatch in 24-48 hours.</span>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-[#00d2ff]" />
              <span>100% authentic collector diecast alloy guarantee.</span>
            </div>
            <div className="flex items-center gap-3">
              <RotateCcw className="w-4 h-4 text-[#e10600]" />
              <span>3-day replacement policy on defective castings.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;

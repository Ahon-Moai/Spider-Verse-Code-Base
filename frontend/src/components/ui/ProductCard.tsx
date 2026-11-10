import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../api/types';
import { Badge } from './Badge';
import { Button } from './Button';
import { Gauge, ShoppingBag } from 'lucide-react';

export interface ProductCardProps {
  product: Product;
  onAddToCartUI?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCartUI,
}) => {
  const isOutOfStock = (product.inventory_qty ?? 10) <= 0;
  const isNewArrival = Boolean(product.is_new_arrival);
  const isFeatured = Boolean(product.is_featured);

  const [imgError, setImgError] = React.useState(false);
  const carImage = !imgError && product.image && (product.image.startsWith('http') || product.image.startsWith('/'))
    ? product.image
    : null;

  return (
    <div className="group relative bg-[#131720] border border-[#242c3d] hover:border-[#e10600]/80 transition-all duration-300 flex flex-col clip-corner-tr hover:shadow-[0_10px_30px_rgba(225,6,0,0.15)] hover:-translate-y-1">
      {/* Top Corner Speed Cut Highlight */}
      <div className="absolute top-0 right-0 w-4 h-4 bg-[#e10600]/20 pointer-events-none group-hover:bg-[#e10600] transition-colors" />

      {/* Halftone subtle hover background */}
      <div className="absolute inset-0 bg-halftone-pattern opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      {/* Image / Vehicle Preview Container */}
      <div className="relative aspect-[4/3] bg-[#0c0e14] overflow-hidden flex items-center justify-center p-4 border-b border-[#1f2635]">
        {/* Status Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
          {isFeatured && <Badge variant="yellow">PIT PODIUM</Badge>}
          {isNewArrival && <Badge variant="red">NEW SPEC</Badge>}
          {isOutOfStock && <Badge variant="carbon">SOLD OUT</Badge>}
        </div>

        {/* Telemetry Scale Spec Tag */}
        <div className="absolute bottom-2 right-2 z-10 text-[10px] font-mono-telemetry uppercase text-[#8e9bb0] bg-black/60 px-1.5 py-0.5 border border-white/10 backdrop-blur-xs">
          {product.category || 'F1 DIECAST'}
        </div>

        {carImage ? (
          <img
            src={carImage}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
          />
        ) : (
          /* High-Octane Stylized F1 Car Silhouette SVG */
          <div className="w-full h-full flex flex-col items-center justify-center text-[#242c3d] group-hover:text-[#e10600]/40 transition-colors p-6">
            <svg
              viewBox="0 0 200 80"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-full h-auto drop-shadow-md"
            >
              {/* Front wing */}
              <path d="M 10 50 L 35 48 L 40 45 L 20 45 Z" fill="currentColor" fillOpacity="0.2" />
              {/* Cockpit & Body Chassis */}
              <path d="M 35 48 Q 70 45 105 35 Q 130 32 155 45 L 180 48 L 190 40 L 190 25 L 165 25" />
              {/* Rear Wing */}
              <rect x="175" y="22" width="20" height="6" fill="currentColor" fillOpacity="0.4" />
              <line x1="185" y1="28" x2="185" y2="48" strokeWidth="3" />
              {/* Wheels */}
              <circle cx="48" cy="56" r="14" fill="#0b0d10" stroke="currentColor" strokeWidth="4" />
              <circle cx="48" cy="56" r="6" fill="#e10600" />
              <circle cx="160" cy="56" r="15" fill="#0b0d10" stroke="currentColor" strokeWidth="4" />
              <circle cx="160" cy="56" r="6" fill="#ffe600" />
              {/* Speed Lines */}
              <line x1="5" y1="20" x2="30" y2="20" stroke="#00d2ff" strokeDasharray="4 4" />
              <line x1="15" y1="28" x2="45" y2="28" stroke="#e10600" strokeDasharray="4 4" />
            </svg>
            <span className="text-[11px] font-mono-telemetry tracking-widest text-[#505f79] uppercase mt-2">
              TELEMETRY SPEC CHASSIS
            </span>
          </div>
        )}
      </div>

      {/* Body Info */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between relative z-10">
        <div>
          <div className="flex items-center justify-between gap-2 text-xs font-mono-telemetry text-[#8e9bb0] uppercase mb-1">
            <span className="text-[#e10600] font-bold">{product.brand || 'SPIDER VERSE'}</span>
            <span className="flex items-center gap-1">
              <Gauge className="w-3 h-3 text-[#00d2ff]" />
              {product.variants?.[0]?.size || '1:43 RACE'}
            </span>
          </div>

          <Link
            to={`/products/${product.slug || product.id}`}
            className="block group-hover:text-[#ffe600] transition-colors"
          >
            <h3 className="text-xl sm:text-2xl font-black italic tracking-wide text-white line-clamp-1">
              {product.name}
            </h3>
          </Link>

          <p className="mt-2 text-sm text-[#8e9bb0] line-clamp-2 font-body leading-relaxed">
            {product.short_description || product.description || 'Precision diecast model with aerodynamic telemetry engineering and comic hero energy.'}
          </p>
        </div>

        {/* Pricing & Add to Cart Action */}
        <div className="mt-5 pt-3 border-t border-[#1f2635] flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase font-mono-telemetry text-[#8e9bb0]">
              LAP TIME PRICE
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono-telemetry text-white flex items-baseline gap-1">
              <span className="text-[#e10600] text-sm">৳</span>
              <span>{Number(product.starting_price || 0).toLocaleString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="primary"
              size="sm"
              disabled={isOutOfStock}
              onClick={() => onAddToCartUI && onAddToCartUI(product)}
              title="Add to Pit Bag"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">PIT STOP</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

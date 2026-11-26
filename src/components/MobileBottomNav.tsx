import React from 'react';
import { Home, LayoutGrid, Search, ShoppingBag } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: 'home' | 'shop' | 'search' | 'bag' | 'ai';
  cartCount: number;
  onNavigateHome: () => void;
  onNavigateShop: () => void;
  onOpenSearch: () => void;
  onOpenCart: () => void;
  onSelectAI?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  cartCount,
  onNavigateHome,
  onNavigateShop,
  onOpenSearch,
  onOpenCart,
}) => {
  const navItems = [
    {
      id: 'home' as const,
      label: 'Home',
      icon: Home,
      action: onNavigateHome,
    },
    {
      id: 'shop' as const,
      label: 'Shop',
      icon: LayoutGrid,
      action: onNavigateShop,
    },
    {
      id: 'search' as const,
      label: 'Search',
      icon: Search,
      action: onOpenSearch,
    },
    {
      id: 'bag' as const,
      label: 'Bag',
      icon: ShoppingBag,
      action: onOpenCart,
      badge: cartCount > 0 ? cartCount : undefined,
    },
  ];

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-[#08090B]/[0.98] border-t border-white/15 pb-[env(safe-area-inset-bottom)] select-none">
      <nav aria-label="Mobile Bottom Navigation" className="grid grid-cols-4 h-14">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={item.action}
              className={`relative flex flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer touch-manipulation ${
                isActive ? 'text-white' : 'text-[#9CA3AF] hover:text-white'
              }`}
            >
              {isActive && (
                <span className="absolute top-0 inset-x-4 h-[2px] bg-[#E10600]" />
              )}

              <div className="relative flex items-center justify-center">
                <Icon className="w-[18px] h-[18px]" />
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2.5 bg-[#E10600] text-white text-[9px] font-mono font-bold min-w-[16px] h-4 px-1 flex items-center justify-center tabular-nums">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>

              <span className="text-[10px] font-mono uppercase tracking-wider">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

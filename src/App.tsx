/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { CategoryMarquee } from './components/CategoryMarquee';
import { NewArrivals } from './components/NewArrivals';
import { CampaignBanners } from './components/CampaignBanners';
import { CustomProductSections } from './components/CustomProductSections';
import { FAQSection } from './components/FAQSection';
import { ReviewsSection } from './components/ReviewsSection';
import { StudioSection } from './components/StudioSection';
import { JournalSection } from './components/JournalSection';
import { Footer } from './components/Footer';
import { ProductDetailPage } from './components/ProductDetailPage';
import { CollectionPage } from './components/CollectionPage';
import { ShoppingBagPage } from './components/ShoppingBagPage';
import { CheckoutPage } from './components/CheckoutPage';
import { OrderConfirmationPage } from './components/OrderConfirmationPage';
import { SearchModal } from './components/SearchModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { IntroSequence } from './components/IntroSequence';
import { AdminLogin } from './admin/AdminLogin';
import { AdminLayout } from './admin/AdminLayout';
import {
  FragranceProduct,
  CartItem,
  JournalArticle,
  CompletedOrderData,
} from './types';
import {
  fetchPublicProducts,
  fetchHomepageData,
  fetchStoreSettings,
  getErrorMessage,
} from './services/api';
import { getItemMaxStock } from './utils/checkout';
import { Shield } from 'lucide-react';

const CART_STORAGE_KEY = 'spiderverse_cart_v1';
const COUPON_STORAGE_KEY = 'spiderverse_coupon_v1';

type AppRoute = {
  path:
    | 'home'
    | 'product'
    | 'collection'
    | 'cart'
    | 'checkout'
    | 'order-confirmation'
    | 'admin';
  productSlugOrId?: string;
  collectionSlug?: string;
  orderNumber?: string;
};

function loadInitialCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) =>
        item &&
        item.product &&
        typeof item.product.id === 'string' &&
        typeof item.selectedSize === 'string' &&
        typeof item.price === 'number' &&
        typeof item.quantity === 'number' &&
        item.quantity > 0
    );
  } catch {
    return [];
  }
}

function loadInitialCoupon(): string {
  try {
    return localStorage.getItem(COUPON_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export default function App() {
  const [showIntro, setShowIntro] = useState<boolean>(true);

  const [products, setProducts] = useState<FragranceProduct[]>([]);
  const [cart, setCart] = useState<CartItem[]>(loadInitialCart);
  const [appliedCoupon, setAppliedCoupon] = useState<string>(loadInitialCoupon);
  const [completedOrder, setCompletedOrder] = useState<CompletedOrderData | null>(null);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [route, setRoute] = useState<AppRoute>({ path: 'home' });

  const [viewMode, setViewMode] = useState<'storefront' | 'admin'>('storefront');
  const [adminUser, setAdminUser] = useState<any | null>(null);
  const [csrfToken, setCsrfToken] = useState<string>('');

  const [storeSettings, setStoreSettings] = useState<any>(null);
  const [homepageData, setHomepageData] = useState<any>(null);

  const isInitialLoad = React.useRef(true);
  const cartRef = React.useRef<CartItem[]>(cart);
  cartRef.current = cart;

  // Persist cart and applied coupon across refreshes (never persist delivery location)
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // ignore storage quota errors
    }
  }, [cart]);

  useEffect(() => {
    try {
      if (appliedCoupon) {
        localStorage.setItem(COUPON_STORAGE_KEY, appliedCoupon);
      } else {
        localStorage.removeItem(COUPON_STORAGE_KEY);
      }
    } catch {
      // ignore
    }
  }, [appliedCoupon]);

  useEffect(() => {
    const syncRouteWithUrl = () => {
      const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
      const hash = window.location.hash;
      const searchParams = new URLSearchParams(window.location.search);

      if (hash === '#admin' || pathname.startsWith('/admin')) {
        setViewMode('admin');
        setRoute({ path: 'admin' });
        isInitialLoad.current = false;
        return;
      } else {
        setViewMode('storefront');
      }

      let nextRoute: AppRoute = { path: 'home' };

      const queryProd = searchParams.get('product');
      if (queryProd) {
        nextRoute = { path: 'product', productSlugOrId: queryProd };
      } else if (pathname === '/cart' || pathname === '/bag') {
        nextRoute = { path: 'cart' };
      } else if (pathname === '/checkout') {
        if (cartRef.current.length === 0) {
          window.history.replaceState({}, '', '/cart');
          nextRoute = { path: 'cart' };
        } else {
          nextRoute = { path: 'checkout' };
        }
      } else if (pathname.startsWith('/order-confirmation')) {
        const orderParam =
          searchParams.get('order') ||
          pathname.replace(/^\/order-confirmation\/?/, '').split('/')[0] ||
          undefined;
        nextRoute = { path: 'order-confirmation', orderNumber: orderParam };
      } else if (pathname.startsWith('/products/') || pathname.startsWith('/product/')) {
        const slugOrId = pathname.replace(/^\/(products|product)\//, '').split('/')[0];
        if (slugOrId) {
          nextRoute = { path: 'product', productSlugOrId: slugOrId };
        }
      } else if (pathname.startsWith('/collections/') || pathname.startsWith('/collection/')) {
        const colSlug = pathname.replace(/^\/(collections|collection)\//, '').split('/')[0];
        if (colSlug) {
          nextRoute = { path: 'collection', collectionSlug: colSlug };
        }
      }

      isInitialLoad.current = false;
      setRoute(nextRoute);
    };

    syncRouteWithUrl();
    window.addEventListener('popstate', syncRouteWithUrl);
    window.addEventListener('hashchange', syncRouteWithUrl);
    return () => {
      window.removeEventListener('popstate', syncRouteWithUrl);
      window.removeEventListener('hashchange', syncRouteWithUrl);
    };
  }, []);

  const prevViewModeRef = React.useRef<'storefront' | 'admin' | null>(null);

  useEffect(() => {
    const prevMode = prevViewModeRef.current;
    prevViewModeRef.current = viewMode;
    // Fetch on initial mount or when returning from admin to storefront
    if (prevMode === viewMode) return;
    if (viewMode === 'admin' && prevMode === 'storefront') return;

    const loadApiData = async () => {
      const [liveProducts, settings, hpData] = await Promise.all([
        fetchPublicProducts(),
        fetchStoreSettings(),
        fetchHomepageData(),
      ]);

      if (liveProducts && liveProducts.length > 0) {
        setProducts(liveProducts);
        // Sync persisted cart items with fresh product metadata (prices & stock)
        setCart((prevCart) =>
          prevCart.map((cartItem) => {
            const freshProduct = liveProducts.find((p) => p.id === cartItem.product.id);
            if (!freshProduct) return cartItem;
            const freshVariant = freshProduct.sizes?.find(
              (s) => s.size === cartItem.selectedSize
            );
            const updatedPrice = freshVariant ? freshVariant.price : cartItem.price;
            const maxStock = getItemMaxStock(freshProduct, cartItem.selectedSize);
            const clampedQty =
              maxStock !== null && cartItem.quantity > maxStock
                ? maxStock
                : cartItem.quantity;
            return {
              ...cartItem,
              product: freshProduct,
              price: updatedPrice,
              quantity: Math.max(1, clampedQty),
            };
          })
        );
      }
      if (settings) {
        setStoreSettings(settings);
      }
      if (hpData) {
        setHomepageData(hpData);
      }
    };
    loadApiData();
  }, [viewMode]);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth.php?action=me');
        const data = await res.json();
        if (data.success && data.data) {
          setAdminUser(data.data.user);
          setCsrfToken(data.data.csrf_token);
        }
      } catch {
        // Unauthenticated
      }
    };
    checkSession();
  }, []);

  const navigateToProduct = useCallback((productOrSlug: FragranceProduct | string) => {
    const slugOrId =
      typeof productOrSlug === 'string'
        ? productOrSlug
        : productOrSlug.slug || productOrSlug.id;
    const targetUrl = `/products/${slugOrId}`;
    if (window.location.pathname !== targetUrl) {
      window.history.pushState({}, '', targetUrl);
    }
    setRoute({ path: 'product', productSlugOrId: slugOrId });
    window.scrollTo(0, 0);
  }, []);

  const navigateToCollection = useCallback((slug: string) => {
    const targetUrl = `/collections/${slug}`;
    if (window.location.pathname !== targetUrl) {
      window.history.pushState({}, '', targetUrl);
    }
    setRoute({ path: 'collection', collectionSlug: slug });
    window.scrollTo(0, 0);
  }, []);

  const navigateToHome = useCallback(() => {
    if (window.location.pathname !== '/' && window.location.hash !== '#admin') {
      window.history.pushState({}, '', '/');
    }
    setRoute({ path: 'home' });
    window.scrollTo(0, 0);
  }, []);

  const navigateToCart = useCallback(() => {
    if (window.location.pathname !== '/cart') {
      window.history.pushState({}, '', '/cart');
    }
    setRoute({ path: 'cart' });
    window.scrollTo(0, 0);
  }, []);

  const navigateToCheckout = useCallback(() => {
    if (cartRef.current.length === 0) {
      if (window.location.pathname !== '/cart') {
        window.history.replaceState({}, '', '/cart');
      }
      setRoute({ path: 'cart' });
      window.scrollTo(0, 0);
      return;
    }
    if (window.location.pathname !== '/checkout') {
      window.history.pushState({}, '', '/checkout');
    }
    setRoute({ path: 'checkout' });
    window.scrollTo(0, 0);
  }, []);

  const navigateToOrderConfirmation = useCallback((order: CompletedOrderData) => {
    setCompletedOrder(order);
    const targetUrl = `/order-confirmation?order=${encodeURIComponent(order.order_number)}`;
    window.history.pushState({}, '', targetUrl);
    setRoute({ path: 'order-confirmation', orderNumber: order.order_number });
    window.scrollTo(0, 0);
  }, []);

  const showToast = (msg: any) => {
    setToastMessage(typeof msg === 'string' ? msg : getErrorMessage(msg, 'Notification'));
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const handleAddToCart = (
    product: FragranceProduct,
    size: string,
    price: number,
    qty = 1
  ) => {
    const maxStock = getItemMaxStock(product, size);
    let reachedCap = false;

    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (item) => item.product.id === product.id && item.selectedSize === size
      );
      if (existingIdx > -1) {
        const next = [...prev];
        const currentQty = next[existingIdx].quantity;
        const desiredQty = currentQty + qty;
        if (maxStock !== null && desiredQty > maxStock) {
          reachedCap = true;
          next[existingIdx] = {
            ...next[existingIdx],
            quantity: maxStock,
          };
        } else {
          next[existingIdx] = {
            ...next[existingIdx],
            quantity: desiredQty,
          };
        }
        return next;
      }

      const initialQty =
        maxStock !== null && qty > maxStock
          ? ((reachedCap = true), maxStock)
          : qty;

      return [
        ...prev,
        { product, selectedSize: size, price, quantity: Math.max(1, initialQty) },
      ];
    });

    if (reachedCap && maxStock !== null) {
      showToast(`Maximum available stock (${maxStock}) reached for ${product.name}`);
    } else {
      showToast(`Added ${size} ${product.brand} — ${product.name} to bag`);
    }
  };

  const handleBuyNow = (
    product: FragranceProduct,
    size: string,
    price: number,
    qty = 1
  ) => {
    const maxStock = getItemMaxStock(product, size);
    const nextQty = maxStock !== null ? Math.min(maxStock, qty) : qty;

    const existingIdx = cartRef.current.findIndex(
      (item) => item.product.id === product.id && item.selectedSize === size
    );
    let updatedCart: CartItem[];
    if (existingIdx > -1) {
      updatedCart = [...cartRef.current];
      const desired = updatedCart[existingIdx].quantity + nextQty;
      updatedCart[existingIdx] = {
        ...updatedCart[existingIdx],
        quantity: maxStock !== null ? Math.min(maxStock, desired) : desired,
      };
    } else {
      updatedCart = [
        ...cartRef.current,
        { product, selectedSize: size, price, quantity: Math.max(1, nextQty) },
      ];
    }

    cartRef.current = updatedCart;
    setCart(updatedCart);
    navigateToCheckout();
  };

  const handleUpdateQty = (productId: string, size: string, delta: number) => {
    let hitCap: number | null = null;
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId && item.selectedSize === size) {
            const maxStock = getItemMaxStock(item.product, size);
            let nextQty = item.quantity + delta;
            if (delta > 0 && maxStock !== null && nextQty > maxStock) {
              nextQty = maxStock;
              hitCap = maxStock;
            }
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
    if (hitCap !== null) {
      showToast(`Maximum available stock (${hitCap}) reached`);
    }
  };

  const handleRemoveFromCart = (productId: string, size: string) => {
    setCart((prev) =>
      prev.filter((item) => !(item.product.id === productId && item.selectedSize === size))
    );
    showToast('Item removed from bag');
  };

  const handleOrderSuccess = (order: CompletedOrderData) => {
    // Only clear cart & coupon AFTER backend confirms order creation
    setCart([]);
    cartRef.current = [];
    setAppliedCoupon('');
    navigateToOrderConfirmation(order);
  };

  const handleExploreClick = () => {
    if (route.path !== 'home') {
      navigateToHome();
      setTimeout(() => {
        document.getElementById('new-arrivals')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.getElementById('new-arrivals')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectGenderCategory = (gender: 'Him' | 'Her') => {
    handleExploreClick();
    showToast(
      gender === 'Him' ? 'Displaying 1:18 Pro Diecast F1 cars' : 'Displaying 1:43 Collector Grid models'
    );
  };

  const handleReadArticle = (article: JournalArticle) => {
    showToast(`Reading: "${article.title}"`);
  };

  const handleAdminLogout = async () => {
    try {
      await fetch('/api/auth.php?action=logout');
    } catch {
      // ignore
    }
    setAdminUser(null);
    setCsrfToken('');
    setViewMode('storefront');
    navigateToHome();
    showToast('Logged out from Admin CMS');
  };

  const totalCartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const currentProduct =
    route.path === 'product' && route.productSlugOrId
      ? products.find(
          (p) => p.slug === route.productSlugOrId || p.id === route.productSlugOrId
        ) || null
      : null;

  if (viewMode === 'admin') {
    if (!adminUser) {
      return (
        <AdminLogin
          onLoginSuccess={(user, token) => {
            setAdminUser(user);
            setCsrfToken(token);
          }}
        />
      );
    }
    return (
      <AdminLayout
        user={adminUser}
        csrfToken={csrfToken}
        onLogout={handleAdminLogout}
        onSwitchToStorefront={() => {
          setViewMode('storefront');
          navigateToHome();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#08090B] text-[#F4F2EE] font-sans flex flex-col selection:bg-[#E10600] selection:text-white relative">
      {showIntro && (
        <IntroSequence onComplete={() => setShowIntro(false)} />
      )}

      {/* Admin CMS Switch Button (preserved) */}
      <button
        type="button"
        onClick={() => {
          setViewMode('admin');
          window.location.hash = '#admin';
        }}
        className="fixed bottom-16 md:bottom-6 left-4 md:left-6 z-40 bg-[#111317] text-white hover:bg-[#E10600] px-3 py-2 border border-white/15 shadow-2xl text-[10px] font-mono tracking-widest uppercase flex items-center gap-2 transition-colors cursor-pointer"
        title="Open Admin CMS Dashboard"
      >
        <Shield className="w-3.5 h-3.5 text-[#E10600] group-hover:text-white" />
        <span className="hidden sm:inline">ADMIN CMS</span>
      </button>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-16 md:bottom-6 right-4 md:right-6 z-50 bg-[#08090B] text-white border border-[#E10600] px-4 py-3 shadow-2xl text-xs font-mono tracking-wide flex items-center gap-2.5 animate-fade-in">
          <span className="w-2 h-[2px] bg-[#E10600] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <Header
        cartCount={totalCartCount}
        onOpenCart={navigateToCart}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenWishlist={() => showToast('Wishlist updated')}
        onNavigateHome={navigateToHome}
        onNavigateToCollection={navigateToCollection}
        storeSettings={storeSettings}
      />

      <main className="flex-1">
        {route.path === 'cart' ? (
          <ShoppingBagPage
            items={cart}
            appliedCoupon={appliedCoupon}
            onChangeCoupon={setAppliedCoupon}
            storeSettings={storeSettings}
            onUpdateQty={handleUpdateQty}
            onRemoveItem={handleRemoveFromCart}
            onNavigateHome={navigateToHome}
            onNavigateShop={() => navigateToCollection('all')}
            onNavigateToProduct={navigateToProduct}
            onProceedToCheckout={navigateToCheckout}
          />
        ) : route.path === 'checkout' ? (
          <CheckoutPage
            items={cart}
            appliedCoupon={appliedCoupon}
            onChangeCoupon={setAppliedCoupon}
            storeSettings={storeSettings}
            onNavigateHome={navigateToHome}
            onNavigateToBag={navigateToCart}
            onOrderSuccess={handleOrderSuccess}
          />
        ) : route.path === 'order-confirmation' ? (
          <OrderConfirmationPage
            orderNumber={route.orderNumber}
            initialOrder={completedOrder}
            storeSettings={storeSettings}
            onNavigateHome={navigateToHome}
            onNavigateShop={() => navigateToCollection('all')}
          />
        ) : route.path === 'collection' && route.collectionSlug ? (
          <CollectionPage
            collectionSlug={route.collectionSlug}
            allProducts={products}
            onNavigateHome={navigateToHome}
            onNavigateToCollection={navigateToCollection}
            onNavigateToProduct={navigateToProduct}
            onAddToCart={(p, size, price, qty) => handleAddToCart(p, size, price, qty)}
            showToast={showToast}
          />
        ) : route.path === 'product' ? (
          <ProductDetailPage
            product={currentProduct}
            allProducts={products}
            onNavigateHome={navigateToHome}
            onNavigateToProduct={navigateToProduct}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            showToast={showToast}
          />
        ) : (
          <>
            <Hero
              products={products}
              onSelectProduct={(p) => navigateToProduct(p)}
              onExploreClick={handleExploreClick}
              onOrderProduct={() => {
                if (products.length > 0) navigateToProduct(products[0]);
              }}
              onNavigateToCollection={navigateToCollection}
              heroData={homepageData?.sections?.hero?.content}
              seasonsData={homepageData?.sections?.seasons_gallery?.content}
            />

            <CategoryMarquee
              items={homepageData?.sections?.category_marquee?.content?.items}
              links={homepageData?.sections?.category_marquee?.content?.links}
              onNavigateToCollection={navigateToCollection}
            />

            <NewArrivals
              products={products}
              onSelectProduct={(p) => navigateToProduct(p)}
              onAddToCart={(p, size, price) => handleAddToCart(p, size, price, 1)}
              onNavigateToCollection={navigateToCollection}
            />

            <CampaignBanners
              onSelectCategory={handleSelectGenderCategory}
              onNavigateToCollection={navigateToCollection}
              campaignData={homepageData?.sections?.campaign_banners?.content}
            />

            <CustomProductSections
              homepageData={homepageData}
              allProducts={products}
              onSelectProduct={(p) => navigateToProduct(p)}
              onAddToCart={(p, size, price) => handleAddToCart(p, size, price, 1)}
              onNavigateToCollection={navigateToCollection}
            />

            <FAQSection faqs={homepageData?.faqs} />

            <ReviewsSection reviews={homepageData?.reviews} />

            <StudioSection socialCards={homepageData?.socialCards} />

            <JournalSection
              onReadArticle={handleReadArticle}
              articles={homepageData?.articles}
            />
          </>
        )}
      </main>

      <Footer storeSettings={storeSettings} />

      <MobileBottomNav
        activeTab={
          isSearchOpen
            ? 'search'
            : route.path === 'cart' ||
              route.path === 'checkout' ||
              route.path === 'order-confirmation'
            ? 'bag'
            : route.path === 'collection'
            ? 'shop'
            : 'home'
        }
        cartCount={totalCartCount}
        onNavigateHome={navigateToHome}
        onNavigateShop={() => navigateToCollection('all')}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenCart={navigateToCart}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={products}
        onSelectProduct={(p) => navigateToProduct(p)}
      />
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { CategoryMarquee } from './components/CategoryMarquee';
import { NewArrivals } from './components/NewArrivals';
import { CampaignBanners } from './components/CampaignBanners';
import { VideoSection } from './components/VideoSection';
import { CustomProductSections } from './components/CustomProductSections';
import { TrustSection } from './components/TrustSection';
import { FAQSection } from './components/FAQSection';
import { ReviewsSection } from './components/ReviewsSection';
import { StudioSection } from './components/StudioSection';
import { JournalSection } from './components/JournalSection';
import { Footer } from './components/Footer';
import { ProductDetailPage } from './components/ProductDetailPage';
import { CollectionPage } from './components/CollectionPage';
import { CartDrawer } from './components/CartDrawer';
import { SearchModal } from './components/SearchModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { IntroSequence } from './components/IntroSequence';
import { AdminLogin } from './admin/AdminLogin';
import { AdminLayout } from './admin/AdminLayout';
import { FragranceProduct, CartItem, JournalArticle } from './types';
import {
  fetchPublicProducts,
  fetchHomepageData,
  fetchStoreSettings,
  getErrorMessage,
} from './services/api';
import { Shield } from 'lucide-react';

export default function App() {
  const [showIntro, setShowIntro] = useState<boolean>(true);
  const [introKey, setIntroKey] = useState<number>(0);
  const [isPageTransitionIntro, setIsPageTransitionIntro] = useState<boolean>(false);

  const [products, setProducts] = useState<FragranceProduct[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [route, setRoute] = useState<{
    path: 'home' | 'product' | 'collection' | 'admin';
    productSlugOrId?: string;
    collectionSlug?: string;
  }>({ path: 'home' });

  const triggerPageIntro = () => {
    setIsPageTransitionIntro(true);
    setIntroKey((prev) => prev + 1);
    setShowIntro(true);
  };

  const [viewMode, setViewMode] = useState<'storefront' | 'admin'>('storefront');
  const [adminUser, setAdminUser] = useState<any | null>(null);
  const [csrfToken, setCsrfToken] = useState<string>('');

  const [storeSettings, setStoreSettings] = useState<any>(null);
  const [homepageData, setHomepageData] = useState<any>(null);

  const isInitialLoad = React.useRef(true);

  useEffect(() => {
    const syncRouteWithUrl = () => {
      const pathname = window.location.pathname;
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

      let nextRoute: {
        path: 'home' | 'product' | 'collection';
        productSlugOrId?: string;
        collectionSlug?: string;
      } = { path: 'home' };

      const queryProd = searchParams.get('product');
      if (queryProd) {
        nextRoute = { path: 'product', productSlugOrId: queryProd };
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

      if (!isInitialLoad.current) {
        setRoute((prev) => {
          const routeChanged =
            prev.path !== nextRoute.path ||
            prev.productSlugOrId !== nextRoute.productSlugOrId ||
            prev.collectionSlug !== nextRoute.collectionSlug;
          if (routeChanged) {
            triggerPageIntro();
          }
          return nextRoute;
        });
      } else {
        isInitialLoad.current = false;
        setRoute(nextRoute);
      }
    };

    syncRouteWithUrl();
    window.addEventListener('popstate', syncRouteWithUrl);
    window.addEventListener('hashchange', syncRouteWithUrl);
    return () => {
      window.removeEventListener('popstate', syncRouteWithUrl);
      window.removeEventListener('hashchange', syncRouteWithUrl);
    };
  }, []);

  useEffect(() => {
    const loadApiData = async () => {
      const [liveProducts, settings, hpData] = await Promise.all([
        fetchPublicProducts(),
        fetchStoreSettings(),
        fetchHomepageData(),
      ]);

      if (liveProducts && liveProducts.length > 0) {
        setProducts(liveProducts);
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

  const navigateToProduct = (productOrSlug: FragranceProduct | string) => {
    const slugOrId =
      typeof productOrSlug === 'string'
        ? productOrSlug
        : productOrSlug.slug || productOrSlug.id;
    const targetUrl = `/products/${slugOrId}`;
    const isNewPage = route.path !== 'product' || route.productSlugOrId !== slugOrId;
    if (window.location.pathname !== targetUrl) {
      window.history.pushState({}, '', targetUrl);
    }
    setRoute({ path: 'product', productSlugOrId: slugOrId });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (isNewPage) {
      triggerPageIntro();
    }
  };

  const navigateToCollection = (slug: string) => {
    const targetUrl = `/collections/${slug}`;
    const isNewPage = route.path !== 'collection' || route.collectionSlug !== slug;
    if (window.location.pathname !== targetUrl) {
      window.history.pushState({}, '', targetUrl);
    }
    setRoute({ path: 'collection', collectionSlug: slug });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (isNewPage) {
      triggerPageIntro();
    }
  };

  const navigateToHome = () => {
    const isNewPage = route.path !== 'home';
    if (window.location.pathname !== '/' && window.location.hash !== '#admin') {
      window.history.pushState({}, '', '/');
    }
    setRoute({ path: 'home' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (isNewPage) {
      triggerPageIntro();
    }
  };

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
    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (item) => item.product.id === product.id && item.selectedSize === size
      );
      if (existingIdx > -1) {
        const next = [...prev];
        next[existingIdx].quantity += qty;
        return next;
      }
      return [...prev, { product, selectedSize: size, price, quantity: qty }];
    });
    showToast(`Added ${size} ${product.brand} — ${product.name} to bag`);
  };

  const handleBuyNow = (
    product: FragranceProduct,
    size: string,
    price: number,
    qty = 1
  ) => {
    handleAddToCart(product, size, price, qty);
    setIsCartOpen(true);
  };

  const handleUpdateQty = (productId: string, size: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId && item.selectedSize === size) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveFromCart = (productId: string, size: string) => {
    setCart((prev) =>
      prev.filter((item) => !(item.product.id === productId && item.selectedSize === size))
    );
    showToast('Model removed from bag');
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
        <IntroSequence
          key={`intro-${introKey}`}
          isPageTransition={isPageTransitionIntro}
          onComplete={() => setShowIntro(false)}
        />
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
        onOpenCart={() => setIsCartOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenWishlist={() => showToast('Wishlist updated')}
        onNavigateHome={navigateToHome}
        onNavigateToCollection={navigateToCollection}
        storeSettings={storeSettings}
      />

      <main className="flex-1">
        {route.path === 'collection' && route.collectionSlug ? (
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

            <VideoSection
              videoData={
                homepageData?.sections?.video_showcase?.content ||
                homepageData?.sections?.video_hero?.content
              }
              products={products}
              onSelectProduct={(p) => navigateToProduct(p)}
              onExploreClick={handleExploreClick}
            />

            <CustomProductSections
              homepageData={homepageData}
              allProducts={products}
              onSelectProduct={(p) => navigateToProduct(p)}
              onAddToCart={(p, size, price) => handleAddToCart(p, size, price, 1)}
              onNavigateToCollection={navigateToCollection}
            />

            <TrustSection
              storeSettings={storeSettings}
              products={products}
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
            : isCartOpen
            ? 'bag'
            : route.path === 'collection'
            ? 'shop'
            : 'home'
        }
        cartCount={totalCartCount}
        onNavigateHome={navigateToHome}
        onNavigateShop={() => navigateToCollection('all')}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={() => setCart([])}
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

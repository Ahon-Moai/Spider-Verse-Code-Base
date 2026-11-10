import React, { useEffect, useState, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { getStoreSettings, StoreSettings } from './api';

// Lazy-loaded routes for performance & code-splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const TrackOrderPage = lazy(() => import('./pages/TrackOrderPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const PlaceholderPage = lazy(() => import('./pages/PlaceholderPage'));

const PageLoader = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
    <div className="w-10 h-10 border-2 border-[#e10600] border-t-transparent animate-spin rounded-full" />
    <span className="text-xs font-mono-telemetry uppercase text-[#8e9bb0] tracking-widest">
      SYNCHRONIZING PADDOCK TELEMETRY...
    </span>
  </div>
);

const AppLayout: React.FC<{ settings: StoreSettings | null }> = ({ settings }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#0b0d10] text-[#f0f2f5] selection:bg-[#e10600] selection:text-white">
      <Header settings={settings} />
      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer settings={settings} />
    </div>
  );
};

export default function App() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await getStoreSettings();
        setSettings(data);
      } catch {
        // Fallback gracefully
      }
    }
    loadSettings();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout settings={settings} />}>
          <Route index element={<HomePage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/:slugOrId" element={<ProductDetailPage />} />
          <Route path="collections/:slug" element={<ProductsPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="track" element={<TrackOrderPage />} />

          {/* Clean Placeholders for Tasks 3 and 4 */}
          <Route
            path="cart"
            element={
              <PlaceholderPage
                title="PIT BAG // CART STORAGE"
                taskPhase="SCHEDULED FOR TASK 3"
                description="Interactive shopping cart state, drawer slideouts, promo voucher application, and live calculation are part of Task 3."
              />
            }
          />
          <Route
            path="checkout"
            element={
              <PlaceholderPage
                title="PADDOCK CHECKOUT CONSOLE"
                taskPhase="SCHEDULED FOR TASK 3"
                description="Order placement, delivery zone rules (inside/outside Dhaka), and bKash / Cash on Delivery payments are part of Task 3."
              />
            }
          />
          <Route
            path="login"
            element={
              <PlaceholderPage
                title="CREW AUTHENTICATION"
                taskPhase="SCHEDULED FOR TASK 4"
                description="Secure session authentication and administrative controls are part of Task 4."
              />
            }
          />
          <Route
            path="admin/*"
            element={
              <PlaceholderPage
                title="PADDOCK TELEMETRY ADMIN CMS"
                taskPhase="SCHEDULED FOR TASK 4"
                description="The dedicated Spider Verse management dashboard, inventory volume trackers, order fulfillment, and media manager are part of Task 4."
              />
            }
          />

          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

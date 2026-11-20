import React, { useState } from 'react';
import {
  BarChart3,
  Package,
  ShoppingBag,
  Users,
  LayoutDashboard,
  Settings,
  Image as ImageIcon,
  LogOut,
  ExternalLink,
  Layers,
  Menu,
  X,
  ShieldCheck,
  ChevronRight,
  Sun,
  Moon,
  FlaskConical,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { ProductManager } from './ProductManager';
import { CollectionManager } from './CollectionManager';
import { OrderManager } from './OrderManager';
import { CustomerManager } from './CustomerManager';
import { HomepageCMS } from './HomepageCMS';
import { SettingsCMS } from './SettingsCMS';
import { MediaManager } from './MediaManager';
import { InventoryManager } from './InventoryManager';

interface AdminLayoutProps {
  user: {
    username: string;
    email: string;
    role: string;
  };
  csrfToken: string;
  onLogout: () => void;
  onSwitchToStorefront: () => void;
}

type AdminTabId =
  | 'analytics'
  | 'products'
  | 'inventory'
  | 'collections'
  | 'orders'
  | 'customers'
  | 'homepage'
  | 'settings'
  | 'media';

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  user,
  csrfToken,
  onLogout,
  onSwitchToStorefront
}) => {
  const [activeTab, setActiveTab] = useState<AdminTabId>('analytics');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('admin_theme') === 'dark';
  });

  const toggleDarkMode = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    localStorage.setItem('admin_theme', nextMode ? 'dark' : 'light');
  };

  const navGroups: Array<{
    title: string;
    items: ReadonlyArray<{
      id: AdminTabId;
      label: string;
      icon: React.ComponentType<{ className?: string }>;
      desc: string;
    }>;
  }> = [
    {
      title: 'Overview',
      items: [
        { id: 'analytics', label: 'Analytics & Insights', icon: BarChart3, desc: 'Sales performance & metrics' }
      ]
    },
    {
      title: 'Catalog & Stock',
      items: [
        { id: 'products', label: 'Products & Catalogue', icon: Package, desc: 'Manage catalogue & variants' },
        { id: 'collections', label: 'Categories & Slugs', icon: Layers, desc: 'Create categories & URL slugs' },
        { id: 'inventory', label: 'Stock & Inventory', icon: FlaskConical, desc: 'Track stock levels & ledger' }
      ]
    },
    {
      title: 'Sales & Customers',
      items: [
        { id: 'orders', label: 'Orders & Invoices', icon: ShoppingBag, desc: 'Track customer orders' },
        { id: 'customers', label: 'Customer Directory', icon: Users, desc: 'Customer accounts & contact' }
      ]
    },
    {
      title: 'Storefront & System',
      items: [
        { id: 'homepage', label: 'Website Content', icon: LayoutDashboard, desc: 'Homepage sections & banners' },
        { id: 'media', label: 'Media Library', icon: ImageIcon, desc: 'Uploaded images & media' },
        { id: 'settings', label: 'Store Settings', icon: Settings, desc: 'Preferences & configurations' }
      ]
    }
  ];

  const allNavItems = navGroups.flatMap((g) => g.items);
  const activeNavItem = allNavItems.find((item) => item.id === activeTab);

  return (
    <div
      className={`min-h-screen font-sans antialiased flex transition-colors duration-150 ${
        isDarkMode ? 'dark bg-[#09090B] text-zinc-100' : 'bg-[#FAFAFA] text-zinc-900'
      }`}
    >
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden lg:flex flex-col shrink-0 sticky top-0 h-screen border-r border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-[#0D0D0F] transition-[width] duration-200 z-30 ${
          isSidebarCollapsed ? 'w-[68px]' : 'w-64'
        }`}
      >
        {/* Sidebar Brand Header */}
        <div className="h-14 px-3.5 border-b border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between gap-2 shrink-0">
          {!isSidebarCollapsed ? (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-md bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 flex items-center justify-center text-[11px] font-bold tracking-tight shrink-0">
                AP
              </div>
              <div className="min-w-0">
                <span className="block text-xs font-semibold tracking-tight text-zinc-950 dark:text-zinc-100 truncate">
                  Apex Paddock
                </span>
                <span className="block text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                  Admin Console
                </span>
              </div>
            </div>
          ) : (
            <div className="w-7 h-7 mx-auto rounded-md bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 flex items-center justify-center text-[11px] font-bold tracking-tight shrink-0">
              AP
            </div>
          )}

          {!isSidebarCollapsed && (
            <button
              onClick={() => setIsSidebarCollapsed(true)}
              className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation Groups */}
        <div className="flex-1 overflow-y-auto px-2.5 py-4 space-y-5">
          {isSidebarCollapsed && (
            <div className="flex justify-center pb-1">
              <button
                onClick={() => setIsSidebarCollapsed(false)}
                className="p-2 rounded-md text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Expand sidebar"
                aria-label="Expand sidebar"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>
            </div>
          )}

          {navGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              {!isSidebarCollapsed && (
                <div className="px-2.5 pb-1">
                  <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
                    {group.title}
                  </span>
                </div>
              )}
              <nav className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      title={isSidebarCollapsed ? item.label : undefined}
                      className={`w-full flex items-center ${
                        isSidebarCollapsed ? 'justify-center px-0' : 'px-2.5 gap-2.5'
                      } h-9 rounded-md text-xs transition-colors cursor-pointer relative ${
                        isActive
                          ? 'bg-zinc-100 dark:bg-zinc-800/90 text-zinc-950 dark:text-white font-medium'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900/70 font-normal'
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive
                            ? 'text-zinc-950 dark:text-white'
                            : 'text-zinc-400 dark:text-zinc-500'
                        }`}
                      />
                      {!isSidebarCollapsed && (
                        <span className="truncate whitespace-nowrap">{item.label}</span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Sidebar Footer Actions */}
        <div className="p-2.5 border-t border-zinc-200/80 dark:border-zinc-800/80 space-y-1 shrink-0">
          <button
            onClick={onSwitchToStorefront}
            title={isSidebarCollapsed ? 'View Storefront' : undefined}
            className={`w-full flex items-center ${
              isSidebarCollapsed ? 'justify-center px-0' : 'px-2.5 gap-2.5'
            } h-9 rounded-md text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900/70 transition-colors cursor-pointer`}
          >
            <ExternalLink className="w-4 h-4 shrink-0 text-zinc-400" />
            {!isSidebarCollapsed && <span className="truncate">View Storefront</span>}
          </button>

          <button
            onClick={onLogout}
            title={isSidebarCollapsed ? 'Sign Out' : undefined}
            className={`w-full flex items-center ${
              isSidebarCollapsed ? 'justify-center px-0' : 'px-2.5 gap-2.5'
            } h-9 rounded-md text-xs text-zinc-600 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50/70 dark:hover:bg-rose-950/30 transition-colors cursor-pointer`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isSidebarCollapsed && <span className="truncate">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Column */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Sticky Top Utility Header */}
        <header className="h-14 sticky top-0 z-20 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/90 dark:bg-[#0D0D0F]/90 backdrop-blur-md px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Left: Mobile Trigger + Breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 -ml-2 lg:hidden rounded-md text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-2 text-xs min-w-0">
              <span className="text-zinc-400 dark:text-zinc-500 hidden sm:inline whitespace-nowrap">
                Console
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-700 hidden sm:inline shrink-0" />
              <span className="font-semibold text-zinc-950 dark:text-zinc-100 truncate">
                {activeNavItem?.label}
              </span>
            </div>
          </div>

          {/* Right: Theme Switch, Storefront Link, User Profile */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={toggleDarkMode}
              className="h-8 px-2.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-zinc-300" />
                  <span className="hidden sm:inline">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-zinc-600" />
                  <span className="hidden sm:inline">Dark</span>
                </>
              )}
            </button>

            <button
              onClick={onSwitchToStorefront}
              className="h-8 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap"
            >
              <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden sm:inline">Storefront</span>
            </button>

            <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 mx-0.5" />

            {/* User Account Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 h-8 pl-1 pr-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 flex items-center justify-center text-[11px] font-mono font-semibold shrink-0">
                  {typeof user?.username === 'string' ? user.username.charAt(0).toUpperCase() : 'A'}
                </div>
                <span className="hidden sm:inline text-xs font-medium text-zinc-800 dark:text-zinc-200 whitespace-nowrap">
                  {typeof user?.username === 'string' ? user.username : 'Admin'}
                </span>
              </button>

              {isUserMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-1.5 w-56 bg-white dark:bg-[#141417] border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg py-1.5 z-50">
                    <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800">
                      <p className="text-xs font-semibold text-zinc-950 dark:text-zinc-100">
                        {user?.username}
                      </p>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                        {user?.email || 'admin@apexpaddock.com'}
                      </p>
                      <p className="text-[10px] font-mono uppercase text-zinc-400 dark:text-zinc-500 mt-1">
                        {user?.role || 'Administrator'}
                      </p>
                    </div>

                    <div className="px-3 py-2 text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>CSRF Authenticated</span>
                    </div>

                    <div className="border-t border-zinc-100 dark:border-zinc-800 pt-1">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onLogout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-left transition-colors font-medium cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-zinc-950/60 backdrop-blur-xs"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            <div className="relative w-72 max-w-[85vw] h-full bg-white dark:bg-[#0D0D0F] border-r border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col z-10">
              <div className="h-14 px-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 flex items-center justify-center text-[11px] font-bold">
                    AP
                  </div>
                  <span className="font-semibold text-xs text-zinc-950 dark:text-zinc-100">
                    Apex Paddock
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
                {navGroups.map((group) => (
                  <div key={group.title} className="space-y-1">
                    <div className="px-2.5 pb-1">
                      <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
                        {group.title}
                      </span>
                    </div>
                    <nav className="space-y-0.5">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              setActiveTab(item.id);
                              setIsMobileMenuOpen(false);
                            }}
                            className={`w-full flex items-center gap-2.5 px-2.5 h-9 rounded-md text-xs transition-colors text-left cursor-pointer ${
                              isActive
                                ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-white font-medium'
                                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                            }`}
                          >
                            <Icon className="w-4 h-4 shrink-0" />
                            <span className="truncate">{item.label}</span>
                          </button>
                        );
                      })}
                    </nav>
                  </div>
                ))}
              </div>

              <div className="p-3 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  onClick={onLogout}
                  className="w-full h-9 flex items-center justify-center gap-2 px-3 rounded-md bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs font-medium cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Workspace Main Content */}
        <main className="flex-1 min-w-0 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {activeTab === 'analytics' && <AnalyticsDashboard csrfToken={csrfToken} />}
          {activeTab === 'products' && <ProductManager csrfToken={csrfToken} />}
          {activeTab === 'inventory' && <InventoryManager csrfToken={csrfToken} />}
          {activeTab === 'collections' && <CollectionManager csrfToken={csrfToken} />}
          {activeTab === 'orders' && <OrderManager csrfToken={csrfToken} />}
          {activeTab === 'customers' && <CustomerManager csrfToken={csrfToken} />}
          {activeTab === 'homepage' && <HomepageCMS csrfToken={csrfToken} />}
          {activeTab === 'settings' && <SettingsCMS csrfToken={csrfToken} />}
          {activeTab === 'media' && <MediaManager csrfToken={csrfToken} />}
        </main>
      </div>
    </div>
  );
};

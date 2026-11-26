import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  Search,
  Plus,
  Edit2,
  Trash2,
  History,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  X,
  Package,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { getErrorMessage } from '../services/api';

interface InventoryItem {
  id: string;
  product_id?: string;
  brand: string;
  name: string;
  bottle_size_ml: number;
  remaining_ml: number;
  low_stock_threshold_ml: number;
  notes?: string;
  image?: string;
  starting_price?: number;
  product_slug?: string;
  stock_percentage: number;
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
  created_at: string;
  updated_at: string;
}

interface InventoryStats {
  total_perfumes: number;
  total_remaining_ml: number;
  total_capacity_ml: number;
  low_stock_count: number;
  out_of_stock_count: number;
  in_stock_count: number;
}

interface InventoryTransaction {
  id: number;
  inventory_id: string;
  order_id?: number;
  order_number?: string;
  transaction_type:
    | 'initial_stock'
    | 'sale_deduction'
    | 'manual_adjustment'
    | 'restock'
    | 'order_cancellation'
    | 'order_refund';
  change_ml: number;
  previous_ml: number;
  new_ml: number;
  notes?: string;
  created_by: string;
  created_at: string;
  perfume_name?: string;
  perfume_brand?: string;
}

interface ProductCatalogOption {
  id: string;
  brand: string;
  name: string;
}

interface InventoryManagerProps {
  csrfToken: string;
}

const PAGE_SIZE = 12;

export const InventoryManager: React.FC<InventoryManagerProps> = ({ csrfToken }) => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<InventoryStats>({
    total_perfumes: 0,
    total_remaining_ml: 0,
    total_capacity_ml: 0,
    low_stock_count: 0,
    out_of_stock_count: 0,
    in_stock_count: 0
  });
  const [recentTransactions, setRecentTransactions] = useState<InventoryTransaction[]>([]);
  const [catalogOptions, setCatalogOptions] = useState<ProductCatalogOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);

  // Modals
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<InventoryItem> | null>(null);
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [adjustingItem, setAdjustingItem] = useState<InventoryItem | null>(null);
  const [adjustMode, setAdjustMode] = useState<'adjust' | 'restock'>('adjust');
  const [adjustChangeMl, setAdjustChangeMl] = useState<string>('');
  const [adjustTargetMl, setAdjustTargetMl] = useState<string>('');
  const [adjustReason, setAdjustReason] = useState<string>('');

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyItem, setHistoryItem] = useState<InventoryItem | null>(null);
  const [historyTransactions, setHistoryTransactions] = useState<InventoryTransaction[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  // Fetch Inventory and Catalog
  const fetchInventory = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);

      const res = await fetch(`/api/admin/inventory.php?${params.toString()}`);
      const data = await res.json();
      if (data.success && data.data) {
        setItems(data.data.items || []);
        if (data.data.stats) setStats(data.data.stats);
        if (data.data.recent_transactions) setRecentTransactions(data.data.recent_transactions);
      }
    } catch (e) {
      console.error('Failed to load inventory', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchCatalogOptions = async () => {
    try {
      const res = await fetch('/api/admin/products.php');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setCatalogOptions(
          data.data.map((p: any) => ({
            id: p.id,
            brand: p.brand,
            name: p.name
          }))
        );
      }
    } catch (e) {
      console.error('Failed to load catalog products', e);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchInventory();
    fetchCatalogOptions();
  }, [statusFilter]);

  // Handle Search on Submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchInventory();
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingItem({
      brand: '',
      name: '',
      product_id: '',
      bottle_size_ml: 0,
      remaining_ml: 0,
      low_stock_threshold_ml: 0,
      notes: ''
    });
    setIsAddEditOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item: InventoryItem) => {
    setEditingItem({ ...item });
    setIsAddEditOpen(true);
  };

  // Save Inventory (Create / Update)
  const handleSaveInventory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editingItem.name || !editingItem.brand) {
      alert('Item name and brand are required');
      return;
    }

    setSubmitting(true);
    const isNew = !editingItem.id;
    const url = isNew
      ? '/api/admin/inventory.php'
      : `/api/admin/inventory.php?id=${editingItem.id}`;
    const method = isNew ? 'POST' : 'PUT';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({
          ...editingItem,
          action: 'edit'
        })
      });

      const data = await res.json();
      if (data.success) {
        setIsAddEditOpen(false);
        setEditingItem(null);
        fetchInventory();
      } else {
        alert(getErrorMessage(data?.error || data, 'Failed to save inventory'));
      }
    } catch (err) {
      alert('Network error saving inventory item');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Adjust / Restock Modal
  const handleOpenAdjust = (item: InventoryItem, mode: 'adjust' | 'restock' = 'adjust') => {
    setAdjustingItem(item);
    setAdjustMode(mode);
    setAdjustChangeMl('');
    setAdjustTargetMl(item.remaining_ml.toString());
    setAdjustReason('');
    setIsAdjustOpen(true);
  };

  // Submit Adjustment / Restock
  const handleSaveAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingItem) return;

    setSubmitting(true);
    try {
      let payload: any = {
        id: adjustingItem.id,
        action: adjustMode,
        notes: adjustReason
      };

      if (adjustMode === 'restock') {
        const val = parseFloat(adjustChangeMl);
        if (isNaN(val) || val <= 0) {
          alert('Please enter a positive value to restock');
          setSubmitting(false);
          return;
        }
        payload.restock_ml = val;
      } else {
        if (adjustTargetMl !== '') {
          const val = parseFloat(adjustTargetMl);
          if (isNaN(val) || val < 0) {
            alert('Remaining quantity must be 0 or greater');
            setSubmitting(false);
            return;
          }
          payload.new_ml = val;
        } else if (adjustChangeMl !== '') {
          const delta = parseFloat(adjustChangeMl);
          if (isNaN(delta) || delta === 0) {
            alert('Please specify a valid adjustment change');
            setSubmitting(false);
            return;
          }
          payload.change_ml = delta;
        } else {
          alert('Please specify either new remaining quantity or change');
          setSubmitting(false);
          return;
        }
      }

      const res = await fetch(`/api/admin/inventory.php?id=${adjustingItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        setIsAdjustOpen(false);
        setAdjustingItem(null);
        fetchInventory();
      } else {
        alert(getErrorMessage(data?.error || data, 'Failed to update stock quantity'));
      }
    } catch (e) {
      alert('Error updating stock');
    } finally {
      setSubmitting(false);
    }
  };

  // Open History Drawer
  const handleOpenHistory = async (item: InventoryItem) => {
    setHistoryItem(item);
    setIsHistoryOpen(true);
    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/admin/inventory.php?id=${item.id}&history=1`);
      const data = await res.json();
      if (data.success && data.data) {
        setHistoryTransactions(data.data.transactions || []);
      }
    } catch (e) {
      console.error('Failed to load transaction history', e);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Delete Inventory Item
  const handleDeleteItem = async (item: InventoryItem) => {
    if (
      !confirm(
        `Are you sure you want to remove ${item.brand} - ${item.name} from inventory tracking? All transaction history for this item will be cleared.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/inventory.php?id=${item.id}`, {
        method: 'DELETE',
        headers: { 'X-CSRF-Token': csrfToken }
      });
      const data = await res.json();
      if (data.success) {
        fetchInventory();
      } else {
        alert(getErrorMessage(data?.error || data, 'Failed to delete inventory record'));
      }
    } catch (e) {
      alert('Network error deleting inventory item');
    }
  };

  // Format Status Badge
  const renderStatusBadge = (status: 'in_stock' | 'low_stock' | 'out_of_stock') => {
    switch (status) {
      case 'in_stock':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-md">
            <CheckCircle2 className="w-3 h-3 shrink-0" />
            <span>In Stock</span>
          </span>
        );
      case 'low_stock':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-medium text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-md">
            <AlertTriangle className="w-3 h-3 shrink-0" />
            <span>Low Stock</span>
          </span>
        );
      case 'out_of_stock':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-medium text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-md">
            <XCircle className="w-3 h-3 shrink-0" />
            <span>Out of Stock</span>
          </span>
        );
    }
  };

  // Format Transaction Type
  const formatTxType = (type: string) => {
    switch (type) {
      case 'initial_stock':
        return {
          label: 'Initial Stock',
          color:
            'text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700'
        };
      case 'sale_deduction':
        return {
          label: 'Sale Deduction',
          color:
            'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60'
        };
      case 'manual_adjustment':
        return {
          label: 'Manual Adjustment',
          color:
            'text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60'
        };
      case 'restock':
        return {
          label: 'Restock / Refill',
          color:
            'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60'
        };
      case 'order_cancellation':
        return {
          label: 'Order Cancelled',
          color:
            'text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900/60'
        };
      case 'order_refund':
        return {
          label: 'Order Refunded',
          color:
            'text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60'
        };
      default:
        return {
          label: type,
          color:
            'text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700'
        };
    }
  };

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedItems = items.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const inputCls =
    'w-full h-9 rounded-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-400 transition-colors';

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-200/80 dark:border-zinc-800/80">
        <div>
          <h1 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100 tracking-tight">
            Stock &amp; Inventory Management
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Track stock quantities, automate deductions, configure low-stock thresholds, and audit ledger history
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => fetchInventory()}
            className="h-9 w-9 inline-flex items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer"
            title="Refresh Inventory"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-md bg-zinc-950 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-950 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Add Inventory Item</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#111113] border border-zinc-200/80 dark:border-zinc-800/80 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-xs font-medium">Tracked Items</span>
            <Package className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <p className="text-xl font-semibold font-mono text-zinc-950 dark:text-zinc-100 tabular-nums">
            {stats.total_perfumes}
          </p>
          <div className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
            <span className="text-emerald-700 dark:text-emerald-400 font-medium tabular-nums">
              {stats.in_stock_count} in stock
            </span>
            <span aria-hidden="true">·</span>
            <span>Active ledger</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111113] border border-zinc-200/80 dark:border-zinc-800/80 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-xs font-medium">Remaining Volume</span>
            <FlaskConical className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <p className="text-xl font-semibold font-mono text-zinc-950 dark:text-zinc-100 tabular-nums">
            {stats.total_remaining_ml.toLocaleString()}{' '}
            <span className="text-xs font-normal text-zinc-400">units</span>
          </p>
          <div className="text-[11px] text-zinc-500 dark:text-zinc-400 tabular-nums">
            Capacity: {stats.total_capacity_ml.toLocaleString()} (
            {stats.total_capacity_ml > 0
              ? Math.round((stats.total_remaining_ml / stats.total_capacity_ml) * 100)
              : 0}
            %)
          </div>
        </div>

        <div className="bg-white dark:bg-[#111113] border border-zinc-200/80 dark:border-zinc-800/80 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-xs font-medium">Low Stock Warnings</span>
            <AlertTriangle
              className={`w-3.5 h-3.5 ${
                stats.low_stock_count > 0 ? 'text-amber-500' : 'text-zinc-400'
              }`}
            />
          </div>
          <p
            className={`text-xl font-semibold font-mono tabular-nums ${
              stats.low_stock_count > 0
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-zinc-950 dark:text-zinc-100'
            }`}
          >
            {stats.low_stock_count}
          </p>
          <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
            {stats.low_stock_count > 0 ? 'Requires refill soon' : 'All above threshold'}
          </div>
        </div>

        <div className="bg-white dark:bg-[#111113] border border-zinc-200/80 dark:border-zinc-800/80 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-xs font-medium">Depleted (0)</span>
            <XCircle
              className={`w-3.5 h-3.5 ${
                stats.out_of_stock_count > 0 ? 'text-rose-500' : 'text-zinc-400'
              }`}
            />
          </div>
          <p
            className={`text-xl font-semibold font-mono tabular-nums ${
              stats.out_of_stock_count > 0
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-zinc-950 dark:text-zinc-100'
            }`}
          >
            {stats.out_of_stock_count}
          </p>
          <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
            {stats.out_of_stock_count > 0 ? 'Temporarily unavailable' : 'No items depleted'}
          </div>
        </div>
      </div>

      {/* Low-stock Warning Banner if any */}
      {stats.low_stock_count > 0 && (
        <div className="bg-amber-50/70 dark:bg-amber-950/25 border border-amber-200 dark:border-amber-900/50 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 dark:text-amber-200 text-xs">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <span className="font-semibold block">Low Stock Alert</span>
              <p className="text-amber-800/90 dark:text-amber-300/90 mt-0.5">
                {stats.low_stock_count} tracked item(s) have reached or fallen below their configured low-stock threshold.
              </p>
            </div>
          </div>
          <button
            onClick={() => setStatusFilter('low_stock')}
            className="h-8 px-3 rounded-md bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs transition-colors shrink-0 cursor-pointer self-start sm:self-auto"
          >
            View Low Stock
          </button>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by item name, brand or notes..."
            className="w-full h-9 rounded-md bg-white dark:bg-[#111113] border border-zinc-200/80 dark:border-zinc-800 pl-9 pr-4 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-400 transition-colors"
          />
        </form>

        <div className="inline-flex flex-wrap items-center gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg border border-zinc-200/80 dark:border-zinc-800 self-start">
          {[
            { id: 'all', label: 'All Items' },
            { id: 'in_stock', label: 'In Stock' },
            { id: 'low_stock', label: 'Low Stock' },
            { id: 'out_of_stock', label: 'Out of Stock' }
          ].map((flt) => (
            <button
              key={flt.id}
              onClick={() => setStatusFilter(flt.id)}
              className={`px-2.5 py-1 text-xs rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === flt.id
                  ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white font-semibold shadow-2xs'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 font-medium'
              }`}
            >
              {flt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Inventory Table */}
      <div className="bg-white dark:bg-[#111113] border border-zinc-200/80 dark:border-zinc-800/80 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-900 dark:text-zinc-100">
            <thead className="bg-zinc-50/80 dark:bg-zinc-900/60 text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-[11px] font-medium border-b border-zinc-200/80 dark:border-zinc-800/80">
              <tr>
                <th className="py-3 px-4 font-medium">Item &amp; Brand</th>
                <th className="py-3 px-4 font-medium">Base Capacity</th>
                <th className="py-3 px-4 font-medium">Remaining</th>
                <th className="py-3 px-4 font-medium w-48">Level (%)</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium">Threshold</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="py-4 px-4">
                      <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-full" />
                    </td>
                  </tr>
                ))
              ) : paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      No inventory records match your filter
                    </p>
                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">
                      Try clearing filters or add a new item to track.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => {
                  const percentage = item.stock_percentage;
                  let barColor = 'bg-emerald-500';
                  if (item.stock_status === 'out_of_stock') barColor = 'bg-rose-500';
                  else if (item.stock_status === 'low_stock') barColor = 'bg-amber-500';

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-zinc-50/70 dark:hover:bg-zinc-900/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-1 shrink-0 flex items-center justify-center rounded-md overflow-hidden">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="max-h-full max-w-full object-contain"
                              />
                            ) : (
                              <FlaskConical className="w-4 h-4 text-zinc-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-zinc-950 dark:text-zinc-100 truncate">
                              {item.name}
                            </p>
                            <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                              <span className="font-medium">{item.brand}</span>
                              {item.product_id && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span className="font-mono text-zinc-400 dark:text-zinc-500">
                                    Linked
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-zinc-700 dark:text-zinc-300 tabular-nums whitespace-nowrap">
                        {item.bottle_size_ml}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-mono font-semibold text-zinc-950 dark:text-zinc-100 tabular-nums">
                          {item.remaining_ml}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center text-[11px] font-mono tabular-nums">
                            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                              {percentage}%
                            </span>
                            <span className="text-zinc-400 dark:text-zinc-500">
                              {item.remaining_ml}/{item.bottle_size_ml}
                            </span>
                          </div>
                          <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                              style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        {renderStatusBadge(item.stock_status)}
                      </td>

                      <td className="py-3 px-4 font-mono text-zinc-500 dark:text-zinc-400 text-[11px] tabular-nums whitespace-nowrap">
                        &le; {item.low_stock_threshold_ml}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleOpenAdjust(item, 'adjust')}
                            className="h-7 px-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-[11px] font-medium transition-colors cursor-pointer"
                            title="Adjust stock manually"
                          >
                            Adjust
                          </button>
                          <button
                            onClick={() => handleOpenAdjust(item, 'restock')}
                            className="h-7 px-2 rounded-md border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white text-[11px] font-medium transition-colors cursor-pointer"
                            title="Restock item"
                          >
                            Restock
                          </button>
                          <button
                            onClick={() => handleOpenHistory(item)}
                            className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                            title="View Stock History"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                            title="Edit Information"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item)}
                            className="p-1.5 rounded-md text-zinc-500 hover:text-rose-600 hover:bg-rose-50 dark:text-zinc-400 dark:hover:text-rose-400 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                            title="Remove from inventory"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {items.length > PAGE_SIZE && (
          <div className="px-4 py-3 border-t border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span className="tabular-nums">
              Showing {(currentPage - 1) * PAGE_SIZE + 1}–
              {Math.min(currentPage * PAGE_SIZE, items.length)} of {items.length}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="h-7 px-2.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-40 inline-flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>
              <span className="px-2 font-mono tabular-nums text-zinc-700 dark:text-zinc-300">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="h-7 px-2.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-40 inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Recent Ledger Activity */}
      {recentTransactions.length > 0 && (
        <div className="bg-white dark:bg-[#111113] border border-zinc-200/80 dark:border-zinc-800/80 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-200/80 dark:border-zinc-800/80">
            <h3 className="text-sm font-semibold text-zinc-950 dark:text-zinc-100">
              Recent Inventory Ledger
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Live audit trail of automatic sales deductions, restocks, and manual adjustments
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-900 dark:text-zinc-100">
              <thead className="bg-zinc-50/80 dark:bg-zinc-900/60 text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-[11px] font-medium border-b border-zinc-200/80 dark:border-zinc-800/80">
                <tr>
                  <th className="py-2.5 px-4 font-medium">Timestamp</th>
                  <th className="py-2.5 px-4 font-medium">Item</th>
                  <th className="py-2.5 px-4 font-medium">Type</th>
                  <th className="py-2.5 px-4 font-medium">Delta</th>
                  <th className="py-2.5 px-4 font-medium">Before &rarr; After</th>
                  <th className="py-2.5 px-4 font-medium">Order / Notes</th>
                  <th className="py-2.5 px-4 font-medium">User</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                {recentTransactions.map((tx) => {
                  const typeInfo = formatTxType(tx.transaction_type);
                  const isNegative = tx.change_ml < 0;

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-zinc-50/70 dark:hover:bg-zinc-900/50 transition-colors"
                    >
                      <td className="py-2.5 px-4 font-mono text-[11px] text-zinc-400 dark:text-zinc-500 whitespace-nowrap tabular-nums">
                        {tx.created_at}
                      </td>
                      <td className="py-2.5 px-4 font-medium text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                        {tx.perfume_brand} — {tx.perfume_name}
                      </td>
                      <td className="py-2.5 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 text-[11px] font-medium rounded-md ${typeInfo.color}`}
                        >
                          {typeInfo.label}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-mono font-semibold tabular-nums whitespace-nowrap">
                        <span
                          className={
                            isNegative
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-emerald-600 dark:text-emerald-400'
                          }
                        >
                          {isNegative ? '' : '+'}
                          {tx.change_ml}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-mono text-[11px] text-zinc-500 dark:text-zinc-400 tabular-nums whitespace-nowrap">
                        {tx.previous_ml} &rarr;{' '}
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {tx.new_ml}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-[11px] text-zinc-500 dark:text-zinc-400 max-w-xs truncate">
                        {tx.order_number ? (
                          <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100 mr-1.5">
                            #{tx.order_number}
                          </span>
                        ) : null}
                        {tx.notes || '—'}
                      </td>
                      <td className="py-2.5 px-4 text-[11px] font-mono text-zinc-400 dark:text-zinc-500">
                        {tx.created_by}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isAddEditOpen && editingItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-white dark:bg-[#111113] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden text-zinc-900 dark:text-zinc-100 my-8">
            <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800 px-6 py-4">
              <div>
                <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
                  {editingItem.id ? 'Edit Inventory Record' : 'New Inventory Record'}
                </span>
                <h3 className="text-sm font-semibold text-zinc-950 dark:text-zinc-100">
                  {editingItem.id ? `Edit ${editingItem.name}` : 'Add Item to Inventory'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddEditOpen(false)}
                className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100 dark:hover:text-white dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveInventory} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Link with Catalog Product (Optional)
                </label>
                <select
                  value={editingItem.product_id || ''}
                  onChange={(e) => {
                    const selId = e.target.value;
                    const found = catalogOptions.find((c) => c.id === selId);
                    if (found) {
                      setEditingItem({
                        ...editingItem,
                        product_id: selId,
                        brand: found.brand,
                        name: found.name
                      });
                    } else {
                      setEditingItem({
                        ...editingItem,
                        product_id: ''
                      });
                    }
                  }}
                  className={inputCls}
                >
                  <option value="">-- Standalone Item (Not Linked) --</option>
                  {catalogOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.brand} - {opt.name} ({opt.id})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                  Linking automatically connects orders placed for this catalog product to this inventory record.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Brand Name *
                  </label>
                  <input
                    type="text"
                    value={editingItem.brand || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, brand: e.target.value })}
                    required
                    placeholder="e.g. Bburago, Minichamps"
                    className={inputCls}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    value={editingItem.name || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                    required
                    placeholder="e.g. Ferrari SF-24 1:18"
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Capacity *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    value={editingItem.bottle_size_ml || 100}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        bottle_size_ml: parseFloat(e.target.value) || 0
                      })
                    }
                    required
                    className={`${inputCls} font-mono tabular-nums`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Remaining *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={
                      editingItem.remaining_ml === 0 || editingItem.remaining_ml
                        ? editingItem.remaining_ml
                        : ''
                    }
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        remaining_ml: parseFloat(e.target.value) || 0
                      })
                    }
                    required
                    className={`${inputCls} font-mono tabular-nums`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Low Threshold
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    value={editingItem.low_stock_threshold_ml || 15}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        low_stock_threshold_ml: parseFloat(e.target.value) || 0
                      })
                    }
                    required
                    className={`${inputCls} font-mono tabular-nums`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Batch Notes &amp; Location
                </label>
                <textarea
                  value={editingItem.notes || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, notes: e.target.value })}
                  rows={2}
                  placeholder="e.g. Batch #2026A, Warehouse Shelf B2"
                  className="w-full rounded-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-200/80 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddEditOpen(false)}
                  className="h-9 px-4 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-200 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="h-9 px-5 rounded-md bg-zinc-950 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-950 text-xs font-medium cursor-pointer transition-colors disabled:opacity-50"
                >
                  {submitting
                    ? 'Saving...'
                    : editingItem.id
                    ? 'Save Changes'
                    : 'Create Inventory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust / Restock Modal */}
      {isAdjustOpen && adjustingItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white dark:bg-[#111113] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden text-zinc-900 dark:text-zinc-100 my-8">
            <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800 px-6 py-4">
              <div>
                <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
                  {adjustMode === 'restock' ? 'Restock Inventory' : 'Manual Stock Adjustment'}
                </span>
                <h3 className="text-sm font-semibold text-zinc-950 dark:text-zinc-100">
                  {adjustingItem.brand} — {adjustingItem.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAdjustOpen(false)}
                className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100 dark:hover:text-white dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Current Stock Banner */}
              <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3.5 rounded-lg border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between">
                <span className="text-xs text-zinc-500 dark:text-zinc-400">Current Remaining</span>
                <span className="font-mono text-xs font-semibold text-zinc-950 dark:text-zinc-100 tabular-nums">
                  {adjustingItem.remaining_ml} / {adjustingItem.bottle_size_ml} ({adjustingItem.stock_percentage}%)
                </span>
              </div>

              <form onSubmit={handleSaveAdjust} className="space-y-4">
                {adjustMode === 'restock' ? (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      Add Quantity to Stock (+) *
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      value={adjustChangeMl}
                      onChange={(e) => setAdjustChangeMl(e.target.value)}
                      required
                      placeholder="e.g. 100"
                      className={`${inputCls} font-mono tabular-nums`}
                    />
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Resulting total:{' '}
                      <strong className="font-mono text-zinc-950 dark:text-zinc-100 tabular-nums">
                        {round(adjustingItem.remaining_ml + (parseFloat(adjustChangeMl) || 0))}
                      </strong>
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      Set New Remaining Target *
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={adjustTargetMl}
                      onChange={(e) => {
                        setAdjustTargetMl(e.target.value);
                        setAdjustChangeMl('');
                      }}
                      className={`${inputCls} font-mono tabular-nums`}
                    />
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Net change:{' '}
                      <strong className="font-mono text-zinc-950 dark:text-zinc-100 tabular-nums">
                        {round((parseFloat(adjustTargetMl) || 0) - adjustingItem.remaining_ml) > 0
                          ? '+'
                          : ''}
                        {round((parseFloat(adjustTargetMl) || 0) - adjustingItem.remaining_ml)}
                      </strong>
                    </p>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Reason / Audit Note *
                  </label>
                  <input
                    type="text"
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    required
                    placeholder="e.g. Physical inventory check, damaged unit, restock"
                    className={inputCls}
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-200/80 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsAdjustOpen(false)}
                    className="h-9 px-4 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-200 cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="h-9 px-5 rounded-md bg-zinc-950 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-950 text-xs font-medium cursor-pointer transition-colors disabled:opacity-50"
                  >
                    {submitting
                      ? 'Updating...'
                      : adjustMode === 'restock'
                      ? 'Confirm Restock'
                      : 'Apply Adjustment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Stock History & Transactions Modal */}
      {isHistoryOpen && historyItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-3xl bg-white dark:bg-[#111113] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden text-zinc-900 dark:text-zinc-100 my-8">
            <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800 px-6 py-4">
              <div>
                <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
                  Stock History &amp; Ledger
                </span>
                <h3 className="text-base font-semibold text-zinc-950 dark:text-zinc-100">
                  {historyItem.brand} — {historyItem.name}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 tabular-nums">
                  Capacity: {historyItem.bottle_size_ml} · Remaining:{' '}
                  <strong className="font-mono text-zinc-950 dark:text-zinc-100">
                    {historyItem.remaining_ml} ({historyItem.stock_percentage}%)
                  </strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsHistoryOpen(false)}
                className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100 dark:hover:text-white dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {loadingHistory ? (
                <div className="py-12 text-center text-xs text-zinc-500 dark:text-zinc-400">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto text-zinc-900 dark:text-zinc-100 mb-2" />
                  <span>Loading transaction ledger...</span>
                </div>
              ) : historyTransactions.length === 0 ? (
                <p className="py-10 text-center text-xs text-zinc-500 dark:text-zinc-400">
                  No transactions recorded for this item yet.
                </p>
              ) : (
                <table className="w-full text-left text-xs text-zinc-900 dark:text-zinc-100">
                  <thead className="bg-zinc-50/90 dark:bg-zinc-900/90 text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-[11px] font-medium border-b border-zinc-200/80 dark:border-zinc-800 sticky top-0">
                    <tr>
                      <th className="py-2.5 px-4 font-medium">Date</th>
                      <th className="py-2.5 px-4 font-medium">Type</th>
                      <th className="py-2.5 px-4 font-medium">Change</th>
                      <th className="py-2.5 px-4 font-medium">Prev &rarr; New</th>
                      <th className="py-2.5 px-4 font-medium">Order / Details</th>
                      <th className="py-2.5 px-4 font-medium">Logged By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                    {historyTransactions.map((tx) => {
                      const typeInfo = formatTxType(tx.transaction_type);
                      const isNegative = tx.change_ml < 0;

                      return (
                        <tr
                          key={tx.id}
                          className="hover:bg-zinc-50/70 dark:hover:bg-zinc-900/50 transition-colors"
                        >
                          <td className="py-2.5 px-4 font-mono text-[11px] text-zinc-400 dark:text-zinc-500 whitespace-nowrap tabular-nums">
                            {tx.created_at}
                          </td>
                          <td className="py-2.5 px-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 text-[11px] font-medium rounded-md ${typeInfo.color}`}
                            >
                              {typeInfo.label}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 font-mono font-semibold tabular-nums whitespace-nowrap">
                            <span
                              className={
                                isNegative
                                  ? 'text-rose-600 dark:text-rose-400'
                                  : 'text-emerald-600 dark:text-emerald-400'
                              }
                            >
                              {isNegative ? '' : '+'}
                              {tx.change_ml}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 font-mono text-[11px] text-zinc-500 dark:text-zinc-400 whitespace-nowrap tabular-nums">
                            {tx.previous_ml} &rarr;{' '}
                            <strong className="text-zinc-900 dark:text-zinc-100">
                              {tx.new_ml}
                            </strong>
                          </td>
                          <td className="py-2.5 px-4 text-[11px] text-zinc-500 dark:text-zinc-400">
                            {tx.order_number && (
                              <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100 mr-1.5 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                                #{tx.order_number}
                              </span>
                            )}
                            {tx.notes || '—'}
                          </td>
                          <td className="py-2.5 px-4 text-[11px] font-mono text-zinc-400 dark:text-zinc-500">
                            {tx.created_by}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            <div className="flex items-center justify-end px-6 py-4 border-t border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40">
              <button
                type="button"
                onClick={() => setIsHistoryOpen(false)}
                className="h-9 px-4 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs font-medium cursor-pointer transition-colors"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper to round cleanly
function round(num: number): number {
  return Math.round(num * 100) / 100;
}

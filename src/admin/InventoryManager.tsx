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
  TrendingDown,
  RefreshCw,
  SlidersHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  X,
  Package,
  Layers,
  Sparkles
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
  transaction_type: 'initial_stock' | 'sale_deduction' | 'manual_adjustment' | 'restock' | 'order_cancellation' | 'order_refund';
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
        setCatalogOptions(data.data.map((p: any) => ({
          id: p.id,
          brand: p.brand,
          name: p.name
        })));
      }
    } catch (e) {
      console.error('Failed to load catalog products', e);
    }
  };

  useEffect(() => {
    fetchInventory();
    fetchCatalogOptions();
  }, [statusFilter]);

  // Handle Search on Submit/Keyup
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchInventory();
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingItem({
      brand: 'ARRINA',
      name: '',
      product_id: '',
      bottle_size_ml: 100,
      remaining_ml: 100,
      low_stock_threshold_ml: 15,
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
      alert('Perfume name and brand are required');
      return;
    }

    setSubmitting(true);
    const isNew = !editingItem.id;
    const url = isNew ? '/api/admin/inventory.php' : `/api/admin/inventory.php?id=${editingItem.id}`;
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
        alert(getErrorMessage(data?.error || data, 'Failed to save perfume inventory'));
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
    setAdjustChangeMl(mode === 'restock' ? '50' : '');
    setAdjustTargetMl(item.remaining_ml.toString());
    setAdjustReason(mode === 'restock' ? 'New batch / bottle refill' : 'Physical count reconciliation');
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
          alert('Please enter a positive ML value to restock');
          setSubmitting(false);
          return;
        }
        payload.restock_ml = val;
      } else {
        if (adjustTargetMl !== '') {
          const val = parseFloat(adjustTargetMl);
          if (isNaN(val) || val < 0) {
            alert('Remaining ML must be 0 or greater');
            setSubmitting(false);
            return;
          }
          payload.new_ml = val;
        } else if (adjustChangeMl !== '') {
          const delta = parseFloat(adjustChangeMl);
          if (isNaN(delta) || delta === 0) {
            alert('Please specify a valid ML adjustment change');
            setSubmitting(false);
            return;
          }
          payload.change_ml = delta;
        } else {
          alert('Please specify either new remaining ML or change in ML');
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
    if (!confirm(`Are you sure you want to remove ${item.brand} - ${item.name} from inventory tracking? All transaction history for this item will be cleared.`)) {
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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-mono uppercase font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>In Stock</span>
          </span>
        );
      case 'low_stock':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-mono uppercase font-bold text-amber-900 bg-amber-50 border border-amber-300 rounded animate-pulse">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            <span>Low Stock</span>
          </span>
        );
      case 'out_of_stock':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-mono uppercase font-bold text-red-800 bg-red-50 border border-red-300 rounded">
            <XCircle className="w-3 h-3 text-red-600" />
            <span>Out of Stock</span>
          </span>
        );
    }
  };

  // Format Transaction Type
  const formatTxType = (type: string) => {
    switch (type) {
      case 'initial_stock':
        return { label: 'Initial Stock', color: 'text-zinc-700 bg-zinc-100' };
      case 'sale_deduction':
        return { label: 'Sale Deduction', color: 'text-rose-700 bg-rose-50 border border-rose-200' };
      case 'manual_adjustment':
        return { label: 'Manual Adjustment', color: 'text-amber-800 bg-amber-50 border border-amber-200' };
      case 'restock':
        return { label: 'Restock / Refill', color: 'text-emerald-800 bg-emerald-50 border border-emerald-200' };
      case 'order_cancellation':
        return { label: 'Order Cancelled (Restored)', color: 'text-blue-800 bg-blue-50 border border-blue-200' };
      case 'order_refund':
        return { label: 'Order Refunded (Restored)', color: 'text-purple-800 bg-purple-50 border border-purple-200' };
      default:
        return { label: type, color: 'text-zinc-700 bg-zinc-100' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#EAEAEA] p-6 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-[#111111] text-white flex items-center justify-center">
              <FlaskConical className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h2 className="font-serif text-xl text-[#111111] font-normal tracking-tight">
                ML-Based Perfume Stock Management
              </h2>
              <p className="text-xs text-[#737373] font-sans">
                Track master bottle volumes, automate decant deductions, configure low-stock alerts & ledger history
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchInventory()}
            className="p-2 border border-[#EAEAEA] hover:bg-[#F8F8F8] text-[#737373] hover:text-[#111111] transition-colors cursor-pointer"
            title="Refresh Inventory"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 bg-[#111111] text-white hover:bg-amber-400 hover:text-black text-xs font-semibold uppercase tracking-wider px-5 py-2.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Perfume to Inventory</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Perfumes */}
        <div className="bg-white border border-[#EAEAEA] p-5 shadow-2xs">
          <div className="flex items-center justify-between text-[#737373]">
            <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">Total Perfumes</span>
            <Package className="w-4 h-4 opacity-70" />
          </div>
          <p className="text-2xl font-serif font-bold text-[#111111] mt-2">{stats.total_perfumes}</p>
          <div className="text-[11px] text-[#737373] mt-1 flex items-center gap-1">
            <span className="text-emerald-600 font-semibold">{stats.in_stock_count} In Stock</span>
            <span>·</span>
            <span className="text-zinc-500">Tracked in Atelier</span>
          </div>
        </div>

        {/* Total Remaining ML */}
        <div className="bg-white border border-[#EAEAEA] p-5 shadow-2xs">
          <div className="flex items-center justify-between text-[#737373]">
            <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">Total Remaining ML</span>
            <FlaskConical className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-serif font-bold text-[#111111] mt-2">
            {stats.total_remaining_ml.toLocaleString()} <span className="text-sm font-sans font-normal text-[#737373]">ML</span>
          </p>
          <div className="text-[11px] text-[#737373] mt-1">
            Total capacity: {stats.total_capacity_ml.toLocaleString()} ML (
            {stats.total_capacity_ml > 0 ? Math.round((stats.total_remaining_ml / stats.total_capacity_ml) * 100) : 0}% aggregate)
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white border border-[#EAEAEA] p-5 shadow-2xs">
          <div className="flex items-center justify-between text-[#737373]">
            <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">Low Stock Warnings</span>
            <AlertTriangle className={`w-4 h-4 ${stats.low_stock_count > 0 ? 'text-amber-500' : 'text-zinc-400'}`} />
          </div>
          <p className={`text-2xl font-serif font-bold mt-2 ${stats.low_stock_count > 0 ? 'text-amber-600' : 'text-[#111111]'}`}>
            {stats.low_stock_count}
          </p>
          <div className="text-[11px] text-[#737373] mt-1">
            {stats.low_stock_count > 0 ? 'Requires attention / refill soon' : 'All bottles above threshold'}
          </div>
        </div>

        {/* Out of Stock */}
        <div className="bg-white border border-[#EAEAEA] p-5 shadow-2xs">
          <div className="flex items-center justify-between text-[#737373]">
            <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">Depleted (0 ML)</span>
            <XCircle className={`w-4 h-4 ${stats.out_of_stock_count > 0 ? 'text-rose-500' : 'text-zinc-400'}`} />
          </div>
          <p className={`text-2xl font-serif font-bold mt-2 ${stats.out_of_stock_count > 0 ? 'text-rose-600' : 'text-[#111111]'}`}>
            {stats.out_of_stock_count}
          </p>
          <div className="text-[11px] text-[#737373] mt-1">
            {stats.out_of_stock_count > 0 ? 'Decants temporarily unavailable' : 'No bottles depleted'}
          </div>
        </div>
      </div>

      {/* Low-stock Warning Banner if any */}
      {stats.low_stock_count > 0 && (
        <div className="bg-amber-50 border border-amber-300 p-4 flex items-start gap-3 text-amber-900 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold uppercase tracking-wider text-[11px] block">Low ML Stock Alert</span>
            <p className="mt-0.5">
              {stats.low_stock_count} master perfume bottle(s) have reached or fallen below their configured low-stock threshold. Restock or adjust remaining volume to prevent order rejection.
            </p>
          </div>
          <button
            onClick={() => setStatusFilter('low_stock')}
            className="px-3 py-1 bg-amber-600 text-white font-semibold uppercase text-[10px] hover:bg-amber-700 transition-colors shrink-0 cursor-pointer"
          >
            View Low Stock
          </button>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="bg-white border border-[#EAEAEA] p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#737373]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by perfume name, brand or notes..."
            className="w-full bg-[#F8F8F8] border border-[#EAEAEA] pl-10 pr-4 py-2 text-xs text-[#111111] placeholder-zinc-500 focus:outline-none focus:border-[#111111]"
          />
        </form>

        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {[
            { id: 'all', label: 'All Perfumes' },
            { id: 'in_stock', label: 'In Stock' },
            { id: 'low_stock', label: 'Low Stock' },
            { id: 'out_of_stock', label: 'Out of Stock' }
          ].map((flt) => (
            <button
              key={flt.id}
              onClick={() => setStatusFilter(flt.id)}
              className={`px-3 py-1.5 text-[10px] uppercase font-sans tracking-wider border transition-colors cursor-pointer ${
                statusFilter === flt.id
                  ? 'bg-[#111111] text-white border-[#111111] font-semibold'
                  : 'bg-[#F8F8F8] text-[#737373] border-[#EAEAEA] hover:text-[#111111]'
              }`}
            >
              {flt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Inventory Table */}
      <div className="bg-white border border-[#EAEAEA] overflow-x-auto shadow-2xs">
        <table className="w-full text-left text-xs text-[#111111]">
          <thead className="bg-[#F8F8F8] text-[#737373] uppercase tracking-wider text-[10px] border-b border-[#EAEAEA]">
            <tr>
              <th className="py-3.5 px-4 font-semibold">Perfume & Brand</th>
              <th className="py-3.5 px-4 font-semibold">Original Bottle</th>
              <th className="py-3.5 px-4 font-semibold">Remaining ML</th>
              <th className="py-3.5 px-4 font-semibold w-52">Fill Level (%)</th>
              <th className="py-3.5 px-4 font-semibold">Stock Status</th>
              <th className="py-3.5 px-4 font-semibold">Low Threshold</th>
              <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EAEAEA] font-sans">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-[#737373]">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin text-[#111111]" />
                    <span>Loading perfume inventory...</span>
                  </div>
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-[#737373]">
                  <p className="text-sm font-medium">No perfume bottles match your search/filter.</p>
                  <p className="text-xs text-zinc-400 mt-1">Try clearing filters or add a new perfume to track.</p>
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const percentage = item.stock_percentage;
                // Bar color logic
                let barColor = 'bg-emerald-500';
                if (item.stock_status === 'out_of_stock') barColor = 'bg-red-500';
                else if (item.stock_status === 'low_stock') barColor = 'bg-amber-500';

                return (
                  <tr key={item.id} className="hover:bg-[#FBFBFB] transition-colors">
                    {/* Perfume & Brand */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#F8F8F8] border border-[#EAEAEA] p-1 shrink-0 flex items-center justify-center rounded">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="max-h-full max-w-full object-contain" />
                          ) : (
                            <FlaskConical className="w-5 h-5 text-zinc-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-serif text-sm text-[#111111] font-semibold">{item.name}</p>
                          <div className="flex items-center gap-2 text-[10px] text-[#737373]">
                            <span className="uppercase tracking-wider font-semibold">{item.brand}</span>
                            {item.product_id && (
                              <>
                                <span>·</span>
                                <span className="font-mono text-zinc-400">Linked Catalog</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Original Bottle Size */}
                    <td className="py-3.5 px-4 font-mono font-medium text-[#111111]">
                      {item.bottle_size_ml} <span className="text-[#737373] text-[10px]">ML</span>
                    </td>

                    {/* Remaining ML */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-sm font-bold text-[#111111]">
                        {item.remaining_ml} <span className="text-[10px] font-normal text-[#737373]">ML</span>
                      </span>
                    </td>

                    {/* Progress Bar & Percentage */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-mono">
                          <span className="font-bold text-[#111111]">{percentage}%</span>
                          <span className="text-[#737373]">{item.remaining_ml}/{item.bottle_size_ml} ml</span>
                        </div>
                        <div className="w-full bg-[#EAEAEA] h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${barColor}`}
                            style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Stock Status */}
                    <td className="py-3.5 px-4">
                      {renderStatusBadge(item.stock_status)}
                    </td>

                    {/* Low Stock Threshold */}
                    <td className="py-3.5 px-4 font-mono text-zinc-500 text-[11px]">
                      &le; {item.low_stock_threshold_ml} ML
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenAdjust(item, 'adjust')}
                          className="px-2 py-1 text-[10px] uppercase font-semibold bg-[#F4F4F4] hover:bg-[#111111] hover:text-white transition-colors cursor-pointer"
                          title="Adjust ML manually"
                        >
                          Adjust
                        </button>
                        <button
                          onClick={() => handleOpenAdjust(item, 'restock')}
                          className="px-2 py-1 text-[10px] uppercase font-semibold bg-emerald-50 text-emerald-800 hover:bg-emerald-600 hover:text-white border border-emerald-200 transition-colors cursor-pointer"
                          title="Restock bottle"
                        >
                          Restock
                        </button>
                        <button
                          onClick={() => handleOpenHistory(item)}
                          className="p-1.5 text-[#737373] hover:text-[#111111] bg-[#F4F4F4] hover:bg-[#EAEAEA] transition-colors cursor-pointer"
                          title="View ML Stock History"
                        >
                          <History className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-[#737373] hover:text-[#111111] bg-[#F4F4F4] hover:bg-[#EAEAEA] transition-colors cursor-pointer"
                          title="Edit Information"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item)}
                          className="p-1.5 text-[#737373] hover:text-red-500 bg-[#F4F4F4] hover:bg-red-50 transition-colors cursor-pointer"
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

      {/* Recent Ledger Activity */}
      {recentTransactions.length > 0 && (
        <div className="bg-white border border-[#EAEAEA] p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#EAEAEA] pb-3">
            <div>
              <h3 className="font-serif text-base text-[#111111] font-normal">Recent Inventory Transactions & Ledger</h3>
              <p className="text-[11px] text-[#737373]">Live audit trail of automatic sales deductions, restocks & adjustments</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#111111]">
              <thead className="bg-[#F8F8F8] text-[#737373] uppercase tracking-wider text-[10px] border-b border-[#EAEAEA]">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Perfume</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Delta ML</th>
                  <th className="py-2.5 px-3">Before &rarr; After</th>
                  <th className="py-2.5 px-3">Order / Notes</th>
                  <th className="py-2.5 px-3">User</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAEAEA] font-sans">
                {recentTransactions.map((tx) => {
                  const typeInfo = formatTxType(tx.transaction_type);
                  const isNegative = tx.change_ml < 0;

                  return (
                    <tr key={tx.id} className="hover:bg-[#FBFBFB]">
                      <td className="py-2.5 px-3 font-mono text-[10px] text-[#737373] whitespace-nowrap">
                        {tx.created_at}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-[#111111]">
                        {tx.perfume_brand} - {tx.perfume_name}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 text-[10px] font-mono rounded ${typeInfo.color}`}>
                          {typeInfo.label}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold">
                        <span className={isNegative ? 'text-rose-600' : 'text-emerald-600'}>
                          {isNegative ? '' : '+'}{tx.change_ml} ML
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-[#737373]">
                        {tx.previous_ml} ml &rarr; <span className="font-semibold text-[#111111]">{tx.new_ml} ml</span>
                      </td>
                      <td className="py-2.5 px-3 text-[11px] text-[#737373] max-w-xs truncate">
                        {tx.order_number ? (
                          <span className="font-mono font-semibold text-[#111111] mr-1.5">
                            #{tx.order_number}
                          </span>
                        ) : null}
                        {tx.notes || '—'}
                      </td>
                      <td className="py-2.5 px-3 text-[10px] font-mono text-zinc-500">
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

      {/* Add / Edit Perfume Modal */}
      {isAddEditOpen && editingItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-white border border-[#EAEAEA] shadow-2xl p-6 sm:p-8 space-y-6 text-[#111111] my-8 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-[#EAEAEA] pb-4">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-[#737373] uppercase">
                  {editingItem.id ? 'Edit Inventory Record' : 'New Master Bottle'}
                </span>
                <h3 className="font-serif text-xl font-normal text-[#111111]">
                  {editingItem.id ? `Edit ${editingItem.name}` : 'Add Perfume to Inventory'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddEditOpen(false)}
                className="p-1 text-[#737373] hover:text-[#111111] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveInventory} className="space-y-4">
              {/* Linked Product Selection */}
              <div>
                <label className="block text-[10px] tracking-widest text-[#737373] uppercase mb-1">
                  Link with E-Commerce Product (Optional)
                </label>
                <select
                  value={editingItem.product_id || ''}
                  onChange={(e) => {
                    const selId = e.target.value;
                    const found = catalogOptions.find(c => c.id === selId);
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
                  className="w-full bg-[#F8F8F8] border border-[#EAEAEA] px-3 py-2 text-xs text-[#111111] focus:border-[#111111]"
                >
                  <option value="">-- Standalone Perfume (Not Linked) --</option>
                  {catalogOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.brand} - {opt.name} ({opt.id})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-[#737373] mt-1">
                  Linking automatically ties decant orders placed for this catalogue product directly to this inventory.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] tracking-widest text-[#737373] uppercase mb-1">
                    Brand Name *
                  </label>
                  <input
                    type="text"
                    value={editingItem.brand || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, brand: e.target.value })}
                    required
                    placeholder="e.g. Dior, ARRINA"
                    className="w-full bg-[#F8F8F8] border border-[#EAEAEA] px-3 py-2 text-xs text-[#111111] focus:border-[#111111]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] tracking-widest text-[#737373] uppercase mb-1">
                    Perfume Name *
                  </label>
                  <input
                    type="text"
                    value={editingItem.name || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                    required
                    placeholder="e.g. Sauvage, Pure Portions"
                    className="w-full bg-[#F8F8F8] border border-[#EAEAEA] px-3 py-2 text-xs text-[#111111] focus:border-[#111111]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] tracking-widest text-[#737373] uppercase mb-1">
                    Original Bottle (ML) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    value={editingItem.bottle_size_ml || 100}
                    onChange={(e) => setEditingItem({ ...editingItem, bottle_size_ml: parseFloat(e.target.value) || 0 })}
                    required
                    className="w-full bg-[#F8F8F8] border border-[#EAEAEA] px-3 py-2 text-xs font-mono text-[#111111] focus:border-[#111111]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] tracking-widest text-[#737373] uppercase mb-1">
                    Current Remaining (ML) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={editingItem.remaining_ml === 0 || editingItem.remaining_ml ? editingItem.remaining_ml : ''}
                    onChange={(e) => setEditingItem({ ...editingItem, remaining_ml: parseFloat(e.target.value) || 0 })}
                    required
                    className="w-full bg-[#F8F8F8] border border-[#EAEAEA] px-3 py-2 text-xs font-mono text-[#111111] focus:border-[#111111]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] tracking-widest text-[#737373] uppercase mb-1">
                    Low Stock Threshold (ML)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    value={editingItem.low_stock_threshold_ml || 15}
                    onChange={(e) => setEditingItem({ ...editingItem, low_stock_threshold_ml: parseFloat(e.target.value) || 0 })}
                    required
                    className="w-full bg-[#F8F8F8] border border-[#EAEAEA] px-3 py-2 text-xs font-mono text-[#111111] focus:border-[#111111]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] tracking-widest text-[#737373] uppercase mb-1">
                  Batch Notes & Location
                </label>
                <textarea
                  value={editingItem.notes || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, notes: e.target.value })}
                  rows={2}
                  placeholder="e.g. Master bottle Batch #2026A, Atelier Cabinet 2"
                  className="w-full bg-[#F8F8F8] border border-[#EAEAEA] px-3 py-2 text-xs text-[#111111] focus:border-[#111111]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EAEAEA]">
                <button
                  type="button"
                  onClick={() => setIsAddEditOpen(false)}
                  className="px-4 py-2 bg-[#F4F4F4] hover:bg-[#EAEAEA] text-xs font-medium text-[#111111] uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-[#111111] text-white hover:bg-amber-400 hover:text-black text-xs font-semibold uppercase tracking-wider cursor-pointer"
                >
                  {submitting ? 'Saving...' : editingItem.id ? 'Save Changes' : 'Create Inventory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust / Restock Modal */}
      {isAdjustOpen && adjustingItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white border border-[#EAEAEA] shadow-2xl p-6 sm:p-8 space-y-6 text-[#111111] my-8 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-[#EAEAEA] pb-4">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-[#737373] uppercase">
                  {adjustMode === 'restock' ? 'Restock Master Bottle' : 'Manual Stock Adjustment'}
                </span>
                <h3 className="font-serif text-xl font-normal text-[#111111]">
                  {adjustingItem.brand} - {adjustingItem.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAdjustOpen(false)}
                className="p-1 text-[#737373] hover:text-[#111111] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Stock Banner */}
            <div className="bg-[#F8F8F8] p-3 border border-[#EAEAEA] flex items-center justify-between">
              <span className="text-xs text-[#737373]">Current Remaining Volume:</span>
              <span className="font-mono text-sm font-bold text-[#111111]">
                {adjustingItem.remaining_ml} / {adjustingItem.bottle_size_ml} ML ({adjustingItem.stock_percentage}%)
              </span>
            </div>

            <form onSubmit={handleSaveAdjust} className="space-y-4">
              {adjustMode === 'restock' ? (
                <div>
                  <label className="block text-[10px] tracking-widest text-[#737373] uppercase mb-1">
                    Add ML to Stock (+) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={adjustChangeMl}
                    onChange={(e) => setAdjustChangeMl(e.target.value)}
                    required
                    placeholder="e.g. 100"
                    className="w-full bg-[#F8F8F8] border border-[#EAEAEA] px-3 py-2 text-sm font-mono text-[#111111] focus:border-[#111111]"
                  />
                  <p className="text-[10px] text-[#737373] mt-1">
                    New resulting volume will be: <strong className="text-[#111111]">{round(adjustingItem.remaining_ml + (parseFloat(adjustChangeMl) || 0))} ML</strong>
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] tracking-widest text-[#737373] uppercase mb-1">
                      Set New Remaining ML Target *
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
                      className="w-full bg-[#F8F8F8] border border-[#EAEAEA] px-3 py-2 text-sm font-mono text-[#111111] focus:border-[#111111]"
                    />
                    <p className="text-[10px] text-[#737373] mt-1">
                      Net change:{' '}
                      <strong className="text-[#111111]">
                        {round((parseFloat(adjustTargetMl) || 0) - adjustingItem.remaining_ml) > 0 ? '+' : ''}
                        {round((parseFloat(adjustTargetMl) || 0) - adjustingItem.remaining_ml)} ML
                      </strong>
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[10px] tracking-widest text-[#737373] uppercase mb-1">
                  Reason for Adjustment / Audit Note *
                </label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  required
                  placeholder="e.g. Physical inventory check, spillage, bottle replaced"
                  className="w-full bg-[#F8F8F8] border border-[#EAEAEA] px-3 py-2 text-xs text-[#111111] focus:border-[#111111]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EAEAEA]">
                <button
                  type="button"
                  onClick={() => setIsAdjustOpen(false)}
                  className="px-4 py-2 bg-[#F4F4F4] hover:bg-[#EAEAEA] text-xs font-medium text-[#111111] uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-[#111111] text-white hover:bg-amber-400 hover:text-black text-xs font-semibold uppercase tracking-wider cursor-pointer"
                >
                  {submitting ? 'Updating...' : adjustMode === 'restock' ? 'Confirm Restock' : 'Apply Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock History & Transactions Modal */}
      {isHistoryOpen && historyItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-3xl bg-white border border-[#EAEAEA] shadow-2xl p-6 sm:p-8 space-y-6 text-[#111111] my-8 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-[#EAEAEA] pb-4">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-[#737373] uppercase">
                  Complete Stock History & Ledger
                </span>
                <h3 className="font-serif text-2xl font-normal text-[#111111]">
                  {historyItem.brand} - {historyItem.name}
                </h3>
                <p className="text-xs text-[#737373] mt-0.5">
                  Bottle Size: {historyItem.bottle_size_ml}ml · Current Remaining: <strong className="text-[#111111]">{historyItem.remaining_ml}ml ({historyItem.stock_percentage}%)</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsHistoryOpen(false)}
                className="p-1 text-[#737373] hover:text-[#111111] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {loadingHistory ? (
                <div className="py-12 text-center text-[#737373]">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#111111] mb-2" />
                  <span>Loading transaction ledger...</span>
                </div>
              ) : historyTransactions.length === 0 ? (
                <p className="py-8 text-center text-[#737373]">No transactions recorded for this perfume yet.</p>
              ) : (
                <table className="w-full text-left text-xs text-[#111111]">
                  <thead className="bg-[#F8F8F8] text-[#737373] uppercase tracking-wider text-[10px] border-b border-[#EAEAEA] sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Change ML</th>
                      <th className="py-2.5 px-3">Prev &rarr; New</th>
                      <th className="py-2.5 px-3">Associated Order / Details</th>
                      <th className="py-2.5 px-3">Logged By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAEAEA] font-sans">
                    {historyTransactions.map((tx) => {
                      const typeInfo = formatTxType(tx.transaction_type);
                      const isNegative = tx.change_ml < 0;

                      return (
                        <tr key={tx.id} className="hover:bg-[#FBFBFB]">
                          <td className="py-2.5 px-3 font-mono text-[10px] text-[#737373] whitespace-nowrap">
                            {tx.created_at}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 text-[10px] font-mono rounded ${typeInfo.color}`}>
                              {typeInfo.label}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold">
                            <span className={isNegative ? 'text-rose-600' : 'text-emerald-600'}>
                              {isNegative ? '' : '+'}{tx.change_ml} ML
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-[#737373] whitespace-nowrap">
                            {tx.previous_ml} ml &rarr; <strong className="text-[#111111]">{tx.new_ml} ml</strong>
                          </td>
                          <td className="py-2.5 px-3 text-[11px] text-[#737373]">
                            {tx.order_number && (
                              <span className="font-mono font-bold text-[#111111] mr-1.5 bg-zinc-100 px-1 py-0.5">
                                #{tx.order_number}
                              </span>
                            )}
                            {tx.notes || '—'}
                          </td>
                          <td className="py-2.5 px-3 text-[10px] font-mono text-zinc-500">
                            {tx.created_by}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            <div className="flex items-center justify-end pt-4 border-t border-[#EAEAEA]">
              <button
                type="button"
                onClick={() => setIsHistoryOpen(false)}
                className="px-5 py-2 bg-[#111111] text-white hover:bg-zinc-800 text-xs font-semibold uppercase tracking-wider cursor-pointer"
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

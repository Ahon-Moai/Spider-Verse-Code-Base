import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  X,
  Tag,
  Layers,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { getErrorMessage } from '../services/api';
import { ImageUploader } from './ImageUploader';

interface ProductVariant {
  id?: string;
  size: string;
  price: number;
  stock_qty: number;
  image?: string;
}

interface Product {
  id: string;
  brand: string;
  name: string;
  category: string;
  gender: 'Him' | 'Her' | 'Unisex';
  concentration: string;
  starting_price: number;
  image: string;
  additional_images?: string[];
  images?: string[];
  notes?: string[];
  top_notes?: string[];
  heart_notes?: string[];
  base_notes?: string[];
  attributes?: any[];
  scent_profile?: Record<string, any>;
  scentProfile?: Record<string, any>;
  status: 'draft' | 'published' | 'archived';
  inventory_qty: number;
  is_featured: boolean;
  is_new_arrival: boolean;
  short_description?: string;
  description?: string;
  variants?: ProductVariant[];
}

interface CategoryOption {
  id: string;
  title: string;
  slug: string;
  rule_type?: string;
  rule_value?: string;
}

interface ProductManagerProps {
  csrfToken: string;
}

const toSlug = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const PAGE_SIZE = 12;

export const ProductManager: React.FC<ProductManagerProps> = ({ csrfToken }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Inline Quick Create Category state
  const [showQuickCategory, setShowQuickCategory] = useState(false);
  const [quickCatName, setQuickCatName] = useState('');
  const [quickCatSlug, setQuickCatSlug] = useState('');
  const [quickCatSlugEdited, setQuickCatSlugEdited] = useState(false);
  const [creatingCat, setCreatingCat] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const [prodRes, colRes] = await Promise.all([
        fetch('/api/admin/products.php'),
        fetch('/api/admin/collections.php')
      ]);
      const data = await prodRes.json();
      const colData = await colRes.json();
      if (data.success && Array.isArray(data.data)) {
        setProducts(data.data);
      }
      if (colData.success && Array.isArray(colData.data)) {
        setCategories(colData.data);
      }
    } catch (e) {
      console.error('Failed to fetch products', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const getCategoryValue = (cat: CategoryOption) =>
    cat.rule_type === 'category' && cat.rule_value ? cat.rule_value : cat.title;

  const handleQuickCreateCategory = async () => {
    const cleanTitle = quickCatName.trim();
    if (!cleanTitle) return;
    const cleanSlug = toSlug(quickCatSlug || cleanTitle);
    const newId = 'cat-' + Math.random().toString(36).substring(2, 8);

    setCreatingCat(true);
    try {
      const res = await fetch('/api/admin/collections.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({
          id: newId,
          title: cleanTitle,
          slug: cleanSlug,
          description: '',
          image: '',
          rule_type: 'category',
          rule_value: cleanTitle,
          display_order: categories.length + 1,
          is_enabled: true
        })
      });
      const data = await res.json();
      if (data.success) {
        const created: CategoryOption = {
          id: data.data?.id || newId,
          title: cleanTitle,
          slug: cleanSlug,
          rule_type: 'category',
          rule_value: cleanTitle
        };
        setCategories((prev) => [...prev, created]);
        setEditingProduct((prev) => (prev ? { ...prev, category: cleanTitle } : prev));
        setQuickCatName('');
        setQuickCatSlug('');
        setQuickCatSlugEdited(false);
        setShowQuickCategory(false);
      } else {
        alert(getErrorMessage(data?.error || data, 'Failed to create category'));
      }
    } catch (err) {
      alert('Error creating category');
    } finally {
      setCreatingCat(false);
    }
  };

  const handleOpenCreate = () => {
    const firstCat = categories[0];
    setEditingProduct({
      id: 'prod-' + Math.random().toString(36).substring(2, 8),
      brand: '',
      name: '',
      category: firstCat ? getCategoryValue(firstCat) : '',
      gender: 'Unisex',
      concentration: '',
      starting_price: 0,
      image: '',
      additional_images: [],
      short_description: '',
      description: '',
      status: 'published',
      inventory_qty: 25,
      is_featured: true,
      is_new_arrival: true,
      variants: []
    });
    setShowQuickCategory(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    const sp = p.scent_profile || p.scentProfile || {};
    setEditingProduct({
      ...p,
      description: p.description || sp.scentDescription || '',
      additional_images: Array.isArray(p.additional_images)
        ? p.additional_images
        : Array.isArray(p.images)
        ? p.images
        : [],
      variants: Array.isArray(p.variants) ? p.variants : []
    });
    setShowQuickCategory(false);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.name) return;

    setSaving(true);
    const isNew = !products.some((p) => p.id === editingProduct.id);
    const method = isNew ? 'POST' : 'PUT';
    const url = isNew
      ? '/api/admin/products.php'
      : `/api/admin/products.php?id=${editingProduct.id}`;

    const existingProfile =
      editingProduct.scent_profile || editingProduct.scentProfile || {};
    const cleanProfile = isNew
      ? {
          scentDescription:
            editingProduct.description || editingProduct.short_description || ''
        }
      : {
          ...existingProfile,
          scentDescription:
            editingProduct.description ||
            editingProduct.short_description ||
            existingProfile.scentDescription ||
            ''
        };

    const payload = {
      ...editingProduct,
      brand: editingProduct.brand || '',
      category: editingProduct.category || 'General',
      gender: editingProduct.gender || 'Unisex',
      concentration: editingProduct.concentration || '',
      image: editingProduct.image || '',
      short_description: editingProduct.short_description || '',
      description: editingProduct.description || '',
      notes: isNew ? [] : editingProduct.notes || [],
      top_notes: isNew ? [] : editingProduct.top_notes || [],
      heart_notes: isNew ? [] : editingProduct.heart_notes || [],
      base_notes: isNew ? [] : editingProduct.base_notes || [],
      attributes: isNew ? [] : editingProduct.attributes || [],
      scent_profile: cleanProfile,
      scentProfile: cleanProfile
    };

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        setEditingProduct(null);
        fetchProducts();
      } else {
        alert(getErrorMessage(data?.error || data, 'Failed to save product'));
      }
    } catch (err) {
      alert('Error saving product');
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async (id: string) => {
    if (!confirm('Are you sure you want to archive this product?')) return;

    try {
      const res = await fetch(`/api/admin/products.php?id=${id}`, {
        method: 'DELETE',
        headers: { 'X-CSRF-Token': csrfToken }
      });
      const data = await res.json();
      if (data.success) {
        fetchProducts();
      }
    } catch (err) {
      alert('Error archiving product');
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const inputCls =
    'w-full h-9 rounded-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/5 transition-colors';

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-200/80 dark:border-zinc-800/80">
        <div>
          <h1 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100 tracking-tight">
            Product Catalog
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Manage products, pricing, stock quantities, gallery images, and variants
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-md bg-zinc-950 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-950 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by brand, name, or category..."
            className="w-full h-9 rounded-md bg-white dark:bg-[#111113] border border-zinc-200/80 dark:border-zinc-800 pl-9 pr-4 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-400 transition-colors"
          />
        </div>
        <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono tabular-nums">
          {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
        </span>
      </div>

      {/* Product Table */}
      <div className="bg-white dark:bg-[#111113] border border-zinc-200/80 dark:border-zinc-800/80 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-900 dark:text-zinc-100">
            <thead className="bg-zinc-50/80 dark:bg-zinc-900/60 text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-[11px] font-medium border-b border-zinc-200/80 dark:border-zinc-800/80">
              <tr>
                <th className="py-3 px-4 font-medium">Product</th>
                <th className="py-3 px-4 font-medium">Brand</th>
                <th className="py-3 px-4 font-medium">Category</th>
                <th className="py-3 px-4 font-medium text-right">Price</th>
                <th className="py-3 px-4 font-medium">Stock</th>
                <th className="py-3 px-4 font-medium">Status</th>
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
              ) : paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      No products found
                    </p>
                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">
                      {search ? 'Try clearing your search query.' : 'Add your first product to get started.'}
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-zinc-50/70 dark:hover:bg-zinc-900/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-1 shrink-0 flex items-center justify-center overflow-hidden">
                          {p.image ? (
                            <img
                              src={p.image}
                              alt={p.name}
                              className="max-h-full max-w-full object-contain"
                            />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-zinc-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-zinc-950 dark:text-zinc-100 truncate">
                            {p.name}
                          </p>
                          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono truncate">
                            {p.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-zinc-700 dark:text-zinc-300 font-medium whitespace-nowrap">
                      {p.brand}
                    </td>
                    <td className="py-3 px-4 text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                      {p.category}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-zinc-950 dark:text-zinc-100 tabular-nums whitespace-nowrap">
                      ৳ {p.starting_price}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 text-[11px] font-mono rounded-md border tabular-nums ${
                          p.inventory_qty < 10
                            ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/60'
                            : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800'
                        }`}
                      >
                        {p.inventory_qty} in stock
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium capitalize rounded-md border ${
                          p.status === 'published'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/60'
                            : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                          title="Edit Product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleArchive(p.id)}
                          className="p-1.5 rounded-md text-zinc-500 hover:text-rose-600 hover:bg-rose-50 dark:text-zinc-400 dark:hover:text-rose-400 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          title="Archive Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {filteredProducts.length > PAGE_SIZE && (
          <div className="px-4 py-3 border-t border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span className="tabular-nums">
              Showing {(currentPage - 1) * PAGE_SIZE + 1}–
              {Math.min(currentPage * PAGE_SIZE, filteredProducts.length)} of{' '}
              {filteredProducts.length}
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

      {/* Edit / Create Product Modal */}
      {isModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div className="relative w-full max-w-3xl bg-white dark:bg-[#111113] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl flex flex-col max-h-[92vh] text-zinc-900 dark:text-zinc-100 my-auto overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800 px-6 py-4 shrink-0">
              <div>
                <h3 className="text-sm font-semibold text-zinc-950 dark:text-zinc-100">
                  {products.some((p) => p.id === editingProduct.id)
                    ? 'Edit Product'
                    : 'Add New Product'}
                </h3>
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono mt-0.5">
                  ID: {editingProduct.id}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100 dark:hover:text-white dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleSave} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                {/* Basic Product Info */}
                <div className="space-y-4">
                  <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Product Details</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        value={editingProduct.name || ''}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, name: e.target.value })
                        }
                        required
                        className={inputCls}
                        placeholder="e.g. Ferrari SF-24 1:18 Model"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        Brand / Maker *
                      </label>
                      <input
                        type="text"
                        value={editingProduct.brand || ''}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, brand: e.target.value })
                        }
                        required
                        className={inputCls}
                        placeholder="e.g. Bburago, Minichamps, Spark"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                          Category *
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowQuickCategory((v) => !v)}
                          className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white underline-offset-2 hover:underline cursor-pointer"
                        >
                          {showQuickCategory ? 'Close' : '+ New Category'}
                        </button>
                      </div>

                      <select
                        value={editingProduct.category || ''}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, category: e.target.value })
                        }
                        required
                        className={inputCls}
                      >
                        <option value="" disabled>
                          -- Select Category --
                        </option>
                        {categories.map((cat) => {
                          const val = getCategoryValue(cat);
                          return (
                            <option key={cat.id} value={val}>
                              {cat.title} (/{cat.slug})
                            </option>
                          );
                        })}
                        {editingProduct.category &&
                          !categories.some(
                            (c) =>
                              getCategoryValue(c).toLowerCase() ===
                              editingProduct.category!.toLowerCase()
                          ) && (
                            <option value={editingProduct.category}>
                              {editingProduct.category}
                            </option>
                          )}
                      </select>

                      {showQuickCategory && (
                        <div className="mt-2 p-3 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2.5">
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={quickCatName}
                              onChange={(e) => {
                                const nameVal = e.target.value;
                                setQuickCatName(nameVal);
                                if (!quickCatSlugEdited) {
                                  setQuickCatSlug(toSlug(nameVal));
                                }
                              }}
                              placeholder="Category name"
                              className="h-8 rounded-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-900"
                            />
                            <input
                              type="text"
                              value={quickCatSlug}
                              onChange={(e) => {
                                setQuickCatSlugEdited(true);
                                setQuickCatSlug(toSlug(e.target.value));
                              }}
                              placeholder="slug (auto)"
                              className="h-8 rounded-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-2.5 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-900"
                            />
                          </div>
                          <button
                            type="button"
                            disabled={creatingCat || !quickCatName.trim()}
                            onClick={handleQuickCreateCategory}
                            className="w-full h-8 rounded-md bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white disabled:opacity-50 text-white dark:text-zinc-950 text-xs font-medium cursor-pointer transition-colors"
                          >
                            {creatingCat ? 'Creating...' : 'Create & Select Category'}
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        Edition / Spec Label
                      </label>
                      <input
                        type="text"
                        value={editingProduct.concentration || ''}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            concentration: e.target.value
                          })
                        }
                        className={inputCls}
                        placeholder="e.g. Zinc Alloy Diecast, Limited Edition"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        Price (৳ BDT) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={editingProduct.starting_price ?? 0}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            starting_price: Number(e.target.value)
                          })
                        }
                        required
                        className={`${inputCls} font-mono tabular-nums`}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        Stock Quantity *
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={editingProduct.inventory_qty ?? 0}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            inventory_qty: Number(e.target.value)
                          })
                        }
                        required
                        className={`${inputCls} font-mono tabular-nums`}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        Collection Division
                      </label>
                      <select
                        value={editingProduct.gender || 'Unisex'}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            gender: e.target.value as 'Him' | 'Her' | 'Unisex'
                          })
                        }
                        className={inputCls}
                      >
                        <option value="Unisex">All / Standard</option>
                        <option value="Him">1:18 Pro Diecast</option>
                        <option value="Her">1:43 Display Grid</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        Publish Status
                      </label>
                      <select
                        value={editingProduct.status || 'published'}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            status: e.target.value as 'draft' | 'published' | 'archived'
                          })
                        }
                        className={inputCls}
                      >
                        <option value="published">Published (Live)</option>
                        <option value="draft">Draft (Hidden)</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                  </div>

                  {/* Storefront Flags */}
                  <div className="flex flex-wrap items-center gap-6 pt-1">
                    <label className="inline-flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(editingProduct.is_featured)}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            is_featured: e.target.checked
                          })
                        }
                        className="w-4 h-4 rounded accent-zinc-900 dark:accent-zinc-100"
                      />
                      <span>Featured Product</span>
                    </label>

                    <label className="inline-flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(editingProduct.is_new_arrival)}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            is_new_arrival: e.target.checked
                          })
                        }
                        className="w-4 h-4 rounded accent-zinc-900 dark:accent-zinc-100"
                      />
                      <span>Show in New Arrivals</span>
                    </label>
                  </div>
                </div>

                {/* Product Images */}
                <div className="pt-5 border-t border-zinc-200/80 dark:border-zinc-800 space-y-4">
                  <ImageUploader
                    label="Primary Product Image *"
                    value={editingProduct.image || ''}
                    onChange={(url) => setEditingProduct({ ...editingProduct, image: url })}
                    csrfToken={csrfToken}
                  />

                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        Additional Gallery Images
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const gallery = editingProduct.additional_images || [];
                          setEditingProduct({
                            ...editingProduct,
                            additional_images: [...gallery, '']
                          });
                        }}
                        className="h-7 px-2.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-[11px] font-medium text-zinc-700 dark:text-zinc-200 cursor-pointer transition-colors"
                      >
                        + Add Image
                      </button>
                    </div>

                    <div className="space-y-2">
                      {(editingProduct.additional_images || []).map((imgUrl, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg border border-zinc-200/80 dark:border-zinc-800"
                        >
                          <div className="flex-1 min-w-0">
                            <ImageUploader
                              label={`Gallery Image #${idx + 1}`}
                              value={imgUrl}
                              onChange={(url) => {
                                const gallery = [...(editingProduct.additional_images || [])];
                                gallery[idx] = url;
                                setEditingProduct({
                                  ...editingProduct,
                                  additional_images: gallery
                                });
                              }}
                              csrfToken={csrfToken}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const gallery = (editingProduct.additional_images || []).filter(
                                (_, i) => i !== idx
                              );
                              setEditingProduct({
                                ...editingProduct,
                                additional_images: gallery
                              });
                            }}
                            className="p-1.5 rounded-md text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:text-rose-400 dark:hover:bg-rose-950/40 cursor-pointer mt-5 transition-colors"
                            title="Remove Image"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Descriptions */}
                <div className="pt-5 border-t border-zinc-200/80 dark:border-zinc-800 space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      Short Summary
                    </label>
                    <textarea
                      value={editingProduct.short_description || ''}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          short_description: e.target.value
                        })
                      }
                      rows={2}
                      className="w-full rounded-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-400"
                      placeholder="Brief highlight shown on product cards..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      Full Product Description
                    </label>
                    <textarea
                      value={editingProduct.description || ''}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          description: e.target.value
                        })
                      }
                      rows={3}
                      className="w-full rounded-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-400"
                      placeholder="Detailed specifications, materials, dimensions, and box contents..."
                    />
                  </div>
                </div>

                {/* Product Variants & Pricing */}
                <div className="pt-5 border-t border-zinc-200/80 dark:border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Options / Variants &amp; Pricing</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        const curr = editingProduct.variants || [];
                        setEditingProduct({
                          ...editingProduct,
                          variants: [
                            ...curr,
                            {
                              size: '',
                              price: editingProduct.starting_price || 0,
                              stock_qty: editingProduct.inventory_qty || 0
                            }
                          ]
                        });
                      }}
                      className="h-7 px-2.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-[11px] font-medium text-zinc-700 dark:text-zinc-200 cursor-pointer transition-colors"
                    >
                      + Add Variant
                    </button>
                  </div>

                  {(editingProduct.variants || []).length === 0 ? (
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/40 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg p-3.5">
                      Optional: Add size, scale, or edition variants (e.g. 1:43 Scale, 1:18 Scale, Gift Box) with separate pricing and stock.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {(editingProduct.variants || []).map((v, idx) => (
                        <div
                          key={idx}
                          className="bg-zinc-50 dark:bg-zinc-900/50 p-3.5 rounded-lg border border-zinc-200/80 dark:border-zinc-800 space-y-3"
                        >
                          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                            <input
                              type="text"
                              value={v.size || ''}
                              placeholder="Option / Scale (e.g. 1:43 Scale, 1:18 Pro)"
                              onChange={(e) => {
                                const vars = [...(editingProduct.variants || [])];
                                vars[idx].size = e.target.value;
                                setEditingProduct({ ...editingProduct, variants: vars });
                              }}
                              className="flex-1 min-w-[160px] h-9 rounded-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-900"
                            />
                            <input
                              type="number"
                              value={v.price === 0 || v.price ? v.price : ''}
                              placeholder="Price (৳)"
                              onChange={(e) => {
                                const vars = [...(editingProduct.variants || [])];
                                vars[idx].price =
                                  e.target.value === '' ? ('' as any) : Number(e.target.value);
                                setEditingProduct({ ...editingProduct, variants: vars });
                              }}
                              className="w-28 h-9 rounded-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3 text-xs text-zinc-900 dark:text-zinc-100 font-mono tabular-nums focus:outline-none focus:border-zinc-900"
                            />
                            <input
                              type="number"
                              value={v.stock_qty === 0 || v.stock_qty ? v.stock_qty : ''}
                              placeholder="Stock Qty"
                              onChange={(e) => {
                                const vars = [...(editingProduct.variants || [])];
                                vars[idx].stock_qty =
                                  e.target.value === '' ? ('' as any) : Number(e.target.value);
                                setEditingProduct({ ...editingProduct, variants: vars });
                              }}
                              className="w-24 h-9 rounded-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3 text-xs text-zinc-900 dark:text-zinc-100 font-mono tabular-nums focus:outline-none focus:border-zinc-900"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const vars = (editingProduct.variants || []).filter(
                                  (_, i) => i !== idx
                                );
                                setEditingProduct({ ...editingProduct, variants: vars });
                              }}
                              className="p-1.5 rounded-md text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:text-rose-400 dark:hover:bg-rose-950/40 cursor-pointer transition-colors"
                              title="Remove Variant"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <ImageUploader
                            label={`Variant Image (${v.size || 'Option ' + (idx + 1)})`}
                            value={v.image || ''}
                            onChange={(url) => {
                              const vars = [...(editingProduct.variants || [])];
                              vars[idx].image = url;
                              setEditingProduct({ ...editingProduct, variants: vars });
                            }}
                            csrfToken={csrfToken}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 flex items-center justify-end gap-2.5 border-t border-zinc-200/80 dark:border-zinc-800 shrink-0 bg-zinc-50/60 dark:bg-zinc-900/40">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-9 px-4 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="h-9 px-5 rounded-md bg-zinc-950 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-950 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

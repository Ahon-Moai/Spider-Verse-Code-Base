import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  X,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { getErrorMessage } from '../services/api';
import { ImageUploader } from './ImageUploader';
import { Collection } from '../types';

interface CollectionManagerProps {
  csrfToken: string;
}

const toSlug = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const PAGE_SIZE = 12;

export const CollectionManager: React.FC<CollectionManagerProps> = ({ csrfToken }) => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [editingCol, setEditingCol] = useState<Partial<Collection> | null>(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const colRes = await fetch('/api/admin/collections.php');
      const colData = await colRes.json();
      if (colData.success && Array.isArray(colData.data)) {
        setCollections(colData.data);
      }
    } catch (e) {
      console.error('Failed to fetch categories', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const handleOpenCreate = () => {
    setEditingCol({
      id: 'cat-' + Math.random().toString(36).substring(2, 8),
      title: '',
      slug: '',
      description: '',
      image: '',
      rule_type: 'category',
      rule_value: '',
      display_order: collections.length + 1,
      is_enabled: true,
      mapped_product_ids: []
    });
    setSlugManuallyEdited(false);
    setShowAdvanced(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (col: Collection) => {
    setEditingCol({
      ...col,
      mapped_product_ids: Array.isArray(col.mapped_product_ids) ? col.mapped_product_ids : []
    });
    setSlugManuallyEdited(true);
    setShowAdvanced(col.rule_type !== 'category');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCol || !editingCol.title?.trim()) return;

    setSaving(true);
    const isNew = !collections.some((c) => c.id === editingCol.id);
    const method = isNew ? 'POST' : 'PUT';
    const url = isNew
      ? '/api/admin/collections.php'
      : `/api/admin/collections.php?id=${editingCol.id}`;

    const cleanTitle = editingCol.title.trim();
    const cleanSlug = toSlug(editingCol.slug || cleanTitle);
    const ruleType = editingCol.rule_type || 'category';
    const ruleValue =
      ruleType === 'category'
        ? editingCol.rule_value?.trim() || cleanTitle
        : editingCol.rule_value || '';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({
          ...editingCol,
          title: cleanTitle,
          slug: cleanSlug,
          rule_type: ruleType,
          rule_value: ruleValue
        })
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        setEditingCol(null);
        fetchData();
      } else {
        alert(getErrorMessage(data?.error || data, 'Failed to save category'));
      }
    } catch (err) {
      alert('Error saving category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      const res = await fetch(`/api/admin/collections.php?id=${id}`, {
        method: 'DELETE',
        headers: { 'X-CSRF-Token': csrfToken }
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      }
    } catch (err) {
      alert('Error deleting category');
    }
  };

  const filteredCollections = collections.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
  );

  const totalPages = Math.max(1, Math.ceil(filteredCollections.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedCollections = filteredCollections.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const inputCls =
    'w-full h-9 rounded-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/5 transition-colors';

  return (
    <div className="space-y-6 font-sans">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-200/80 dark:border-zinc-800/80">
        <div>
          <h1 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100 tracking-tight">
            Categories &amp; Collections
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Create store categories and URL slugs—available immediately when uploading products
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-md bg-zinc-950 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-950 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Category</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories by name or slug..."
            className="w-full h-9 rounded-md bg-white dark:bg-[#111113] border border-zinc-200/80 dark:border-zinc-800 pl-9 pr-4 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-400 transition-colors"
          />
        </div>
        <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono tabular-nums">
          {filteredCollections.length} {filteredCollections.length === 1 ? 'category' : 'categories'}
        </span>
      </div>

      {/* Category Table */}
      <div className="bg-white dark:bg-[#111113] border border-zinc-200/80 dark:border-zinc-800/80 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-900 dark:text-zinc-100">
            <thead className="bg-zinc-50/80 dark:bg-zinc-900/60 text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-[11px] font-medium border-b border-zinc-200/80 dark:border-zinc-800/80">
              <tr>
                <th className="py-3 px-4 font-medium">Category Name</th>
                <th className="py-3 px-4 font-medium">Slug / URL</th>
                <th className="py-3 px-4 font-medium">Order</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="py-4 px-4">
                      <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-full" />
                    </td>
                  </tr>
                ))
              ) : paginatedCollections.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      No categories found
                    </p>
                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">
                      Click &quot;New Category&quot; to create one.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedCollections.map((col) => (
                  <tr
                    key={col.id}
                    className="hover:bg-zinc-50/70 dark:hover:bg-zinc-900/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3 min-w-0">
                        {col.image && (
                          <div className="w-9 h-9 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-md overflow-hidden shrink-0 flex items-center justify-center">
                            <img
                              src={col.image}
                              alt={col.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-zinc-950 dark:text-zinc-100 truncate">
                            {col.title}
                          </p>
                          {col.description && (
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1">
                              {col.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-zinc-600 dark:text-zinc-300 whitespace-nowrap">
                      /collections/{col.slug}
                    </td>
                    <td className="py-3 px-4 font-mono text-zinc-500 dark:text-zinc-400 tabular-nums">
                      {col.display_order}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border ${
                          col.is_enabled
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/60'
                            : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800'
                        }`}
                      >
                        {col.is_enabled ? (
                          <Eye className="w-3 h-3" />
                        ) : (
                          <EyeOff className="w-3 h-3" />
                        )}
                        {col.is_enabled ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(col)}
                          className="p-1.5 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800 rounded-md transition-colors cursor-pointer"
                          title="Edit Category"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(col.id)}
                          className="p-1.5 text-zinc-500 hover:text-rose-600 hover:bg-rose-50 dark:text-zinc-400 dark:hover:text-rose-400 dark:hover:bg-rose-950/40 rounded-md transition-colors cursor-pointer"
                          title="Delete Category"
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
        {filteredCollections.length > PAGE_SIZE && (
          <div className="px-4 py-3 border-t border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span className="tabular-nums">
              Showing {(currentPage - 1) * PAGE_SIZE + 1}–
              {Math.min(currentPage * PAGE_SIZE, filteredCollections.length)} of{' '}
              {filteredCollections.length}
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

      {/* Edit / Create Category Modal */}
      {isModalOpen && editingCol && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-white dark:bg-[#111113] border border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-xl flex flex-col text-zinc-900 dark:text-zinc-100 my-auto overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800 px-6 py-4">
              <h3 className="text-sm font-semibold text-zinc-950 dark:text-zinc-100">
                {collections.some((c) => c.id === editingCol.id)
                  ? 'Edit Category'
                  : 'Create Category'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100 dark:hover:text-white dark:hover:bg-zinc-800 rounded-md cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={editingCol.title || ''}
                    onChange={(e) => {
                      const nextTitle = e.target.value;
                      setEditingCol((prev) => {
                        if (!prev) return prev;
                        const nextSlug = slugManuallyEdited ? prev.slug : toSlug(nextTitle);
                        const nextRuleVal =
                          (prev.rule_type || 'category') === 'category'
                            ? nextTitle
                            : prev.rule_value;
                        return {
                          ...prev,
                          title: nextTitle,
                          slug: nextSlug,
                          rule_value: nextRuleVal
                        };
                      });
                    }}
                    required
                    className={inputCls}
                    placeholder="e.g. 1:18 Pro Diecast"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Slug *
                  </label>
                  <input
                    type="text"
                    value={editingCol.slug || ''}
                    onChange={(e) => {
                      setSlugManuallyEdited(true);
                      setEditingCol({ ...editingCol, slug: toSlug(e.target.value) });
                    }}
                    className={`${inputCls} font-mono`}
                    placeholder="e.g. 1-18-pro-diecast"
                  />
                  <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono">
                    /collections/{editingCol.slug || 'slug'}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Description (Optional)
                </label>
                <textarea
                  value={editingCol.description || ''}
                  onChange={(e) =>
                    setEditingCol({ ...editingCol, description: e.target.value })
                  }
                  rows={2}
                  className="w-full rounded-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-400"
                  placeholder="Short description shown on the category page..."
                />
              </div>

              <ImageUploader
                label="Category Banner Image (Optional)"
                value={editingCol.image || ''}
                onChange={(url) => setEditingCol({ ...editingCol, image: url })}
                csrfToken={csrfToken}
              />

              {/* Visibility & Order */}
              <div className="flex items-center justify-between gap-4 pt-1">
                <label className="inline-flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingCol.is_enabled ?? true}
                    onChange={(e) =>
                      setEditingCol({ ...editingCol, is_enabled: e.target.checked })
                    }
                    className="w-4 h-4 rounded accent-zinc-900 dark:accent-zinc-100"
                  />
                  <span>Active on storefront</span>
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    Order
                  </span>
                  <input
                    type="number"
                    value={editingCol.display_order || 0}
                    onChange={(e) =>
                      setEditingCol({
                        ...editingCol,
                        display_order: Number(e.target.value)
                      })
                    }
                    className="w-16 h-8 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md px-2 text-xs text-zinc-900 dark:text-zinc-100 font-mono tabular-nums focus:border-zinc-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* Optional Advanced Filter Rule */}
              <div className="pt-3 border-t border-zinc-200/80 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAdvanced((v) => !v)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white cursor-pointer"
                >
                  {showAdvanced ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                  <span>Advanced Collection Matching (Optional)</span>
                </button>

                {showAdvanced && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 bg-zinc-50 dark:bg-zinc-900/50 p-3.5 border border-zinc-200/80 dark:border-zinc-800 rounded-lg">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        Rule Type
                      </label>
                      <select
                        value={editingCol.rule_type || 'category'}
                        onChange={(e) =>
                          setEditingCol({
                            ...editingCol,
                            rule_type: e.target.value as any
                          })
                        }
                        className={inputCls}
                      >
                        <option value="category">Match Product Category</option>
                        <option value="all">All Products</option>
                        <option value="featured">Featured Products</option>
                        <option value="new_arrival">New Arrivals</option>
                        <option value="brand">Match Brand</option>
                        <option value="gender">Match Division</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        Matching Value
                      </label>
                      <input
                        type="text"
                        value={editingCol.rule_value || ''}
                        onChange={(e) =>
                          setEditingCol({ ...editingCol, rule_value: e.target.value })
                        }
                        className={inputCls}
                        placeholder="Leave as Category Name"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-zinc-200/80 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-9 px-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 rounded-md text-xs font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="h-9 px-5 bg-zinc-950 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-950 rounded-md text-xs font-medium cursor-pointer transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

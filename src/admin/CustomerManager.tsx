import React, { useState, useEffect } from 'react';
import {
  Search,
  Phone,
  Mail,
  MapPin,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface CustomerOrder {
  id: number;
  order_number: string;
  total_amount: number;
  order_status: string;
  created_at: string;
}

interface Customer {
  id: number;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  city_zone: string;
  order_count: number;
  total_spent: number;
  created_at: string;
  orders?: CustomerOrder[];
}

interface CustomerManagerProps {
  csrfToken: string;
}

const PAGE_SIZE = 15;

export const CustomerManager: React.FC<CustomerManagerProps> = ({ csrfToken }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      let url = '/api/admin/customers.php';
      if (search) url += '?search=' + encodeURIComponent(search);

      const res = await fetch(url, {
        headers: { 'X-CSRF-Token': csrfToken }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setCustomers(data.data);
      }
    } catch (e) {
      console.error('Failed to fetch customers', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchCustomers();
  }, [search]);

  const handleSelectCustomer = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/customers.php?id=${id}`, {
        headers: { 'X-CSRF-Token': csrfToken }
      });
      const data = await res.json();
      if (data.success && data.data) {
        setSelectedCustomer(data.data);
      }
    } catch (e) {
      console.error('Error fetching customer details', e);
    }
  };

  const totalPages = Math.max(1, Math.ceil(customers.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedCustomers = customers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="pb-5 border-b border-zinc-200/80 dark:border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100 tracking-tight">
            Customer Directory
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            View customer contact records, purchase history, and total lifetime spend
          </p>
        </div>
        <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400 tabular-nums">
          {customers.length} {customers.length === 1 ? 'customer' : 'customers'}
        </span>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customers by name, phone number or email..."
          className="w-full h-9 rounded-md bg-white dark:bg-[#111113] border border-zinc-200/80 dark:border-zinc-800 pl-9 pr-4 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-400 transition-colors"
        />
      </div>

      {/* Customer Table */}
      <div className="bg-white dark:bg-[#111113] border border-zinc-200/80 dark:border-zinc-800/80 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-900 dark:text-zinc-100">
            <thead className="bg-zinc-50/80 dark:bg-zinc-900/60 text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-[11px] font-medium border-b border-zinc-200/80 dark:border-zinc-800/80">
              <tr>
                <th className="py-3 px-4 font-medium">Customer</th>
                <th className="py-3 px-4 font-medium">Phone Number</th>
                <th className="py-3 px-4 font-medium">Delivery Zone</th>
                <th className="py-3 px-4 font-medium text-right">Orders Placed</th>
                <th className="py-3 px-4 font-medium text-right">Total Spent</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="py-4 px-4">
                      <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-full" />
                    </td>
                  </tr>
                ))
              ) : paginatedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      No customers found
                    </p>
                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">
                      Customer records appear automatically when orders are placed.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-zinc-50/70 dark:hover:bg-zinc-900/50 transition-colors"
                  >
                    <td className="py-3 px-4 font-medium text-zinc-950 dark:text-zinc-100">
                      {c.name}
                    </td>
                    <td className="py-3 px-4 font-mono text-zinc-600 dark:text-zinc-300 tabular-nums">
                      {c.phone}
                    </td>
                    <td className="py-3 px-4 capitalize text-zinc-500 dark:text-zinc-400">
                      {(c.city_zone || 'inside_dhaka').replace('_', ' ')}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-medium text-zinc-900 dark:text-zinc-100 tabular-nums">
                      {c.order_count || 0}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-zinc-950 dark:text-zinc-100 tabular-nums">
                      ৳ {c.total_spent || 0}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleSelectCustomer(c.id)}
                        className="h-7 px-2.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-[11px] font-medium transition-colors cursor-pointer"
                      >
                        History
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {customers.length > PAGE_SIZE && (
          <div className="px-4 py-3 border-t border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span className="tabular-nums">
              Showing {(currentPage - 1) * PAGE_SIZE + 1}–
              {Math.min(currentPage * PAGE_SIZE, customers.length)} of {customers.length}
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

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-xl bg-white dark:bg-[#111113] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden text-zinc-900 dark:text-zinc-100 my-8">
            <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800 px-6 py-4">
              <div>
                <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
                  Customer Profile
                </span>
                <h3 className="text-base font-semibold text-zinc-950 dark:text-zinc-100">
                  {selectedCustomer.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100 dark:hover:text-white dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="space-y-2 text-xs bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200/80 dark:border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <Phone className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span className="font-mono text-zinc-900 dark:text-zinc-100 tabular-nums">
                    {selectedCustomer.phone}
                  </span>
                </div>
                {selectedCustomer.email && (
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span className="text-zinc-700 dark:text-zinc-300">
                      {selectedCustomer.email}
                    </span>
                  </div>
                )}
                {selectedCustomer.address && (
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                    <span className="text-zinc-700 dark:text-zinc-300">
                      {selectedCustomer.address}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2.5">
                  Order History
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {(selectedCustomer.orders || []).length === 0 ? (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 py-6 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
                      No previous orders on record.
                    </p>
                  ) : (
                    (selectedCustomer.orders || []).map((o) => (
                      <div
                        key={o.id}
                        className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800 rounded-lg text-xs"
                      >
                        <div>
                          <p className="font-mono font-semibold text-zinc-950 dark:text-zinc-100">
                            {o.order_number}
                          </p>
                          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono">
                            {o.created_at}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-semibold text-zinc-950 dark:text-zinc-100 tabular-nums">
                            ৳ {o.total_amount}
                          </p>
                          <span className="text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                            {o.order_status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40 flex justify-end">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="h-9 px-4 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs font-medium cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

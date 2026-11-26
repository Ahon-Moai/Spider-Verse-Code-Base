import React, { useState, useEffect } from 'react';
import {
  Printer,
  Eye,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface OrderItem {
  id: number;
  product_name: string;
  brand_name: string;
  selected_size: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  shipping_address: string;
  city_zone: string;
  subtotal: number;
  discount: number;
  delivery_fee: number;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  order_status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  tracking_number?: string;
  internal_notes?: string;
  created_at: string;
  items?: OrderItem[];
}

interface OrderManagerProps {
  csrfToken: string;
}

const PAGE_SIZE = 15;

export const OrderManager: React.FC<OrderManagerProps> = ({ csrfToken }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [printableOrder, setPrintableOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let url = '/api/admin/orders.php';
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (search) params.append('search', search);
      if (params.toString()) url += '?' + params.toString();

      const res = await fetch(url, {
        headers: { 'X-CSRF-Token': csrfToken }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setOrders(data.data);
      }
    } catch (e) {
      console.error('Failed to fetch orders', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchOrders();
  }, [statusFilter]);

  const handleSelectOrder = async (orderId: number) => {
    try {
      const res = await fetch(`/api/admin/orders.php?id=${orderId}`, {
        headers: { 'X-CSRF-Token': csrfToken }
      });
      const data = await res.json();
      if (data.success && data.data) {
        setSelectedOrder(data.data);
      }
    } catch (e) {
      console.error('Error loading order details', e);
    }
  };

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders.php?id=${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({ order_status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        fetchOrders();
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, order_status: newStatus as any });
        }
      }
    } catch (e) {
      alert('Error updating order status');
    } finally {
      setUpdating(false);
    }
  };

  const statusBadges: Record<string, string> = {
    pending:
      'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900/60',
    confirmed:
      'bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-900/60',
    processing:
      'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-900/60',
    shipped:
      'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900/60',
    delivered:
      'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60',
    cancelled:
      'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-900/60'
  };

  const totalPages = Math.max(1, Math.ceil(orders.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedOrders = orders.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="pb-5 border-b border-zinc-200/80 dark:border-zinc-800/80 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100 tracking-tight">
            Customer Orders &amp; Fulfillment
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Process orders, manage delivery status, inspect items, and generate invoices
          </p>
        </div>

        <div className="inline-flex flex-wrap items-center gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg border border-zinc-200/80 dark:border-zinc-800 self-start">
          {['', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 text-xs rounded-md capitalize transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white font-semibold shadow-2xs'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 font-medium'
              }`}
            >
              {st === '' ? 'All' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-[#111113] border border-zinc-200/80 dark:border-zinc-800/80 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-900 dark:text-zinc-100">
            <thead className="bg-zinc-50/80 dark:bg-zinc-900/60 text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-[11px] font-medium border-b border-zinc-200/80 dark:border-zinc-800/80">
              <tr>
                <th className="py-3 px-4 font-medium">Order #</th>
                <th className="py-3 px-4 font-medium">Customer</th>
                <th className="py-3 px-4 font-medium">Phone</th>
                <th className="py-3 px-4 font-medium">Zone</th>
                <th className="py-3 px-4 font-medium text-right">Total</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium">Date</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={8} className="py-4 px-4">
                      <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-full" />
                    </td>
                  </tr>
                ))
              ) : paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      No orders found
                    </p>
                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">
                      No orders match the selected filter.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((o) => (
                  <tr
                    key={o.id}
                    className="hover:bg-zinc-50/70 dark:hover:bg-zinc-900/50 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-semibold text-zinc-950 dark:text-zinc-100 whitespace-nowrap">
                      {o.order_number}
                    </td>
                    <td className="py-3 px-4 text-zinc-900 dark:text-zinc-100 font-medium whitespace-nowrap">
                      {o.customer_name}
                    </td>
                    <td className="py-3 px-4 text-zinc-500 dark:text-zinc-400 font-mono tabular-nums whitespace-nowrap">
                      {o.customer_phone}
                    </td>
                    <td className="py-3 px-4 capitalize text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                      {o.city_zone.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-zinc-950 dark:text-zinc-100 tabular-nums whitespace-nowrap">
                      ৳ {o.total_amount}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 text-[11px] capitalize font-medium border rounded-md ${
                          statusBadges[o.order_status] ||
                          'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800'
                        }`}
                      >
                        {o.order_status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-zinc-400 dark:text-zinc-500 text-[11px] font-mono tabular-nums whitespace-nowrap">
                      {o.created_at}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handleSelectOrder(o.id)}
                          className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={async () => {
                            await handleSelectOrder(o.id);
                            setPrintableOrder(o);
                          }}
                          className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                          title="Print Invoice"
                        >
                          <Printer className="w-3.5 h-3.5" />
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
        {orders.length > PAGE_SIZE && (
          <div className="px-4 py-3 border-t border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span className="tabular-nums">
              Showing {(currentPage - 1) * PAGE_SIZE + 1}–
              {Math.min(currentPage * PAGE_SIZE, orders.length)} of {orders.length}
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

      {/* Order Details Modal */}
      {selectedOrder && !printableOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-white dark:bg-[#111113] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden text-zinc-900 dark:text-zinc-100 my-8">
            <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800 px-6 py-4">
              <div>
                <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
                  Order Details
                </span>
                <h3 className="text-base font-mono font-semibold text-zinc-950 dark:text-zinc-100">
                  {selectedOrder.order_number}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100 dark:hover:text-white dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200/80 dark:border-zinc-800">
                <div className="space-y-1">
                  <p className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
                    Customer Info
                  </p>
                  <p className="font-semibold text-zinc-950 dark:text-zinc-100">
                    {selectedOrder.customer_name}
                  </p>
                  <p className="text-zinc-600 dark:text-zinc-300 font-mono tabular-nums">
                    {selectedOrder.customer_phone}
                  </p>
                  {selectedOrder.customer_email && (
                    <p className="text-zinc-500 dark:text-zinc-400">
                      {selectedOrder.customer_email}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
                    Shipping Address
                  </p>
                  <p className="text-zinc-900 dark:text-zinc-100">
                    {selectedOrder.shipping_address}
                  </p>
                  <p className="text-zinc-500 dark:text-zinc-400 capitalize text-[11px]">
                    Zone: {selectedOrder.city_zone.replace('_', ' ')}
                  </p>
                </div>
              </div>

              {/* Change Status Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200/80 dark:border-zinc-800">
                <span className="text-xs text-zinc-600 dark:text-zinc-300 font-medium">
                  Update Fulfillment Status
                </span>
                <select
                  value={selectedOrder.order_status}
                  onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value)}
                  disabled={updating}
                  className="h-9 rounded-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs px-3 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-400 uppercase font-mono cursor-pointer"
                >
                  <option value="pending">PENDING</option>
                  <option value="confirmed">CONFIRMED</option>
                  <option value="processing">PROCESSING</option>
                  <option value="shipped">SHIPPED</option>
                  <option value="delivered">DELIVERED</option>
                  <option value="cancelled">CANCELLED (RESTORE STOCK)</option>
                </select>
              </div>

              {/* Items List */}
              <div>
                <h4 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2.5">
                  Items Ordered
                </h4>
                <div className="space-y-2">
                  {(selectedOrder.items || []).map((it) => (
                    <div
                      key={it.id}
                      className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800 rounded-lg text-xs"
                    >
                      <div>
                        <p className="font-medium text-zinc-950 dark:text-zinc-100">
                          {it.brand_name} — {it.product_name}
                        </p>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono tabular-nums mt-0.5">
                          {it.selected_size} × {it.quantity}
                        </p>
                      </div>
                      <p className="font-mono text-zinc-950 dark:text-zinc-100 font-semibold tabular-nums">
                        ৳ {it.line_total}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Summary */}
              <div className="pt-4 border-t border-zinc-200/80 dark:border-zinc-800 space-y-1.5 text-xs">
                <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                  <span>Subtotal</span>
                  <span className="font-mono tabular-nums">৳ {selectedOrder.subtotal}</span>
                </div>
                <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                  <span>Delivery Fee</span>
                  <span className="font-mono tabular-nums">৳ {selectedOrder.delivery_fee}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span>Discount</span>
                    <span className="font-mono tabular-nums">-৳ {selectedOrder.discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-semibold text-zinc-950 dark:text-zinc-100 pt-2.5 border-t border-zinc-200/80 dark:border-zinc-800">
                  <span>Total Payable</span>
                  <span className="font-mono text-base tabular-nums">
                    ৳ {selectedOrder.total_amount}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40">
              <button
                onClick={() => setPrintableOrder(selectedOrder)}
                className="h-9 px-4 rounded-md bg-zinc-950 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-950 text-xs font-medium inline-flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Invoice</span>
              </button>
              <button
                onClick={() => setSelectedOrder(null)}
                className="h-9 px-4 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs font-medium cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Invoice Modal (Always crisp white paper for printing) */}
      {printableOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-zinc-950 border border-zinc-200 rounded-xl p-8 max-w-xl w-full shadow-2xl font-sans space-y-6">
            <div className="flex items-start justify-between border-b pb-4 border-zinc-200">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-zinc-950">SPIDER VERSE</h1>
                <p className="text-[11px] text-zinc-500 mt-0.5">Official Storefront Tax &amp; Dispatch Invoice</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono font-semibold uppercase bg-zinc-100 text-zinc-800 px-2 py-1 rounded">
                  INVOICE
                </span>
                <p className="font-mono text-sm font-bold mt-1.5 text-zinc-950">
                  {printableOrder.order_number}
                </p>
                <p className="text-[11px] text-zinc-500 font-mono">{printableOrder.created_at}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-[10px] text-zinc-500 uppercase font-semibold tracking-wider">
                  Bill &amp; Deliver To
                </p>
                <p className="font-semibold text-zinc-950 mt-1">{printableOrder.customer_name}</p>
                <p className="font-mono text-zinc-700 tabular-nums">{printableOrder.customer_phone}</p>
                <p className="text-zinc-600 mt-0.5">{printableOrder.shipping_address}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-zinc-500 uppercase font-semibold tracking-wider">
                  Payment Info
                </p>
                <p className="font-semibold uppercase text-zinc-950 mt-1">
                  {printableOrder.payment_method} (Cash on Delivery)
                </p>
                <p className="text-emerald-700 font-medium capitalize mt-0.5">
                  Status: {printableOrder.order_status}
                </p>
              </div>
            </div>

            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 text-[10px] uppercase text-zinc-500">
                  <th className="py-2 font-medium">Item</th>
                  <th className="py-2 text-center font-medium">Option</th>
                  <th className="py-2 text-center font-medium">Qty</th>
                  <th className="py-2 text-right font-medium">Unit Price</th>
                  <th className="py-2 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {(printableOrder.items || []).map((it, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5 font-medium text-zinc-900">
                      {it.brand_name} — {it.product_name}
                    </td>
                    <td className="py-2.5 text-center text-zinc-600">{it.selected_size}</td>
                    <td className="py-2.5 text-center font-mono tabular-nums">{it.quantity}</td>
                    <td className="py-2.5 text-right font-mono tabular-nums">৳ {it.unit_price}</td>
                    <td className="py-2.5 text-right font-mono font-semibold tabular-nums">
                      ৳ {it.line_total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-t border-zinc-200 pt-3 text-xs space-y-1.5">
              <div className="flex justify-between text-zinc-600">
                <span>Subtotal</span>
                <span className="font-mono tabular-nums">৳ {printableOrder.subtotal}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Delivery Fee</span>
                <span className="font-mono tabular-nums">৳ {printableOrder.delivery_fee}</span>
              </div>
              {printableOrder.discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount</span>
                  <span className="font-mono tabular-nums">-৳ {printableOrder.discount}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm text-zinc-950 pt-2 border-t border-zinc-300">
                <span>Amount Payable</span>
                <span className="font-mono tabular-nums">৳ {printableOrder.total_amount}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-zinc-200 text-xs print:hidden">
              <button
                onClick={() => window.print()}
                className="h-9 px-4 rounded-md bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-medium cursor-pointer transition-colors"
              >
                Print Official Copy
              </button>
              <button
                onClick={() => setPrintableOrder(null)}
                className="h-9 px-4 rounded-md border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-medium cursor-pointer transition-colors"
              >
                Close Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

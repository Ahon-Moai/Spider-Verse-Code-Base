import React, { useState } from 'react';
import { trackOrder, OrderDetail, OrderItem } from '../api';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Search, Package, AlertTriangle } from 'lucide-react';

export const TrackOrderPage: React.FC = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<{ order: OrderDetail; items: OrderItem[] } | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;

    try {
      setLoading(true);
      setError(null);
      setOrderData(null);
      const data = await trackOrder(orderNumber.trim());
      setOrderData(data);
    } catch (err: any) {
      setError(err?.message || 'Order tracking telemetry not found.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      <SectionHeading
        tag="LIVE SATELLITE TELEMETRY"
        title="TRACK ORDER SHIPMENT"
        subtitle="Enter your tracking order number (e.g. ORD-2026-XXXX) to inspect package progress from paddock to doorstep."
      />

      {/* Query Form */}
      <div className="bg-[#131720] border-2 border-[#242c3d] p-6 sm:p-8 clip-corner-tr">
        <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              required
              placeholder="Enter Order Number (e.g. ORD-2026-ABC123)"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="w-full bg-[#0b0d10] border border-[#2d3748] px-4 py-3 text-white placeholder-[#8e9bb0] font-mono-telemetry text-sm focus:outline-none focus:border-[#e10600] uppercase"
            />
          </div>
          <Button type="submit" variant="primary" size="md" disabled={loading}>
            <Search className="w-4 h-4" />
            <span>{loading ? 'LOCATING...' : 'TRACK TELEMETRY'}</span>
          </Button>
        </form>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-[#241315] border border-[#e10600] p-6 clip-corner-tr flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-[#e10600] shrink-0 mt-0.5" />
          <div>
            <h4 className="text-white font-condensed font-black uppercase text-lg">
              ORDER NOT FOUND ON RADAR
            </h4>
            <p className="text-sm text-[#8e9bb0] mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Result Display */}
      {orderData && (
        <div className="bg-[#131720] border border-[#242c3d] p-6 sm:p-8 clip-corner-tr space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#1f2635] gap-4">
            <div>
              <span className="text-xs font-mono-telemetry uppercase text-[#8e9bb0]">
                TELEMETRY ID:
              </span>
              <h3 className="text-2xl font-black font-mono-telemetry text-white">
                {orderData.order.order_number}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={orderData.order.order_status === 'delivered' ? 'green' : 'yellow'}>
                STATUS: {orderData.order.order_status.toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* Details Table */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm font-mono-telemetry">
            <div>
              <div className="text-xs text-[#8e9bb0] uppercase">PILOT / CUSTOMER:</div>
              <div className="text-white font-bold">{orderData.order.customer_name}</div>
              <div className="text-[#8e9bb0] text-xs mt-1">{orderData.order.customer_phone}</div>
            </div>
            <div>
              <div className="text-xs text-[#8e9bb0] uppercase">DESTINATION CIRCUIT:</div>
              <div className="text-white font-bold">{orderData.order.shipping_address}</div>
            </div>
            <div>
              <div className="text-xs text-[#8e9bb0] uppercase">PAYMENT METHOD:</div>
              <div className="text-white font-bold uppercase">{orderData.order.payment_method}</div>
            </div>
            <div>
              <div className="text-xs text-[#8e9bb0] uppercase">TOTAL AMOUNT:</div>
              <div className="text-xl font-black text-[#e10600]">
                ৳{Number(orderData.order.total_amount).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Items In Package */}
          <div className="border-t border-[#1f2635] pt-6 space-y-3">
            <h4 className="text-xs font-mono-telemetry uppercase text-[#8e9bb0]">
              CIRCUIT PACKAGE CONTENTS:
            </h4>
            <div className="space-y-2">
              {orderData.items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-[#0b0d10] p-3 border border-[#1f2635] text-xs font-mono-telemetry"
                >
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-[#e10600]" />
                    <span className="text-white font-bold">{item.product_name}</span>
                    <span className="text-[#8e9bb0]">({item.selected_size})</span>
                  </div>
                  <div className="text-white">
                    QTY: {item.quantity} × ৳{Number(item.unit_price).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackOrderPage;

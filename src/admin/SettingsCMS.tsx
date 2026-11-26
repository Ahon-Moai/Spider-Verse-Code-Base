import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { getErrorMessage } from '../services/api';

interface SettingsCMSProps {
  csrfToken: string;
}

export const SettingsCMS: React.FC<SettingsCMSProps> = ({ csrfToken }) => {
  const [settings, setSettings] = useState({
    store_name: '',
    tagline: '',
    contact_phone: '',
    contact_email: '',
    address: '',
    currency: 'BDT',
    currency_symbol: '৳',
    shipping_fee_dhaka: '',
    shipping_fee_outside_dhaka: '',
    free_shipping_threshold: '',
    announcement_bar: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings.php', {
        headers: { 'X-CSRF-Token': csrfToken }
      });
      const data = await res.json();
      if (data.success && data.data) {
        setSettings((prev) => ({ ...prev, ...data.data }));
      }
    } catch (e) {
      console.error('Failed to load settings', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (data.success) {
        alert('Global Store Settings saved successfully!');
      } else {
        alert(getErrorMessage(data?.error || data, 'Failed to save settings'));
      }
    } catch (e) {
      alert('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    'w-full h-9 rounded-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-400 transition-colors';

  return (
    <form onSubmit={handleSave} className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="pb-5 border-b border-zinc-200/80 dark:border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100 tracking-tight">
            Global Store Settings
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Configure store branding, contact information, delivery fees, and announcement bar
          </p>
        </div>
        <button
          type="submit"
          disabled={saving || loading}
          className="h-9 px-4 rounded-md bg-zinc-950 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-950 text-xs font-medium inline-flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50 whitespace-nowrap shrink-0 self-start sm:self-auto"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      {/* Branding & Contact Info Card */}
      <div className="bg-white dark:bg-[#111113] border border-zinc-200/80 dark:border-zinc-800/80 rounded-lg p-6 space-y-5">
        <div className="border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
          <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-100">
            Branding &amp; Contact Information
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Displayed on invoices, footer details, and customer communications
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Store Name
            </label>
            <input
              type="text"
              value={settings.store_name}
              onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
              className={inputCls}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Sub-Branding / Tagline
            </label>
            <input
              type="text"
              value={settings.tagline}
              onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
              className={inputCls}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Contact Phone
            </label>
            <input
              type="text"
              value={settings.contact_phone}
              onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
              className={`${inputCls} font-mono`}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Contact Email
            </label>
            <input
              type="text"
              value={settings.contact_email}
              onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
              className={inputCls}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
            Physical Address / Store Location
          </label>
          <input
            type="text"
            value={settings.address}
            onChange={(e) => setSettings({ ...settings, address: e.target.value })}
            className={inputCls}
          />
        </div>
      </div>

      {/* Delivery & Checkout Rules Card */}
      <div className="bg-white dark:bg-[#111113] border border-zinc-200/80 dark:border-zinc-800/80 rounded-lg p-6 space-y-5">
        <div className="border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
          <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-100">
            Delivery &amp; Checkout Rules
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Configure regional delivery rates, free shipping thresholds, and announcement banner copy
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Inside Dhaka (৳)
            </label>
            <input
              type="number"
              value={settings.shipping_fee_dhaka}
              onChange={(e) => setSettings({ ...settings, shipping_fee_dhaka: e.target.value })}
              className={`${inputCls} font-mono tabular-nums`}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Outside Dhaka (৳)
            </label>
            <input
              type="number"
              value={settings.shipping_fee_outside_dhaka}
              onChange={(e) =>
                setSettings({ ...settings, shipping_fee_outside_dhaka: e.target.value })
              }
              className={`${inputCls} font-mono tabular-nums`}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Free Shipping Minimum (৳)
            </label>
            <input
              type="number"
              value={settings.free_shipping_threshold}
              onChange={(e) =>
                setSettings({ ...settings, free_shipping_threshold: e.target.value })
              }
              className={`${inputCls} font-mono tabular-nums`}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
            Top Announcement Ribbon Copy
          </label>
          <input
            type="text"
            value={settings.announcement_bar}
            onChange={(e) => setSettings({ ...settings, announcement_bar: e.target.value })}
            className={inputCls}
          />
        </div>
      </div>
    </form>
  );
};

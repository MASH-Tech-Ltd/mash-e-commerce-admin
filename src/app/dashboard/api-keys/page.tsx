'use client';

import { useState, useEffect } from 'react';
import { Key, Save, Mail, CreditCard, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { api } from '@/utils/api';
import toast from 'react-hot-toast';

export default function ApiKeysPage() {
  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Key Visibility States
  const [showSendgrid, setShowSendgrid] = useState(false);
  const [showStripePublishable, setShowStripePublishable] = useState(false);
  const [showStripeSecret, setShowStripeSecret] = useState(false);

  // Form States
  const [sendgridKey, setSendgridKey] = useState('');
  const [stripePublishableKey, setStripePublishableKey] = useState('');
  const [stripeSecretKey, setStripeSecretKey] = useState('');

  useEffect(() => {
    fetchStoreInfo();
  }, []);

  const fetchStoreInfo = async () => {
    try {
      const res = await api.get('/tenants/my-store');
      if (res.data?.data) {
        setStore(res.data.data);
        const settings = res.data.data.settings || {};
        setSendgridKey(settings.sendgridApiKey || '');
        setStripePublishableKey(settings.stripePublishableKey || '');
        setStripeSecretKey(settings.stripeSecretKey || '');
      }
    } catch (error) {
      console.error('Failed to fetch store data', error);
      toast.error('Failed to load API key information');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('settings.sendgridApiKey', sendgridKey);
      formData.append('settings.stripePublishableKey', stripePublishableKey);
      formData.append('settings.stripeSecretKey', stripeSecretKey);
      
      await api.patch('/tenants/update-store', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('API Keys updated successfully');
      fetchStoreInfo();
    } catch (error: any) {
      console.error('Error updating keys', error);
      toast.error(error.response?.data?.message || 'Failed to update API Keys');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-purple-200 border-t-[#5022C3] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 w-full max-w-[1800px] mx-auto min-h-[calc(100vh-64px)]">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-2">
          <Key className="w-6 h-6 text-[#5022C3]" /> API Keys & Integrations
        </h1>
        <p className="text-gray-500">
          Manage your third-party integrations securely. These keys allow your store to send emails and process payments.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="space-y-6">
            
            {/* Email Provider */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Email Provider</h2>
                  <p className="text-xs text-gray-500">Configure SendGrid to send order confirmations and newsletters.</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">SendGrid API Key</label>
                  <div className="relative">
                    <input
                      type={showSendgrid ? "text" : "password"}
                      placeholder="SG.xxxxxxxxxxxxxxx"
                      value={sendgridKey}
                      onChange={(e) => setSendgridKey(e.target.value)}
                      className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5022C3] focus:border-transparent transition-all font-mono text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSendgrid(!showSendgrid)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#5022C3] transition-colors"
                    >
                      {showSendgrid ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Gateway */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Payment Gateway</h2>
                  <p className="text-xs text-gray-500">Configure Stripe to securely accept credit card payments.</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Stripe Publishable Key</label>
                  <div className="relative">
                    <input
                      type={showStripePublishable ? "text" : "password"}
                      placeholder="pk_live_xxxxxxxxxxxxxxx"
                      value={stripePublishableKey}
                      onChange={(e) => setStripePublishableKey(e.target.value)}
                      className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5022C3] focus:border-transparent transition-all font-mono text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowStripePublishable(!showStripePublishable)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#5022C3] transition-colors"
                    >
                      {showStripePublishable ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Stripe Secret Key</label>
                  <div className="relative">
                    <input
                      type={showStripeSecret ? "text" : "password"}
                      placeholder="sk_live_xxxxxxxxxxxxxxx"
                      value={stripeSecretKey}
                      onChange={(e) => setStripeSecretKey(e.target.value)}
                      className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5022C3] focus:border-transparent transition-all font-mono text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowStripeSecret(!showStripeSecret)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#5022C3] transition-colors"
                    >
                      {showStripeSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-red-500 mt-2 font-medium">Keep your Secret Key safe. Never share it publicly.</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-[#5022C3] hover:bg-[#401a9c] text-white px-8 py-3 rounded-xl font-bold shadow-md shadow-purple-500/20 transition-all flex items-center gap-2 disabled:opacity-70"
              >
                <Save className="w-5 h-5" />
                {saving ? 'Saving Changes...' : 'Save Configuration'}
              </button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gradient-to-br from-[#1E1B4B] to-[#312E81] rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" /> Secure Storage
              </h3>
              <p className="text-indigo-200 text-sm leading-relaxed">
                All API keys are encrypted at rest using AES-256 encryption. Our systems never expose your raw secret keys to anyone, including our own support team.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

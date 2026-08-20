'use client';

import { useState, useEffect } from 'react';
import { Truck, Settings, Play, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '@/utils/api';

export default function CourierAutomation() {
  const [activeProvider, setActiveProvider] = useState('pathao');
  const [clientId, setClientId] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [autoForward, setAutoForward] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const providers = [
    { id: 'pathao', name: 'Pathao', icon: 'https://pathao.com/bn/wp-content/uploads/sites/6/2019/02/Pathao-Courier-Logo.png' },
    { id: 'steadfast', name: 'Steadfast', icon: 'https://steadfast.com.bd/assets/images/logo.png' },
    { id: 'redx', name: 'REDX', icon: 'https://redx.com.bd/wp-content/uploads/2021/04/redx-logo.svg' }
  ];

  useEffect(() => {
    const fetchCredentials = async () => {
      try {
        // Here we could get existing credentials if we had an endpoint that returns them unencrypted for the merchant.
        // For security, usually you don't return the secret. But we can fetch the general settings.
        const res = await api.get('/courier/my-charges');
        if (res.data?.success && res.data.data) {
          const data = res.data.data;
          if (data.provider) setActiveProvider(data.provider);
          if (data.clientId) setClientId(data.clientId);
          if (data.autoForward !== undefined) setAutoForward(data.autoForward);
        }
      } catch (error) {
        console.error('Error fetching courier info:', error);
      }
    };
    fetchCredentials();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/courier/credentials', {
        provider: activeProvider,
        clientId,
        apiSecret, // Only send if it was changed
        autoForward,
      });
      toast.success('Configuration saved successfully!');
      setApiSecret(''); // Clear it from state for security after saving
    } catch (error) {
      toast.error('Failed to save configuration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 w-full max-w-[1800px] mx-auto min-h-[calc(100vh-64px)] space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-6 items-center sm:items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Truck className="w-6 h-6 text-[#5022C3]" /> Courier Automation
          </h2>
          <p className="text-gray-500 mt-1 text-sm">Configure automated order forwarding to your preferred delivery partners.</p>
        </div>
        <button className="bg-[#5022C3] hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
          <Play className="w-4 h-4" /> Start Automation
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-3">
          {providers.map(provider => (
            <button
              key={provider.id}
              onClick={() => setActiveProvider(provider.id)}
              className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all ${
                activeProvider === provider.id 
                  ? 'border-[#5022C3] bg-purple-50' 
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="w-10 h-10 bg-white rounded-lg border border-gray-100 flex items-center justify-center p-1 flex-shrink-0">
                {/* Fallback for broken images for now */}
                <div className="font-bold text-xs text-gray-500">{provider.name}</div>
              </div>
              <span className={`font-semibold ${activeProvider === provider.id ? 'text-[#5022C3]' : 'text-gray-700'}`}>
                {provider.name}
              </span>
              {activeProvider === provider.id && (
                <CheckCircle2 className="w-5 h-5 text-[#5022C3] ml-auto" />
              )}
            </button>
          ))}
        </div>

        <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
            <Settings className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-bold text-gray-900 capitalize">{activeProvider} Configuration</h3>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Store ID / Client ID</label>
              <input 
                type="text" 
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#5022C3] focus:outline-none" 
                placeholder="Enter ID" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">API Secret / Token (Leave blank to keep existing)</label>
              <input 
                type="password" 
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#5022C3] focus:outline-none" 
                placeholder="Enter Token" 
              />
            </div>
            
            <div className="pt-4 flex items-center justify-between">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={autoForward}
                  onChange={(e) => setAutoForward(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-[#5022C3] focus:ring-[#5022C3]" 
                />
                <span className="text-sm font-medium text-gray-700">Auto-forward orders on confirmation</span>
              </label>
              <button disabled={loading} type="submit" className="bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors">
                {loading ? 'Saving...' : 'Save Details'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

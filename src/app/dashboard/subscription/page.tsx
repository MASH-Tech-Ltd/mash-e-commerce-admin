'use client';

import { useState, useEffect } from 'react';
import { Check, Star, Zap, ShieldCheck, Clock, Crown } from 'lucide-react';
import { api } from '@/utils/api';
import toast from 'react-hot-toast';

interface Package {
  _id: string;
  name: string;
  price: number;
  billingCycle: string;
  productLimit: number;
  isActive: boolean;
}

interface Subscription {
  _id: string;
  packageId: Package;
  status: 'active' | 'pending' | 'expired' | 'cancelled';
  startDate: string;
  endDate: string;
}

export default function SubscriptionPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [confirmModal, setConfirmModal] = useState<Package | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [packagesRes, subRes] = await Promise.all([
        api.get('/packages/get-all-packages'),
        api.get('/subscriptions/my-subscription')
      ]);
      
      const activePackages = (packagesRes.data.data || []).filter((p: Package) => p.isActive);
      setPackages(activePackages);
      setSubscription(subRes.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!confirmModal) return;
    setSubmitting(true);
    try {
      await api.post('/subscriptions/request-package', { packageId: confirmModal._id });
      toast.success('Subscription requested! Pending admin approval.');
      setConfirmModal(null);
      fetchData(); // Refresh to show pending status
    } catch (error: any) {
      console.error('Error subscribing:', error);
      toast.error(error.response?.data?.message || 'Failed to request subscription');
    } finally {
      setSubmitting(false);
    }
  };

  const displayedPackages = packages.filter(p => p.billingCycle.toLowerCase() === billingCycle);
  const activePackageId = subscription?.packageId?._id;
  const isPending = subscription?.status === 'pending';

  return (
    <div className="p-6 w-full max-w-[1800px] mx-auto min-h-[calc(100vh-64px)] bg-[#f8f9fc]">
      <div className="text-center mb-12 relative z-10 pt-8">
        <div className="inline-flex items-center justify-center p-3 bg-purple-100 rounded-full mb-6">
          <Crown className="w-8 h-8 text-[#5022C3]" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 mb-6 tracking-tight">
          Choose the right plan for your business
        </h1>
        <p className="text-gray-500 max-w-2xl mx-auto text-lg">
          Scale your store with confidence. From startup to enterprise, we have a tier that perfectly matches your ambition.
        </p>

        {/* Billing Cycle Toggle */}
        <div className="flex items-center justify-center mt-10">
          <div className="bg-white p-1.5 rounded-2xl inline-flex relative shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-8 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${
                billingCycle === 'monthly' ? 'bg-[#5022C3] text-white shadow-lg shadow-purple-500/30 scale-105' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Monthly billing
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-8 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${
                billingCycle === 'yearly' ? 'bg-[#5022C3] text-white shadow-lg shadow-purple-500/30 scale-105' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Yearly billing
            </button>
            <span className="absolute -top-4 -right-8 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-[11px] font-black px-3 py-1 rounded-full shadow-lg shadow-green-500/30 animate-pulse border-2 border-white">
              SAVE 20%
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-[#5022C3] rounded-full animate-spin"></div>
        </div>
      ) : displayedPackages.length === 0 ? (
        <div className="p-12 text-center text-gray-500 bg-white rounded-3xl shadow-sm border border-gray-100">
          No {billingCycle} packages available at the moment.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 w-full mx-auto px-4">
          {displayedPackages.sort((a,b) => a.price - b.price).map((pkg, index) => {
            const isPopular = pkg.name.toLowerCase().includes('premium') || pkg.name.toLowerCase().includes('premimus'); 
            const isCurrentActive = activePackageId === pkg._id && subscription?.status === 'active';
            const isCurrentPending = activePackageId === pkg._id && subscription?.status === 'pending';
            
            return (
              <div 
                key={pkg._id} 
                className={`relative bg-white rounded-3xl border transition-all duration-500 flex flex-col overflow-hidden group ${
                  isPopular 
                    ? 'border-[#5022C3] shadow-[0_20px_50px_rgba(80,34,195,0.15)] xl:-mt-4 xl:mb-4 z-10' 
                    : 'border-gray-100 hover:border-gray-300 hover:shadow-xl shadow-sm'
                }`}
              >
                {/* Background Gradient for Popular */}
                {isPopular && (
                  <div className="absolute inset-0 bg-gradient-to-b from-[#5022C3]/5 to-transparent pointer-events-none" />
                )}

                {isPopular && (
                  <div className="bg-[#5022C3] text-white text-xs font-bold uppercase tracking-wider py-2 text-center flex items-center justify-center gap-1.5 shadow-sm">
                    <Star className="w-3.5 h-3.5 fill-current" /> Most Popular
                  </div>
                )}
                
                <div className="p-8 pb-6 relative">
                  <h3 className="text-2xl font-extrabold text-gray-900 mb-2">{pkg.name}</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-5xl font-black text-gray-900">৳{pkg.price}</span>
                    <span className="text-gray-500 font-bold">/{pkg.billingCycle === 'yearly' ? 'yr' : 'mo'}</span>
                  </div>
                  <p className="text-sm text-gray-500 font-medium leading-relaxed">
                    Perfect for growing businesses that need more power and customization.
                  </p>
                </div>
                
                <div className="px-8 pb-8 flex-1 flex flex-col relative bg-gradient-to-b from-transparent to-gray-50/50">
                  <ul className="space-y-4 mb-8 flex-1 mt-2">
                    <li className="flex items-start gap-3">
                      <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${isPopular ? 'bg-[#5022C3] text-white' : 'bg-purple-100 text-[#5022C3]'}`}>
                        <Check className="w-3.5 h-3.5" strokeWidth={3} />
                      </div>
                      <span className="text-sm text-gray-700 font-medium">
                        Up to <span className="font-bold text-gray-900">{pkg.productLimit}</span> Products
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${isPopular ? 'bg-[#5022C3] text-white' : 'bg-purple-100 text-[#5022C3]'}`}>
                        <Check className="w-3.5 h-3.5" strokeWidth={3} />
                      </div>
                      <span className="text-sm text-gray-700 font-medium">Custom Domain Setup</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${isPopular ? 'bg-[#5022C3] text-white' : 'bg-purple-100 text-[#5022C3]'}`}>
                        <Check className="w-3.5 h-3.5" strokeWidth={3} />
                      </div>
                      <span className="text-sm text-gray-700 font-medium">Advanced Analytics</span>
                    </li>
                    <li className="flex items-start gap-3 opacity-60 hover:opacity-100 transition-opacity">
                      <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${isPopular ? 'bg-[#5022C3] text-white' : 'bg-purple-100 text-[#5022C3]'}`}>
                        <Check className="w-3.5 h-3.5" strokeWidth={3} />
                      </div>
                      <span className="text-sm text-gray-700 font-medium">24/7 Priority Support</span>
                    </li>
                  </ul>
                  
                  {isCurrentActive ? (
                    <button disabled className="w-full py-3.5 px-4 rounded-xl font-bold bg-green-50 text-green-600 border-2 border-green-200 flex items-center justify-center gap-2 cursor-default">
                      <Check className="w-5 h-5" /> Current Plan
                    </button>
                  ) : isCurrentPending ? (
                    <button disabled className="w-full py-3.5 px-4 rounded-xl font-bold bg-amber-50 text-amber-600 border-2 border-amber-200 flex items-center justify-center gap-2 cursor-default animate-pulse">
                      <Clock className="w-5 h-5" /> Pending Approval
                    </button>
                  ) : (
                    <button 
                      onClick={() => setConfirmModal(pkg)}
                      disabled={isPending} // Disable all other buttons if one is pending
                      className={`w-full py-3.5 px-4 rounded-xl font-bold transition-all duration-300 transform group-hover:-translate-y-1 ${
                        isPending ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
                        isPopular 
                          ? 'bg-[#5022C3] hover:bg-[#401a9c] text-white shadow-xl shadow-purple-500/30' 
                          : 'bg-white border-2 border-[#5022C3] text-[#5022C3] hover:bg-purple-50'
                      }`}
                    >
                      {isPending ? 'Cannot upgrade yet' : 'Upgrade to ' + pkg.name}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Feature Highlight */}
      <div className="mt-24 bg-gradient-to-br from-slate-900 via-[#1A0B2E] to-slate-900 rounded-[2.5rem] p-10 md:p-14 text-white flex flex-col md:flex-row items-center justify-between gap-12 shadow-2xl relative overflow-hidden w-full mx-auto">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>

        <div className="max-w-2xl relative z-10">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-5 tracking-tight">Enterprise Grade Security & Performance</h2>
          <p className="text-slate-300 text-base md:text-lg leading-relaxed font-medium">
            All our premium plans come with a 99.99% uptime SLA guarantee, real-time automated backups, and enterprise-grade SSL certificates included completely free of charge. Your store is always blazingly fast and impeccably secure.
          </p>
        </div>
        <div className="flex gap-8 relative z-10 shrink-0">
          <div className="flex flex-col items-center gap-3 group">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10 group-hover:scale-110 group-hover:bg-white/20 transition-all duration-300 shadow-xl">
              <Zap className="w-8 h-8 text-yellow-400 drop-shadow-md" />
            </div>
            <span className="text-sm font-bold text-slate-300 tracking-wide uppercase">Global CDN</span>
          </div>
          <div className="flex flex-col items-center gap-3 group">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10 group-hover:scale-110 group-hover:bg-white/20 transition-all duration-300 shadow-xl">
              <ShieldCheck className="w-8 h-8 text-emerald-400 drop-shadow-md" />
            </div>
            <span className="text-sm font-bold text-slate-300 tracking-wide uppercase">AES-256 SSL</span>
          </div>
        </div>
      </div>
      
      <div className="h-16"></div>

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl scale-in-center">
            <div className="p-8 text-center relative">
              <div className="absolute top-4 right-4">
                <button 
                  onClick={() => !submitting && setConfirmModal(null)}
                  className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Crown className="w-10 h-10 text-[#5022C3]" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">Confirm Upgrade</h2>
              <p className="text-gray-500 mb-6">
                Are you sure you want to request an upgrade to the <span className="font-bold text-gray-900">{confirmModal.name}</span> plan for <span className="font-bold text-gray-900">৳{confirmModal.price}/{confirmModal.billingCycle === 'yearly' ? 'yr' : 'mo'}</span>?
              </p>
              
              <div className="bg-gray-50 rounded-2xl p-4 mb-8 text-left border border-gray-100">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">What happens next</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" /> Request sent to admin
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" /> Current plan remains active
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" /> Automatically switches upon approval
                  </li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setConfirmModal(null)}
                  disabled={submitting}
                  className="flex-1 py-3.5 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSubscribe}
                  disabled={submitting}
                  className="flex-1 py-3.5 text-sm font-bold bg-[#5022C3] text-white hover:bg-[#401a9c] rounded-xl transition-colors shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing
                    </>
                  ) : (
                    'Confirm Upgrade'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

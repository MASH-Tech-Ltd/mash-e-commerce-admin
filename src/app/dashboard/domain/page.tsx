"use client";

import { useState, useEffect } from "react";
import {
  Globe,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Clock,
  LifeBuoy,
} from "lucide-react";
import { api } from "@/utils/api";
import toast from "react-hot-toast";

export default function DomainManagementPage() {
  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [customDomain, setCustomDomain] = useState("");

  useEffect(() => {
    fetchStoreInfo();
  }, []);

  const fetchStoreInfo = async () => {
    try {
      const res = await api.get("/tenants/my-store");
      if (res.data?.data) {
        setStore(res.data.data);
        setCustomDomain(res.data.data.customDomain || "");
      }
    } catch (error) {
      console.error("Failed to fetch store data", error);
      toast.error("Failed to load store information");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // In this endpoint it expects FormData because of logo, so we must append.
      // But we can also just send JSON if the backend supports it, or use FormData.
      const formData = new FormData();
      formData.append("customDomain", customDomain);

      await api.patch("/tenants/update-store", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Domain updated successfully");
      fetchStoreInfo();
    } catch (error: any) {
      console.error("Error updating domain", error);
      toast.error(error.response?.data?.message || "Failed to update domain");
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
          <Globe className="w-6 h-6 text-[#5022C3]" /> Domain Management
        </h1>
        <p className="text-gray-500">
          Connect your own custom domain to your store to build your brand and
          build trust with your customers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
            <h2 className="text-lg font-bold text-gray-900 mb-6">
              Custom Domain Settings
            </h2>

            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Primary Domain
                </label>
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Globe className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. www.mystore.com"
                      value={customDomain}
                      onChange={(e) => setCustomDomain(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5022C3] focus:border-transparent transition-all"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={saving}
                      className="bg-[#5022C3] hover:bg-[#401a9c] text-white px-6 py-3 rounded-xl font-bold shadow-md shadow-purple-500/20 transition-all flex items-center gap-2 whitespace-nowrap disabled:opacity-70"
                    >
                      {saving ? "Saving..." : "Save Domain"}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        toast("Support team will contact you shortly!", {
                          icon: "👋",
                        })
                      }
                      className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap"
                    >
                      <LifeBuoy className="w-5 h-5 text-gray-500" />
                      Get Help
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-500" /> Enter your
                  domain exactly as you want it to appear. Do not include
                  http:// or https://
                </p>
              </div>
            </form>

            <div className="mt-8 pt-8 border-t border-gray-100">
              <h3 className="text-md font-bold text-gray-900 mb-4">
                Current Active Domains
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">
                        {store?.slug}.localhost:3000
                      </p>
                      <p className="text-xs text-gray-500">
                        System Domain (Default)
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                    Connected
                  </span>
                </div>

                {store?.customDomain && (
                  <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-xl shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-amber-900">
                          {store.customDomain}
                        </p>
                        <p className="text-xs text-amber-700/70">
                          Awaiting Super Admin Approval
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full border border-amber-200">
                      Pending
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gradient-to-br from-[#1E1B4B] to-[#312E81] rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" /> Free SSL
                Included
              </h3>
              <p className="text-indigo-200 text-sm leading-relaxed mb-6">
                Every custom domain connected to Merchant Hub automatically
                receives a free, auto-renewing SSL certificate. Your store will
                be completely secure from day one.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-md font-bold text-gray-900 mb-4">
              DNS Configuration
            </h3>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              To connect your domain, log in to your domain provider (e.g.,
              GoDaddy, Namecheap) and add the following records to your DNS
              settings.
            </p>

            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm">
                <div className="flex justify-between mb-1">
                  <span className="font-bold text-gray-700">Type</span>
                  <span className="text-gray-900">A Record</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="font-bold text-gray-700">Name</span>
                  <span className="text-gray-900">@</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-gray-700">Value</span>
                  <span className="text-gray-900 font-mono bg-white px-2 py-0.5 border rounded">
                    76.76.21.21
                  </span>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm">
                <div className="flex justify-between mb-1">
                  <span className="font-bold text-gray-700">Type</span>
                  <span className="text-gray-900">CNAME</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="font-bold text-gray-700">Name</span>
                  <span className="text-gray-900">www</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-gray-700">Value</span>
                  <span className="text-gray-900 font-mono bg-white px-2 py-0.5 border rounded">
                    cname.merchanthub.com
                  </span>
                </div>
              </div>
            </div>

            <button className="w-full mt-6 flex items-center justify-center gap-2 text-sm font-bold text-[#5022C3] hover:text-[#401a9c] transition-colors">
              Read Detailed Guide <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

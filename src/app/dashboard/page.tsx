'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, Users, ShoppingBag, DollarSign, 
  MoreVertical, Activity, HeadphonesIcon, Copy, ArrowUpRight, ArrowDownRight, Store, ExternalLink, Crown, Calendar, Clock, CreditCard, Tag, Package, Star
} from 'lucide-react';
import { api } from '../../utils/api';
import { toast } from 'react-hot-toast';

const baseMetrics = [
  { title: "Total Revenue", icon: DollarSign, color: "text-blue-600", bg: "bg-blue-100" },
  { title: "Total Orders", icon: ShoppingBag, color: "text-purple-600", bg: "bg-purple-100" },
  { title: "Active Customers", icon: Users, color: "text-orange-600", bg: "bg-orange-100" },
  { title: "Conversion Rate", icon: Activity, color: "text-green-600", bg: "bg-green-100" },
];

export default function DashboardOverview() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [productStats, setProductStats] = useState({ total: 0, active: 0, inactive: 0 });
  const [categoryStats, setCategoryStats] = useState({ total: 0, active: 0, inactive: 0 });
  const [topProducts, setTopProducts] = useState<any[]>([]);

  useEffect(() => {
    // 1. Instantly load cached data if available (Optimistic UI)
    const cachedData = localStorage.getItem('dashboardCache');
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        if (parsed.metrics) {
          // Restore the React component reference for icons which is lost during JSON stringify
          setMetrics(parsed.metrics.map((m: any, idx: number) => ({ ...m, icon: baseMetrics[idx].icon })));
        }
        if (parsed.recentOrders) setRecentOrders(parsed.recentOrders);
        if (parsed.productStats) setProductStats(parsed.productStats);
        if (parsed.categoryStats) setCategoryStats(parsed.categoryStats);
        if (parsed.topProducts) setTopProducts(parsed.topProducts);
        setLoading(false); // Disable loading state so we don't show skeleton
      } catch (e) {
        console.error("Failed to parse dashboard cache", e);
      }
    }

    // 2. Fetch fresh data in the background
    const fetchDashboardData = async () => {
      try {
        if (!cachedData) setLoading(true);

        // Fetch Stats
        const statsRes = await api.get('/analytics/dashboard-stats', { params: { days: 7 } });
        const stats = statsRes.data?.data || {};

        const newMetrics = [
          { ...baseMetrics[0], value: `${(stats.totalRevenue || 0).toLocaleString()} BDT`, change: "+14.5%", isPositive: true },
          { ...baseMetrics[1], value: stats.totalOrders || 0, change: "+5.2%", isPositive: true },
          { ...baseMetrics[2], value: stats.totalCustomers || 0, change: "-1.1%", isPositive: false },
          { ...baseMetrics[3], value: `${stats.conversionRate || 0}%`, change: "+0.8%", isPositive: true },
        ];
        setMetrics(newMetrics);

        // Fetch Orders
        const ordersRes = await api.get('/orders/get-paginated-orders', { params: { page: 1, limit: 5 } });
        const newRecentOrders = ordersRes.data?.data || [];
        setRecentOrders(newRecentOrders);

        // Fetch Products and Categories Stats
        let newProductStats = { total: 0, active: 0, inactive: 0 };
        let newCategoryStats = { total: 0, active: 0, inactive: 0 };
        let newTopProducts: any[] = [];

        try {
          // Get Top Products & Total Products
          const prodsRes = await api.get('/products/get-all-product', { params: { limit: 4, sortBy: 'salesCount', sortOrder: 'desc' } });
          const totalProds = prodsRes.data?.meta?.total || 0;
          newTopProducts = prodsRes.data?.data || [];
          setTopProducts(newTopProducts);

          // Try to get inactive/draft products to calculate active
          const draftProdsRes = await api.get('/products/get-all-product', { params: { limit: 1, status: 'DRAFT' } });
          const draftProds = draftProdsRes.data?.meta?.total || 0;

          newProductStats = {
            total: totalProds,
            active: totalProds - draftProds,
            inactive: draftProds
          };
          setProductStats(newProductStats);

          // Fetch Categories
          const catRes = await api.get('/categories/get-all-category', { params: { limit: 1000 } });
          const allCats = catRes.data?.data || [];
          newCategoryStats = {
             total: allCats.length,
             active: allCats.filter((c: any) => c.status !== 'INACTIVE').length,
             inactive: allCats.filter((c: any) => c.status === 'INACTIVE').length,
          };
          setCategoryStats(newCategoryStats);

        } catch (e) {
          console.error("Failed to fetch store overview stats", e);
        }

        // 3. Save fresh data to cache for next load
        localStorage.setItem('dashboardCache', JSON.stringify({
          metrics: newMetrics,
          recentOrders: newRecentOrders,
          productStats: newProductStats,
          categoryStats: newCategoryStats,
          topProducts: newTopProducts
        }));

      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const storeUrl = process.env.NEXT_PUBLIC_STORE_URL || `http://localhost:3000`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(storeUrl);
    toast.success('Store URL copied to clipboard!');
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Completed':
      case 'Delivered':
        return <span className="px-2.5 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">{status}</span>;
      case 'Processing':
        return <span className="px-2.5 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">{status}</span>;
      case 'Pending':
        return <span className="px-2.5 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">{status}</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">{status}</span>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div className="relative min-h-full pb-20 bg-[#F8FAFC]">
      <div className="w-full max-w-[1800px] mx-auto pt-6 md:pt-8 px-4 md:px-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back, Admin 👋</h1>
            <p className="text-gray-500 text-sm">Here is what's happening with your store today.</p>
          </div>
          
          {/* Quick Actions / Store Link */}
          <div className="flex items-center gap-3">
            <div className="bg-white border border-gray-200 rounded-xl px-4 py-2 flex items-center gap-3 shadow-sm max-w-full overflow-hidden">
              <span className="text-sm font-medium text-gray-600 truncate">
                {storeUrl.replace(/^https?:\/\//, '')}
              </span>
              <div className="w-px h-4 bg-gray-200 shrink-0"></div>
              <button onClick={copyToClipboard} className="text-gray-400 hover:text-indigo-600 transition-colors shrink-0" title="Copy URL">
                <Copy className="w-4 h-4" />
              </button>
              <a href={storeUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-indigo-600 transition-colors shrink-0" title="Visit Store">
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-8">
          {loading ? (
             Array(4).fill(0).map((_, idx) => (
                <div key={idx} className="bg-white/50 animate-pulse rounded-2xl p-6 border border-gray-100 h-[140px]"></div>
             ))
          ) : (
            metrics.map((metric, idx) => (
              <div key={idx} className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-xl ${metric.bg}`}>
                    <metric.icon className={`w-5 h-5 ${metric.color}`} />
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg ${metric.isPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {metric.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {metric.change}
                  </div>
                </div>
                <h3 className="text-gray-500 text-sm font-medium mb-1">{metric.title}</h3>
                <p className="text-2xl font-bold text-gray-900 tracking-tight">{metric.value}</p>
              </div>
            ))
          )}
        </div>

        {/* Data Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column Data (Orders & Best Selling) */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            {/* Recent Orders Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-50 flex justify-between items-center bg-white/50 backdrop-blur-md">
              <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
              <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-gray-500">Loading orders...</td>
                    </tr>
                  ) : recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-gray-500">No orders found.</td>
                    </tr>
                  ) : recentOrders.map((order, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-semibold text-indigo-600 text-sm">#{order._id?.slice(-6).toUpperCase()}</span>
                        <div className="text-xs text-gray-400 mt-0.5">{formatDate(order.createdAt)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 text-sm">{order.customerName}</div>
                        <div className="text-xs text-gray-500 mt-0.5 truncate max-w-[150px]">{order.items?.[0]?.title || 'Multiple Items'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 text-sm">
                        {order.totalPrice?.toLocaleString()} BDT
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button className="text-gray-400 hover:text-indigo-600 p-1.5 rounded-lg hover:bg-indigo-50 transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          </div>

          <div className="flex flex-col gap-6">
            {/* Best Selling Products */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
              <h2 className="text-sm font-bold text-gray-900 mb-5 uppercase tracking-wider flex items-center gap-2">
                 <Star className="w-4 h-4 text-yellow-500" /> Best Selling Products
              </h2>
              <div className="space-y-4">
                {topProducts.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No products found.</p>
                ) : (
                  topProducts.map((product, idx) => (
                    <div key={idx} className="flex items-center gap-4 bg-gray-50/50 p-3 rounded-xl border border-gray-100/50 transition-all hover:bg-gray-50">
                      <div className="w-12 h-12 rounded-lg bg-white border border-gray-200 flex-shrink-0 overflow-hidden p-1 shadow-sm">
                        {product.images && product.images[0] ? (
                          <img src={product.images[0].secure_url} alt={product.title} className="w-full h-full object-cover rounded-md" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <Package className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate mb-1">{product.title}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">{product.salesCount || 0} Sold</span>
                          <span className="text-[11px] font-medium text-gray-500">Total Sales</span>
                        </div>
                      </div>
                      <div className="text-sm font-black text-gray-900 shrink-0 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                        {product.discountedPrice || product.originalPrice} BDT
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Store Overview Data */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
               <h2 className="text-sm font-bold text-gray-900 mb-5 uppercase tracking-wider flex items-center gap-2">
                 <Store className="w-4 h-4 text-indigo-500" /> Store Overview
               </h2>
               
               <div className="space-y-6">
                 {/* Product Stats */}
                 <div>
                   <div className="flex justify-between items-center text-sm mb-3">
                     <span className="text-gray-700 font-bold flex items-center gap-2">
                       <Package className="w-4 h-4 text-purple-500" /> Total Products
                     </span>
                     <span className="text-gray-900 font-bold bg-purple-50 px-2 py-0.5 rounded-md">{productStats.total}</span>
                   </div>
                   <div className="grid grid-cols-2 gap-3">
                     <div className="bg-green-50/50 rounded-xl p-3 border border-green-100/50 flex flex-col items-center justify-center">
                       <span className="text-[10px] uppercase font-bold text-green-600 mb-1">Active</span>
                       <span className="text-lg font-black text-green-700">{productStats.active}</span>
                     </div>
                     <div className="bg-gray-50/50 rounded-xl p-3 border border-gray-100/50 flex flex-col items-center justify-center">
                       <span className="text-[10px] uppercase font-bold text-gray-500 mb-1">Inactive/Draft</span>
                       <span className="text-lg font-black text-gray-700">{productStats.inactive}</span>
                     </div>
                   </div>
                 </div>

                 <div className="w-full h-px bg-gray-100"></div>

                 {/* Category Stats */}
                 <div>
                   <div className="flex justify-between items-center text-sm mb-3">
                     <span className="text-gray-700 font-bold flex items-center gap-2">
                       <Tag className="w-4 h-4 text-blue-500" /> Total Categories
                     </span>
                     <span className="text-gray-900 font-bold bg-blue-50 px-2 py-0.5 rounded-md">{categoryStats.total}</span>
                   </div>
                   <div className="grid grid-cols-2 gap-3">
                     <div className="bg-blue-50/50 rounded-xl p-3 border border-blue-100/50 flex flex-col items-center justify-center">
                       <span className="text-[10px] uppercase font-bold text-blue-600 mb-1">Active</span>
                       <span className="text-lg font-black text-blue-700">{categoryStats.active}</span>
                     </div>
                     <div className="bg-gray-50/50 rounded-xl p-3 border border-gray-100/50 flex flex-col items-center justify-center">
                       <span className="text-[10px] uppercase font-bold text-gray-500 mb-1">Inactive</span>
                       <span className="text-lg font-black text-gray-700">{categoryStats.inactive}</span>
                     </div>
                   </div>
                 </div>
               </div>
            </div>

          </div>

        </div>

      </div>

      {/* Floating Action Button */}
      <button className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-[0_8px_30px_rgb(79,70,229,0.3)] hover:bg-indigo-700 hover:scale-105 transition-all duration-300 z-50">
        <HeadphonesIcon className="w-6 h-6" />
        <span className="absolute top-2 right-2 w-3 h-3 bg-green-400 border-2 border-indigo-600 rounded-full"></span>
      </button>
    </div>
  );
}

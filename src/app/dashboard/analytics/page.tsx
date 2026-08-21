'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Users, ShoppingBag, DollarSign } from 'lucide-react';
import { api } from '@/utils/api';

export default function AnalyticsPage() {
  const CACHE_KEY = 'dashboard_analytics_cache';
  
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState(7);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    conversionRate: 3.2,
    chartData: []
  });

  useEffect(() => {
    let hasCache = false;
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        setStats(JSON.parse(cached));
        setLoading(false);
        hasCache = true;
      }
    } catch (e) {}
    fetchStats(hasCache);
  }, [timeframe]);

  const fetchStats = async (hasCache: boolean = false) => {
    if (!hasCache) setLoading(true);
    try {
      const response = await api.get('/analytics/dashboard-stats', {
        params: { days: timeframe }
      });
      if (response.data?.data) {
        const newData = {
          totalRevenue: response.data.data.totalRevenue || 0,
          totalOrders: response.data.data.totalOrders || 0,
          totalCustomers: response.data.data.totalCustomers || 0,
          conversionRate: response.data.data.conversionRate || 3.2,
          chartData: response.data.data.chartData || []
        };
        setStats(newData);
        if (timeframe === 7) {
          localStorage.setItem(CACHE_KEY, JSON.stringify(newData));
        }
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 w-full max-w-[1800px] mx-auto" suppressHydrationWarning>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Track your store's performance</p>
        </div>
        <select 
          className="border border-gray-200 rounded-lg text-sm px-3 py-2 bg-white focus:outline-none focus:border-[#5022C3]"
          value={timeframe}
          onChange={(e) => setTimeframe(Number(e.target.value))}
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last 12 months</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-medium text-gray-600">Total Revenue</h3>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{stats.totalRevenue.toLocaleString()} BDT</div>
          <div className="flex items-center text-xs font-medium text-green-600">
            <TrendingUp className="w-3 h-3 mr-1" /> For selected period
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-medium text-gray-600">Total Orders</h3>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{stats.totalOrders}</div>
          <div className="flex items-center text-xs font-medium text-green-600">
            <TrendingUp className="w-3 h-3 mr-1" /> For selected period
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-medium text-gray-600">Total Customers</h3>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{stats.totalCustomers}</div>
          <div className="flex items-center text-xs font-medium text-green-600">
            <TrendingUp className="w-3 h-3 mr-1" /> Overall registered
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-yellow-50 text-yellow-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-medium text-gray-600">Conversion Rate</h3>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{stats.conversionRate}%</div>
          <div className="flex items-center text-xs font-medium text-gray-400">
            Average rate
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Revenue Over Time</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dx={-10} tickFormatter={(value) => `${value.toLocaleString()}`} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} formatter={(value: any) => [Number(value || 0).toLocaleString() + ' BDT', 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke="#5022C3" strokeWidth={3} dot={{r: 4, fill: '#5022C3', strokeWidth: 0}} activeDot={{r: 6, fill: '#5022C3', stroke: '#fff', strokeWidth: 2}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Orders Summary</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dx={-10} />
                <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="orders" fill="#8200da" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

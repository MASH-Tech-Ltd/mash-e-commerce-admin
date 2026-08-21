'use client';

import { useState, useEffect } from 'react';
import { Search, MoreVertical, Users, Mail, Phone, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '@/utils/api';

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchCustomers();
  }, [page, limit]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search })
      });
      const response = await api.get(`/customers/my-customers?${query.toString()}`).catch(() => ({ data: { data: [], meta: { total: 0, totalPages: 0 } } }));
      setCustomers(response.data.data || []);
      if (response.data.meta) {
        setTotalRecords(response.data.meta.total);
        setTotalPages(response.data.meta.totalPages);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full font-sans flex flex-col">
      <div className="bg-white border-t border-gray-200 flex-1 flex flex-col min-h-0">
        {/* Filters Bar */}
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#fcfcfc] shrink-0">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search by name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchCustomers()}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#5022C3] focus:ring-1 focus:ring-[#5022C3] w-full bg-white transition-all"
            />
          </div>
          <div className="flex items-center gap-3">
            <select className="border border-gray-300 rounded-lg text-sm px-3 py-2.5 focus:outline-none focus:border-[#5022C3] bg-white text-gray-600 font-medium hidden sm:block">
              <option>Sort by: Newest</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1 custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider border-b border-gray-200">
                <th className="px-6 py-4 font-semibold">Customer Name</th>
                <th className="px-6 py-4 font-semibold">Contact</th>
                <th className="px-6 py-4 font-semibold">Orders</th>
                <th className="px-6 py-4 font-semibold">Total Spent</th>
                <th className="px-6 py-4 font-semibold">Joined</th>
                <th className="px-6 py-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-4 border-purple-200 border-t-[#5022C3] rounded-full animate-spin mb-4"></div>
                      <p>Loading customers...</p>
                    </div>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center text-[#5022C3] mb-4">
                        <Users className="w-8 h-8" />
                      </div>
                      <p className="text-lg font-medium text-gray-900">No customers found</p>
                      <p className="text-sm mt-1">Customers will appear here when they place an order.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer._id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-purple-100 text-[#5022C3] flex items-center justify-center font-bold text-sm">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-900">{customer.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        {customer.email && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-3.5 h-3.5 text-gray-400" /> {customer.email}
                          </div>
                        )}
                        {customer.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-3.5 h-3.5 text-gray-400" /> {customer.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center justify-center bg-gray-100 px-2.5 py-1 rounded-full text-xs font-bold text-gray-700">
                        {customer.totalOrders || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">
                      {customer.totalSpent ? customer.totalSpent.toLocaleString() : 0} BDT
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(customer.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center">
                        <button className="w-8 h-8 rounded-lg bg-gray-50 text-gray-400 hover:text-[#5022C3] hover:bg-purple-50 flex items-center justify-center transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && customers.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex flex-col md:flex-row items-center justify-between gap-4 shrink-0 mt-auto">
            <div className="text-sm text-gray-500 font-medium whitespace-nowrap">
              Showing <span className="font-bold text-gray-900">{(page - 1) * limit + 1}</span> to <span className="font-bold text-gray-900">{Math.min(page * limit, totalRecords)}</span> of <span className="font-bold text-gray-900">{totalRecords}</span> results
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-full">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed bg-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setPage(i + 1)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors shrink-0 ${
                    page === i + 1 
                      ? 'bg-[#5022C3] text-white border border-[#5022C3]' 
                      : 'border border-gray-200 text-gray-600 hover:bg-gray-50 bg-white'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed bg-white transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

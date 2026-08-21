'use client';

import { useState, useEffect } from 'react';
import { Search, Users, Mail, Phone, ChevronLeft, ChevronRight, Eye, Edit, Trash2, X } from 'lucide-react';
import { api } from '@/utils/api';

interface CustomerActivity {
  type: string;
  status?: string;
  date: string;
  note?: string;
}

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  division?: string;
  district?: string;
  upazila?: string;
  totalOrders: number;
  totalSpent: number;
  activity?: CustomerActivity[];
  createdAt: string;
}

export default function CustomersPage() {
  const CACHE_KEY = 'dashboard_customers_cache';
  
  const getCachedData = () => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) return JSON.parse(cached);
      } catch (e) {}
    }
    return [];
  };

  const [customers, setCustomers] = useState<Customer[]>(getCachedData);
  const [loading, setLoading] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        if (localStorage.getItem(CACHE_KEY)) return false;
      } catch (e) {}
    }
    return true;
  });
  const [search, setSearch] = useState('');
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Modal States
  const [viewCustomer, setViewCustomer] = useState<Customer | null>(null);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  
  // Loading States
  const [actionLoading, setActionLoading] = useState(false);



  useEffect(() => {
    fetchCustomers();
  }, [page, limit]);

  const fetchCustomers = async () => {
    if (customers.length === 0) setLoading(true);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search })
      });
      const response = await api.get(`/customers/get-paginated-customers?${query.toString()}`).catch(() => ({ data: { data: [], meta: { total: 0, totalPages: 0 } } }));
      const fetchedData = response.data.data || [];
      setCustomers(fetchedData);
      if (response.data.meta) {
        setTotalRecords(response.data.meta.total);
        setTotalPages(response.data.meta.totalPages);
      }

      if (page === 1 && !search) {
        localStorage.setItem(CACHE_KEY, JSON.stringify(fetchedData));
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (id: string) => {
    setActionLoading(true);
    try {
      const response = await api.get(`/customers/${id}`);
      setViewCustomer(response.data.data);
    } catch (error) {
      console.error('Error fetching customer details:', error);
      alert('Failed to fetch customer details');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = async (id: string) => {
    setActionLoading(true);
    try {
      const response = await api.get(`/customers/${id}`);
      setEditCustomer(response.data.data);
    } catch (error) {
      console.error('Error fetching customer for edit:', error);
      alert('Failed to load customer for editing');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCustomer) return;
    setActionLoading(true);
    try {
      await api.patch(`/customers/${editCustomer._id}`, editCustomer);
      setEditCustomer(null);
      fetchCustomers();
    } catch (error) {
      console.error('Error updating customer:', error);
      alert('Failed to update customer');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this customer? This action cannot be undone.')) return;
    setActionLoading(true);
    try {
      await api.delete(`/customers/${id}`);
      fetchCustomers();
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert('Failed to delete customer');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="w-full h-full font-sans flex flex-col" suppressHydrationWarning>
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
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gray-200 rounded-full shrink-0"></div>
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-3 bg-gray-200 rounded w-32 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-8 bg-gray-200 rounded-lg w-24 mx-auto"></div></td>
                  </tr>
                ))
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
                      <div className="flex flex-col gap-1.5">
                        <div className="font-semibold text-gray-900 text-sm">
                          Total: {customer.totalOrders || 0}
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-medium">
                          <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Rcv: {customer.activity?.filter(a => a.type === 'receive').length || 0}</span>
                          <span className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded">Cnl: {customer.activity?.filter(a => a.type === 'cancel').length || 0}</span>
                          <span className="bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">Ret: {customer.activity?.filter(a => a.type === 'return').length || 0}</span>
                        </div>
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
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleView(customer._id)}
                          disabled={actionLoading}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50" 
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEdit(customer._id)}
                          disabled={actionLoading}
                          className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors disabled:opacity-50" 
                          title="Edit Customer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(customer._id)}
                          disabled={actionLoading}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50" 
                          title="Delete Customer"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* View Modal */}
      {viewCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Customer Details</h2>
              <button onClick={() => setViewCustomer(null)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Name</p>
                  <p className="font-semibold text-gray-900">{viewCustomer.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Phone</p>
                  <p className="font-semibold text-gray-900">{viewCustomer.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Email</p>
                  <p className="font-semibold text-gray-900">{viewCustomer.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Joined</p>
                  <p className="font-semibold text-gray-900">{new Date(viewCustomer.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Division</p>
                  <p className="font-semibold text-gray-900">{viewCustomer.division || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">District</p>
                  <p className="font-semibold text-gray-900">{viewCustomer.district || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Upazila / Area</p>
                  <p className="font-semibold text-gray-900">{viewCustomer.upazila || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500 mb-1">Full Address</p>
                  <p className="font-semibold text-gray-900">{viewCustomer.address || 'N/A'}</p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-8 flex justify-around text-center">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Total Orders</p>
                  <p className="text-xl font-bold text-gray-900">{viewCustomer.totalOrders || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-green-600 uppercase tracking-wider font-semibold mb-1">Received</p>
                  <p className="text-xl font-bold text-green-700">{viewCustomer.activity?.filter(a => a.type === 'receive').length || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-yellow-600 uppercase tracking-wider font-semibold mb-1">Returned</p>
                  <p className="text-xl font-bold text-yellow-700">{viewCustomer.activity?.filter(a => a.type === 'return').length || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-red-600 uppercase tracking-wider font-semibold mb-1">Cancelled</p>
                  <p className="text-xl font-bold text-red-700">{viewCustomer.activity?.filter(a => a.type === 'cancel').length || 0}</p>
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Activity History</h3>
              {viewCustomer.activity && viewCustomer.activity.length > 0 ? (
                <div className="space-y-4">
                  {viewCustomer.activity.map((act, i) => (
                    <div key={i} className="flex gap-4 items-start p-4 bg-gray-50 rounded-lg">
                      <div className="mt-0.5">
                        <div className={`w-2 h-2 rounded-full ${act.type === 'cancel' || act.type === 'return' ? 'bg-red-500' : act.type === 'receive' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900 capitalize">{act.type.replace('_', ' ')}</p>
                        <p className="text-xs text-gray-500 mt-1">{new Date(act.date).toLocaleString()}</p>
                        {act.note && <p className="text-sm text-gray-600 mt-2">{act.note}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm italic">No activity recorded for this customer.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Edit Customer</h2>
              <button onClick={() => setEditCustomer(null)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input 
                  type="text" 
                  value={editCustomer.name} 
                  onChange={(e) => setEditCustomer({...editCustomer, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#5022C3] focus:border-[#5022C3] outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input 
                  type="text" 
                  value={editCustomer.phone} 
                  onChange={(e) => setEditCustomer({...editCustomer, phone: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#5022C3] focus:border-[#5022C3] outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  type="email" 
                  value={editCustomer.email || ''} 
                  onChange={(e) => setEditCustomer({...editCustomer, email: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#5022C3] focus:border-[#5022C3] outline-none"
                />
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setEditCustomer(null)}
                  className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={actionLoading}
                  className="px-4 py-2 bg-[#5022C3] text-white font-medium rounded-lg hover:bg-[#401a9b] transition-colors disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

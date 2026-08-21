'use client';

import { useState, useEffect } from 'react';
import { Search, MoreVertical, ShoppingBag, Eye, Edit, Trash2, X, ChevronLeft, ChevronRight, FileText, Printer, ShieldCheck } from 'lucide-react';
import { api } from '@/utils/api';
import { toast } from 'react-hot-toast';
import { EditOrderModal } from './EditOrderModal';
import { io } from 'socket.io-client';

interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  _id: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  note: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
  subTotal: number;
  shippingCharge: number;
  paymentStatus: string;
}

export default function OrdersPage() {
  const CACHE_KEY = 'dashboard_orders_cache';
  
  const getCachedData = () => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) return JSON.parse(cached);
      } catch (e) {}
    }
    return [];
  };

  const [orders, setOrders] = useState<Order[]>(getCachedData);
  const [loading, setLoading] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        if (localStorage.getItem(CACHE_KEY)) return false;
      } catch (e) {}
    }
    return true;
  });
  
  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  
  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [refreshFlag, setRefreshFlag] = useState(0);

  // Modals
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [deleteOrder, setDeleteOrder] = useState<Order | null>(null);
  const [checkingFraud, setCheckingFraud] = useState<string | null>(null);

  const [storeName, setStoreName] = useState('Your Store');

  useEffect(() => {
    try {
      const storedUser = sessionStorage.getItem('merchantUser');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        let sName = user.name || 'Your Store';
        if (user.details && user.details.startsWith('{')) {
          const extraDetails = JSON.parse(user.details);
          if (extraDetails.storeName) sName = extraDetails.storeName;
        }
        setStoreName(sName);
      }
    } catch (e) {}
  }, []);



  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter, search, refreshFlag]);

  useEffect(() => {
    const handleNewNotification = () => {
      // Trigger order fetch when a notification (e.g. new order) is received
      setRefreshFlag(prev => prev + 1);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('new_notification_received', handleNewNotification);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('new_notification_received', handleNewNotification);
      }
    };
  }, []);

  const fetchOrders = async () => {
    // Only show loading if we don't have any orders displayed yet
    if (orders.length === 0) setLoading(true);
    try {
      const response = await api.get('/orders/get-paginated-orders', {
        params: { page, limit, status: statusFilter, search }
      });
      const fetchedOrders = response.data.data || [];
      setOrders(fetchedOrders);
      setTotalPages(response.data.meta?.totalPages || 1);
      setTotalRecords(response.data.meta?.total || 0);
      
      // Cache the first page of default results
      if (page === 1 && statusFilter === 'all' && !search) {
        localStorage.setItem(CACHE_KEY, JSON.stringify(fetchedOrders));
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrder = async (id: string, payload: any) => {
    try {
      await api.patch(`/orders/update-order/${id}`, payload);
      setEditOrder(null);
      fetchOrders();
      toast.success('Order updated successfully');
    } catch (error) {
      console.error('Failed to update order', error);
      toast.error('Failed to update order');
    }
  };

  const handleDelete = async () => {
    if (!deleteOrder) return;
    try {
      await api.delete(`/orders/delete-order/${deleteOrder._id}`);
      setDeleteOrder(null);
      fetchOrders();
    } catch (error) {
      console.error('Failed to delete order', error);
      toast.error('Failed to delete order');
    }
  };

  const handleFraudCheck = async (orderId: string) => {
    setCheckingFraud(orderId);
    try {
      const response = await api.post('/fraud/check', { orderId });
      const data = response.data?.data;
      if (data) {
        toast.success(`Fraud Score: ${data.score} (${data.status.toUpperCase()})`);
      }
    } catch (error) {
      toast.error('Failed to check fraud score');
    } finally {
      setCheckingFraud(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status.toLowerCase()) {
      case 'pending': return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200 capitalize">Pending</span>;
      case 'confirmed': return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200 capitalize">Confirmed</span>;
      case 'shipped': return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200 capitalize">Shipped</span>;
      case 'delivered': return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200 capitalize">Delivered</span>;
      case 'cancelled': return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200 capitalize">Cancelled</span>;
      default: return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200 capitalize">{status}</span>;
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
              placeholder="Search by customer name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchOrders()}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#5022C3] focus:ring-1 focus:ring-[#5022C3] w-full bg-white transition-all"
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select 
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="border border-gray-300 rounded-lg text-sm px-4 py-2 bg-white focus:outline-none focus:border-[#5022C3] focus:ring-1 focus:ring-[#5022C3] w-full sm:w-auto font-medium text-gray-700"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1 custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider border-b border-gray-200">
                <th className="px-6 py-4 font-bold">Order ID</th>
                <th className="px-6 py-4 font-bold">Customer</th>
                <th className="px-6 py-4 font-bold">Location</th>
                <th className="px-6 py-4 font-bold">Date</th>
                <th className="px-6 py-4 font-bold">Total</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded-full w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded-full w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-8 bg-gray-200 rounded-lg w-24 mx-auto"></div></td>
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-20">
                    <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center text-[#5022C3] mb-4 mx-auto">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No orders found</h3>
                    <p className="text-gray-500 text-sm">Adjust your filters or wait for new orders.</p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs font-medium text-[#5022C3] bg-purple-50 px-2 py-1 rounded">
                        #{order._id.substring(order._id.length - 6).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900 text-sm">{order.customerName}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{order.customerPhone}</div>
                    </td>
                    <td className="px-6 py-4 max-w-[200px]">
                      <div className="text-sm text-gray-700 truncate" title={order.shippingAddress}>
                        {order.shippingAddress}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{new Date(order.createdAt).toLocaleDateString('en-GB')}</div>
                      <div className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900 text-sm">{order.totalPrice.toLocaleString()} BDT</div>
                      <div className="text-xs text-gray-500 font-medium">{order.items?.length || 0} item(s)</div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleFraudCheck(order._id)}
                          disabled={checkingFraud === order._id}
                          className="w-8 h-8 flex items-center justify-center bg-[#f3e8ff] text-[#9333ea] hover:bg-purple-200 rounded-xl transition-colors tooltip disabled:opacity-50"
                          title="Check Fraud"
                        >
                          {checkingFraud === order._id ? (
                            <div className="w-4 h-4 border-2 border-[#9333ea] border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <ShieldCheck className="w-4 h-4" />
                          )}
                        </button>
                        <button 
                          onClick={() => setViewOrder(order)}
                          className="w-8 h-8 flex items-center justify-center bg-[#f0f4ff] text-[#3b82f6] hover:bg-blue-100 rounded-xl transition-colors tooltip"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setEditOrder(order)}
                          className="w-8 h-8 flex items-center justify-center bg-[#fff4ed] text-[#f97316] hover:bg-orange-100 rounded-xl transition-colors tooltip"
                          title="Update Status"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setDeleteOrder(order)}
                          className="w-8 h-8 flex items-center justify-center bg-[#fef2f2] text-[#ef4444] hover:bg-red-100 rounded-xl transition-colors tooltip"
                          title="Delete Order"
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
        {!loading && orders.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex flex-col md:flex-row items-center justify-between gap-4 shrink-0 mt-auto">
            <div className="text-sm text-gray-500 font-medium whitespace-nowrap">
              Showing <span className="font-bold text-gray-900">{(page - 1) * limit + 1}</span> to <span className="font-bold text-gray-900">{Math.min(page * limit, totalRecords)}</span> of <span className="font-bold text-gray-900">{totalRecords}</span> results
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-full">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 shrink-0 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              {[...Array(totalPages)].map((_, i) => {
                // To avoid rendering thousands of buttons, we will render a sliding window of pages
                // If total pages is very large, this logic prevents the UI from breaking.
                if (totalPages > 10) {
                  if (i !== 0 && i !== totalPages - 1 && (i < page - 3 || i > page + 1)) {
                    if (i === page - 4 || i === page + 2) return <span key={i} className="px-1 flex items-end">...</span>;
                    return null;
                  }
                }

                return (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-8 h-8 shrink-0 flex items-center justify-center rounded-lg border text-sm font-semibold transition-colors ${
                      page === i + 1 
                        ? 'bg-[#5022C3] border-[#5022C3] text-white shadow-sm' 
                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                );
              })}

              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 shrink-0 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Order Modal (Printable) */}
      {viewOrder && (
        <div id="printable-wrapper" className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans print:absolute print:inset-0 print:bg-white print:z-[9999] print:block print:p-0">
          <style type="text/css" media="print">
            {`
              @page { size: auto; margin: 0mm; }
              html, body { height: auto !important; overflow: visible !important; background: white !important; }
              body * { visibility: hidden !important; }
              #printable-wrapper, #printable-wrapper * { 
                visibility: visible !important; 
                -webkit-print-color-adjust: exact !important; 
                print-color-adjust: exact !important; 
              }
              #printable-wrapper {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                height: auto !important;
                background-color: white !important;
                margin: 0 !important;
                padding: 15mm !important;
              }
            `}
          </style>
          
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl print:shadow-none print:w-full print:max-w-none print:max-h-none print:h-auto print:rounded-none">
            {/* Modal Header (Hidden on Print) */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center print:hidden">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
                <div className="text-sm font-mono text-[#5022C3] mt-1 bg-purple-50 inline-block px-2 py-0.5 rounded">#{viewOrder._id.substring(viewOrder._id.length - 6).toUpperCase()}</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => window.print()} className="p-2.5 text-[#5022C3] bg-purple-50 hover:bg-purple-100 rounded-full transition-colors flex items-center gap-2 px-4 font-semibold text-sm">
                  <Printer className="w-4 h-4" /> Print Slip
                </button>
                <button onClick={() => setViewOrder(null)} className="p-2.5 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Printable Content */}
            <div className="p-8 overflow-y-auto space-y-8 flex-1 print:overflow-visible">
              
              {/* Slip Header (Visible mainly on print or as nice UI) */}
              <div className="flex justify-between items-start border-b border-gray-200 pb-6">
                <div>
                  <h1 className="text-3xl font-black text-gray-900 tracking-tight">{storeName}</h1>
                  <p className="text-gray-500 mt-1 font-medium tracking-widest text-sm uppercase">Packing Slip</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">Order #{viewOrder._id.substring(viewOrder._id.length - 6).toUpperCase()}</p>
                  <p className="text-sm text-gray-500 mt-1">Date: {new Date(viewOrder.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Customer Info</h3>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 print:border-none print:bg-transparent print:p-0">
                    <p className="font-bold text-gray-900 text-lg">{viewOrder.customerName}</p>
                    <p className="text-gray-600 mt-1">{viewOrder.customerPhone}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Shipping Address</h3>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 print:border-none print:bg-transparent print:p-0">
                    <p className="text-gray-800 leading-relaxed">{viewOrder.shippingAddress}</p>
                  </div>
                </div>
              </div>

              {viewOrder.note && (
                <div className="pt-2">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1"><FileText className="w-3 h-3"/> Order Note</h3>
                  <p className="text-sm text-gray-700 bg-yellow-50 p-4 rounded-xl border border-yellow-100 italic print:bg-transparent print:border-gray-200">{viewOrder.note}</p>
                </div>
              )}

              <div className="pt-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Order Items</h3>
                
                <div className="border border-gray-200 rounded-xl overflow-hidden print:border-gray-300">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 print:bg-gray-100">
                      <tr>
                        <th className="py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider border-b border-gray-200">Item</th>
                        <th className="py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider border-b border-gray-200 text-center">Qty</th>
                        <th className="py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider border-b border-gray-200 text-right">Price</th>
                        <th className="py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider border-b border-gray-200 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {viewOrder.items.map((item, idx) => (
                        <tr key={idx} className="bg-white">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gray-50 rounded overflow-hidden border border-gray-100 shrink-0">
                                {item.image && <img src={item.image} alt={item.title} className="w-full h-full object-cover" />}
                              </div>
                              <span className="font-medium text-gray-900">{item.title}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center text-gray-700 font-medium">{item.quantity}</td>
                          <td className="py-4 px-4 text-right text-gray-600">{item.price.toLocaleString()} BDT</td>
                          <td className="py-4 px-4 text-right font-bold text-gray-900">{(item.price * item.quantity).toLocaleString()} BDT</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="flex justify-between items-end pt-4">
                {viewOrder.paymentStatus === 'paid' ? (
                  <div className="border-2 border-green-500 text-green-600 rounded px-4 py-2 transform -rotate-6 flex flex-col items-center justify-center opacity-90 print:opacity-100 print:border-gray-900 print:text-gray-900 ml-4 mb-4">
                    <span className="text-lg font-black uppercase tracking-wider">Paid</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Delivery Charge</span>
                  </div>
                ) : (
                  <div></div>
                )}
                
                <div className="w-full max-w-sm space-y-3">
                  <div className="flex justify-between items-center text-gray-600">
                    <span>Subtotal</span>
                    <span>{viewOrder.items.reduce((acc, item) => acc + (item.price * item.quantity), 0).toLocaleString()} BDT</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-600">
                    <span>Shipping</span>
                    <span>
                      {(viewOrder.totalPrice - viewOrder.items.reduce((acc, item) => acc + (item.price * item.quantity), 0)) > 0 
                        ? (viewOrder.totalPrice - viewOrder.items.reduce((acc, item) => acc + (item.price * item.quantity), 0)).toLocaleString() + ' BDT' 
                        : 'Free'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xl font-black text-gray-900 border-t border-gray-200 pt-3">
                    <span>Total Amount</span>
                    <span className="text-[#5022C3] print:text-gray-900">{viewOrder.totalPrice.toLocaleString()} BDT</span>
                  </div>
                </div>
              </div>

            </div>
            
            {/* Modal Footer (Hidden on Print) */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-between items-center print:hidden">
              <div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Current Status</div>
                {getStatusBadge(viewOrder.status)}
              </div>
              <button onClick={() => setViewOrder(null)} className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl transition-colors">
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Edit Status Modal */}
      {editOrder && (
        <EditOrderModal 
          order={editOrder} 
          onClose={() => setEditOrder(null)} 
          onSave={handleUpdateOrder} 
        />
      )}

      {/* Delete Order Modal */}
      {deleteOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl text-center">
            <div className="p-8">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5">
                <Trash2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Delete Order?</h2>
              <p className="text-sm text-gray-500">
                Are you sure you want to delete order <span className="font-bold text-gray-700">#{deleteOrder._id.substring(deleteOrder._id.length - 6).toUpperCase()}</span>? This action cannot be undone.
              </p>
            </div>
            <div className="p-5 border-t border-gray-100 bg-gray-50 flex gap-3">
              <button 
                onClick={() => setDeleteOrder(null)}
                className="flex-1 py-3 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                className="flex-1 py-3 text-sm font-bold bg-red-600 text-white hover:bg-red-700 rounded-xl transition-colors shadow-md"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

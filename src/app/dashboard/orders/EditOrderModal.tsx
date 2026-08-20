import React, { useState, useEffect } from 'react';
import { X, Trash2, Plus, Minus } from 'lucide-react';

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
  subTotal: number;
  shippingCharge: number;
  paymentStatus: string;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

interface EditOrderModalProps {
  order: Order;
  onClose: () => void;
  onSave: (id: string, payload: any) => Promise<void>;
}

export function EditOrderModal({ order, onClose, onSave }: EditOrderModalProps) {
  const initialSubTotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const derivedShippingCharge = order.shippingCharge !== undefined && order.shippingCharge !== 0 
    ? order.shippingCharge 
    : Math.max(0, order.totalPrice - initialSubTotal);

  const [items, setItems] = useState<OrderItem[]>(order.items);
  const [status, setStatus] = useState(order.status);
  const [paymentStatus, setPaymentStatus] = useState(order.paymentStatus || 'unpaid');
  const [shippingCharge] = useState(derivedShippingCharge);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalPrice = subTotal + shippingCharge;

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setItems(items.map(item => {
      if (item.productId === productId) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const handleRemoveItem = (productId: string) => {
    setItems(items.filter(item => item.productId !== productId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const payload = {
      status,
      paymentStatus,
      shippingCharge,
      subTotal,
      totalPrice,
      items
    };

    try {
      await onSave(order._id, payload);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans">
      <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900">Edit Order Details</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-8">
          {/* Order Items */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Products</h3>
            <div className="space-y-4">
              {items.map(item => (
                <div key={item.productId} className="flex items-center gap-4 border border-gray-100 rounded-xl p-3 bg-white shadow-sm">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0 border border-gray-200 p-1">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-gray-900 truncate">{item.title}</h4>
                    <div className="text-sm text-gray-500">{item.price.toLocaleString()} BDT × {item.quantity} = <span className="font-bold text-gray-900">{(item.price * item.quantity).toLocaleString()} BDT</span></div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                      <button 
                        type="button"
                        onClick={() => handleUpdateQuantity(item.productId, -1)}
                        className="px-3 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-3 font-semibold text-gray-900 text-sm">{item.quantity}</span>
                      <button 
                        type="button"
                        onClick={() => handleUpdateQuantity(item.productId, 1)}
                        className="px-3 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <button 
                      type="button"
                      onClick={() => handleRemoveItem(item.productId)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove product"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
              {items.length === 0 && (
                <div className="text-center py-6 bg-red-50 text-red-600 rounded-xl font-medium border border-red-100">
                  Order must have at least one product.
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Status & Payment */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Order Status</label>
                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-[#5022C3] bg-white font-medium text-gray-700"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Payment Status</label>
                <select 
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-[#5022C3] bg-white font-medium text-gray-700"
                >
                  <option value="unpaid">Unpaid</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
              <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Summary</h3>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center text-sm font-medium text-gray-600">
                  <span>Subtotal</span>
                  <span>{subTotal.toLocaleString()} BDT</span>
                </div>
                <div className="flex justify-between items-center text-sm font-medium text-gray-600">
                  <span>Shipping Charge</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900">{shippingCharge} BDT</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center text-lg font-black text-gray-900 border-t border-gray-200 pt-3">
                <span>Grand Total</span>
                <span className="text-[#5022C3]">{totalPrice.toLocaleString()} BDT</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button 
            type="button" 
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || items.length === 0}
            className="px-5 py-2.5 text-sm font-bold bg-[#5022C3] text-white hover:bg-[#401a9c] rounded-xl transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

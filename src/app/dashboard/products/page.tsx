'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Package, ChevronLeft, ChevronRight, X } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/utils/api';
import toast from 'react-hot-toast';

interface Product {
  _id: string;
  title: string;
  originalPrice: number;
  discountedPrice: number;
  images?: {
    secure_url: string;
  }[];
  categoryId: any;
  status?: string;
  createdAt: string;
  salesCount?: number;
  stock?: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('all');
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories/get-all-category?limit=1000');
        setCategories(response.data.data || []);
      } catch (e) {
        console.error('Error fetching categories:', e);
      }
    };
    fetchCategories();
  }, []);

  // Modals
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [page, search, categoryId, sortBy, sortOrder]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/products/get-all-product', {
        params: { page, limit, search, categoryId, sortBy, sortOrder }
      });
      setProducts(response.data.data || []);
      setTotalPages(response.data.meta?.totalPages || 1);
      setTotalRecords(response.data.meta?.total || 0);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteProduct) return;
    try {
      await api.delete(`/products/delete-product/${deleteProduct._id}`);
      setDeleteProduct(null);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast.error(error.response?.data?.message || 'Failed to delete product');
    }
  };

  const getStatusBadge = (status: string) => {
    switch((status || 'ACTIVE').toUpperCase()) {
      case 'ACTIVE': return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200 capitalize">Active</span>;
      case 'DRAFT': return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200 capitalize">Draft</span>;
      case 'OUT_OF_STOCK': return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200 capitalize">Out of Stock</span>;
      default: return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200 capitalize">{status || 'ACTIVE'}</span>;
    }
  };

  return (
    <div className="w-full h-full font-sans flex flex-col">
      <div className="bg-white border-t border-gray-200 flex-1 flex flex-col min-h-0">
        {/* Filters Bar */}
        <div className="p-4 border-b border-gray-200 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-[#fcfcfc] shrink-0">
          <div className="relative w-full lg:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search products by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchProducts()}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#5022C3] focus:ring-1 focus:ring-[#5022C3] w-full bg-white transition-all"
            />
          </div>
          <div className="flex items-center gap-3">
            <select 
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                setPage(1); // Reset page on filter change
              }}
              className="border border-gray-300 rounded-lg text-sm px-3 py-2.5 focus:outline-none focus:border-[#5022C3] bg-white text-gray-600 font-medium hidden sm:block">
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
            <select 
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [by, order] = e.target.value.split('-');
                setSortBy(by === 'default' ? '' : by);
                setSortOrder(order === 'default' ? '' : order);
                setPage(1); // Reset page on sort change
              }}
              className="border border-gray-300 rounded-lg text-sm px-3 py-2.5 focus:outline-none focus:border-[#5022C3] bg-white text-gray-600 font-medium hidden sm:block">
              <option value="default-default">Sort by: Newest</option>
              <option value="createdAt-asc">Oldest</option>
              <option value="discountedPrice-asc">Price: Low to High</option>
              <option value="discountedPrice-desc">Price: High to Low</option>
              <option value="salesCount-desc">Best Selling</option>
            </select>
            <Link href="/dashboard/products/new" className="bg-[#5022C3] hover:bg-[#401a9c] text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 shadow-sm whitespace-nowrap ml-auto">
              <Plus className="w-5 h-5" /> Add Product
            </Link>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1 custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider border-b border-gray-200">
                <th className="px-6 py-4 font-bold">Product</th>
                <th className="px-6 py-4 font-bold">Category</th>
                <th className="px-6 py-4 font-bold">Sales & Stock</th>
                <th className="px-6 py-4 font-bold">Price</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-20 text-gray-500">
                    <div className="w-8 h-8 border-4 border-purple-200 border-t-[#5022C3] rounded-full animate-spin mx-auto mb-4"></div>
                    Loading products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-20">
                    <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center text-[#5022C3] mb-4 mx-auto">
                      <Package className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No products found</h3>
                    <p className="text-gray-500 text-sm mb-4">You haven't added any products or none match your search.</p>
                    {!search && (
                      <Link href="/dashboard/products/new" className="text-[#5022C3] font-bold text-sm hover:underline">Add your first product</Link>
                    )}
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg border border-gray-200 bg-white p-1 shrink-0 overflow-hidden">
                          <img src={product.images?.[0]?.secure_url || '/placeholder.png'} alt={product.title} className="w-full h-full object-cover mix-blend-multiply" />
                        </div>
                        <div className="font-bold text-gray-900 text-sm line-clamp-2">{product.title}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-700 bg-gray-100 px-2.5 py-1 rounded-md">
                        {product.categoryId?.name || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-900">{product.salesCount || 0} Sold</div>
                      <div className={`text-xs mt-0.5 font-medium ${(product.stock || 0) > 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {(product.stock || 0) > 0 ? `${product.stock} in stock` : 'Out of stock'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900 text-sm">৳{product.discountedPrice?.toFixed(2)}</div>
                      {product.originalPrice > product.discountedPrice && (
                        <div className="text-xs text-gray-400 line-through mt-0.5">৳{product.originalPrice?.toFixed(2)}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(product.status || 'ACTIVE')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Link 
                          href={`/dashboard/products/${product._id}/edit`}
                          className="w-8 h-8 flex items-center justify-center bg-[#fff4ed] text-[#f97316] hover:bg-orange-100 rounded-xl transition-colors tooltip"
                          title="Edit Product"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => setDeleteProduct(product)}
                          className="w-8 h-8 flex items-center justify-center bg-[#fef2f2] text-[#ef4444] hover:bg-red-100 rounded-xl transition-colors tooltip"
                          title="Delete Product"
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
        {!loading && products.length > 0 && (
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

      {/* Delete Product Modal */}
      {deleteProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl text-center">
            <div className="p-8">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5">
                <Trash2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Delete Product?</h2>
              <p className="text-sm text-gray-500">
                Are you sure you want to delete <span className="font-bold text-gray-700">{deleteProduct.title}</span>? This action cannot be undone.
              </p>
            </div>
            <div className="p-5 border-t border-gray-100 bg-gray-50 flex gap-3">
              <button 
                onClick={() => setDeleteProduct(null)}
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

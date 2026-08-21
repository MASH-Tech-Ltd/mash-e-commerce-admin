'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, ListTree, ChevronLeft, ChevronRight, X } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/utils/api';
import toast from 'react-hot-toast';

interface Category {
  _id: string;
  name: string;
  image: {
    secure_url: string;
  };
  createdAt: string;
  status?: string;
  productCount?: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Filters
  const [search, setSearch] = useState('');

  // Modals
  const [deleteCategory, setDeleteCategory] = useState<Category | null>(null);

  useEffect(() => {
    fetchCategories();
  }, [page, search]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await api.get('/categories/get-all-category', {
        params: { page, limit, search }
      });
      setCategories(response.data.data || []);
      setTotalPages(response.data.meta?.totalPages || 1);
      setTotalRecords(response.data.meta?.total || 0);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteCategory) return;
    try {
      // Assuming a delete endpoint exists. If not, this might need adjustment.
      await api.delete(`/categories/delete-category/${deleteCategory._id}`);
      setDeleteCategory(null);
      toast.success('Category deleted successfully');
      fetchCategories();
    } catch (error: any) {
      console.error('Error deleting category:', error);
      toast.error(error.response?.data?.message || 'Failed to delete category');
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
              placeholder="Search categories by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchCategories()}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#5022C3] focus:ring-1 focus:ring-[#5022C3] w-full bg-white transition-all"
            />
          </div>
          <div className="flex items-center gap-3">
            <select className="border border-gray-300 rounded-lg text-sm px-3 py-2.5 focus:outline-none focus:border-[#5022C3] bg-white text-gray-600 font-medium hidden sm:block">
              <option>Sort by: Newest</option>
            </select>
            <Link href="/dashboard/categories/new" className="bg-[#5022C3] hover:bg-[#401a9c] text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 shadow-sm whitespace-nowrap">
              <Plus className="w-5 h-5" /> Add Category
            </Link>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1 custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider border-b border-gray-200">
                <th className="px-6 py-4 font-bold w-20">Image</th>
                <th className="px-6 py-4 font-bold">Category Name</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold">Total Products</th>
                <th className="px-6 py-4 font-bold">Created At</th>
                <th className="px-6 py-4 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-20 text-gray-500">
                    <div className="w-8 h-8 border-4 border-purple-200 border-t-[#5022C3] rounded-full animate-spin mx-auto mb-4"></div>
                    Loading categories...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-20">
                    <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center text-[#5022C3] mb-4 mx-auto">
                      <ListTree className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No categories found</h3>
                    <p className="text-gray-500 text-sm mb-4">You haven't created any categories or none match your search.</p>
                    {!search && (
                      <Link href="/dashboard/categories/new" className="text-[#5022C3] font-bold text-sm hover:underline">Create your first category</Link>
                    )}
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category._id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      {category.image?.secure_url ? (
                        <div className="w-12 h-12 rounded-lg border border-gray-200 bg-white p-1 overflow-hidden">
                           <img src={category.image.secure_url} alt={category.name} className="w-full h-full object-cover rounded mix-blend-multiply" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400">
                          <ListTree className="w-6 h-6" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900 text-sm">{category.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        (!category.status || category.status === 'ACTIVE')
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {(!category.status || category.status === 'ACTIVE') ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-600">{category.productCount || 0} Products</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{new Date(category.createdAt).toLocaleDateString('en-GB')}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Link 
                          href={`/dashboard/categories/${category._id}/edit`}
                          className="w-8 h-8 flex items-center justify-center bg-[#fff4ed] text-[#f97316] hover:bg-orange-100 rounded-xl transition-colors tooltip"
                          title="Edit Category"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => setDeleteCategory(category)}
                          className="w-8 h-8 flex items-center justify-center bg-[#fef2f2] text-[#ef4444] hover:bg-red-100 rounded-xl transition-colors tooltip"
                          title="Delete Category"
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
        {!loading && categories.length > 0 && (
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

      {/* Delete Category Modal */}
      {deleteCategory && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl text-center">
            <div className="p-8">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5">
                <Trash2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Delete Category?</h2>
              <p className="text-sm text-gray-500">
                Are you sure you want to delete <span className="font-bold text-gray-700">{deleteCategory.name}</span>? This action cannot be undone.
              </p>
            </div>
            <div className="p-5 border-t border-gray-100 bg-gray-50 flex gap-3">
              <button 
                onClick={() => setDeleteCategory(null)}
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

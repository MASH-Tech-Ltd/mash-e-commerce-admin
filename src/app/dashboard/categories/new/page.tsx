'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, X, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/utils/api';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { ImageUpload } from '@/components/ui/ImageUpload';

export default function AddCategoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'ACTIVE',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (file: File | null) => {
    setImageFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) data.append(key, value as string);
      });
      
      if (imageFile) {
        data.append('image', imageFile);
      }

      await api.post('/categories/create-category', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Category created successfully!');
      router.push('/dashboard/categories');
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to create category';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="h-full flex flex-col">
      {/* Top Action Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/categories" className="text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Add Category</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href="/dashboard/categories"
            className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
          >
            <X className="w-4 h-4" /> Discard
          </Link>
          <button 
            type="submit" 
            disabled={loading}
            className="px-5 py-2 text-sm font-medium text-white bg-[#5022C3] hover:bg-purple-700 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-70"
          >
            <Save className="w-4 h-4" /> {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="w-full max-w-[1200px] mx-auto flex flex-col gap-6">
          
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm">
              {error}
            </div>
          )}

          <Card title="General Information">
            <div className="space-y-6">
              <Input 
                label="Category Name" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="E.g. Smartphones, Laptops"
                required
              />
              
              <Textarea 
                label="Description" 
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Write a short description..."
              />
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="Category Image">
              <ImageUpload 
                previewUrl={previewUrl}
                onChange={handleImageChange}
              />
            </Card>

            <Card title="Settings">
              <Select 
                label="Category Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                options={[
                  { label: 'ACTIVE', value: 'ACTIVE' },
                  { label: 'DRAFT', value: 'DRAFT' },
                ]}
              />
            </Card>
          </div>

        </div>
      </div>
    </form>
  );
}

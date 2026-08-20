'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, X, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { MultipleImageUpload } from '@/components/ui/MultipleImageUpload';
import { api } from '@/utils/api';

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Form State
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [specifications, setSpecifications] = useState<{group: string, entries: {name: string, value: string}[]}[]>([]);
  const [features, setFeatures] = useState<string[]>(['']);
  const [videos, setVideos] = useState<string[]>(['']);
  const [variants, setVariants] = useState<{variantName: string, originalPrice: string, discountedPrice: string, stock: string, sku: string}[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    description: '',
    originalPrice: '',
    discountedPrice: '',
    saveAmount: '',
    categoryId: '',
    brand: '',
    weight: '',
    length: '',
    width: '',
    height: '',
    condition: 'New',
    status: 'ACTIVE',
    sku: '',
    unit: '',
    stock: '',
    isAuthentic: false,
    productType: 'SINGLE'
  });

  useEffect(() => {
    setIsClient(true);
    fetchCategories();
    // Load from local storage
    const saved = localStorage.getItem('draftProduct');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.formData) setFormData(parsed.formData);
        if (parsed.specifications) setSpecifications(parsed.specifications);
        if (parsed.features) setFeatures(parsed.features);
        if (parsed.videos) setVideos(parsed.videos);
        if (parsed.variants) setVariants(parsed.variants);
      } catch (e) {
        console.error('Failed to parse draft product', e);
      }
    }
    
    // Cleanup draft on unmount if navigating back via browser
    return () => {
       // We only clear if it's not a successful save, but React 18 strict mode runs this twice.
       // So we rely on a manual clear button instead of unmount, or explicitly clear on Cancel.
    };
  }, []);

  // Save to local storage on change
  useEffect(() => {
    if (isClient) {
      const draft = { formData, specifications, features, videos, variants };
      localStorage.setItem('draftProduct', JSON.stringify(draft));
    }
  }, [formData, specifications, features, videos, variants, isClient]);

  const handleDiscard = () => {
    localStorage.removeItem('draftProduct');
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories/get-all-category?limit=1000');
      setCategories(response.data.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (files: File[], urls: string[]) => {
    setImageFiles(files);
    setPreviewUrls(urls);
  };

  const addSpecGroup = () => {
    setSpecifications([...specifications, { group: '', entries: [{ name: '', value: '' }] }]);
  };

  const addSpecEntry = (groupIndex: number) => {
    const newSpecs = [...specifications];
    newSpecs[groupIndex].entries.push({ name: '', value: '' });
    setSpecifications(newSpecs);
  };

  const updateSpecGroup = (index: number, value: string) => {
    const newSpecs = [...specifications];
    newSpecs[index].group = value;
    setSpecifications(newSpecs);
  };

  const updateSpecEntry = (groupIndex: number, entryIndex: number, field: 'name' | 'value', value: string) => {
    const newSpecs = [...specifications];
    newSpecs[groupIndex].entries[entryIndex][field] = value;
    setSpecifications(newSpecs);
  };

  const removeSpecGroup = (index: number) => {
    const newSpecs = [...specifications];
    newSpecs.splice(index, 1);
    setSpecifications(newSpecs);
  };

  const removeSpecEntry = (groupIndex: number, entryIndex: number) => {
    const newSpecs = [...specifications];
    newSpecs[groupIndex].entries.splice(entryIndex, 1);
    setSpecifications(newSpecs);
  };

  const calculateSaveAmount = () => {
    const original = parseFloat(formData.originalPrice);
    const discounted = parseFloat(formData.discountedPrice);
    if (!isNaN(original) && !isNaN(discounted) && original > discounted) {
      return (original - discounted).toFixed(2);
    }
    return '0';
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
  };

  const addFeature = () => {
    setFeatures([...features, '']);
  };

  const removeFeature = (index: number) => {
    const newFeatures = [...features];
    newFeatures.splice(index, 1);
    setFeatures(newFeatures);
  };

  const handleVideoChange = (index: number, value: string) => {
    const newVideos = [...videos];
    newVideos[index] = value;
    setVideos(newVideos);
  };

  const addVideo = () => {
    if (videos.length < 2) {
      setVideos([...videos, '']);
    }
  };

  const removeVideo = (index: number) => {
    const newVideos = [...videos];
    newVideos.splice(index, 1);
    setVideos(newVideos);
  };

  const addVariant = () => {
    setVariants([...variants, { variantName: '', originalPrice: '', discountedPrice: '', stock: '', sku: '' }]);
  };
  const updateVariant = (index: number, field: string, value: string) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value as any };
    setVariants(newVariants);
  };
  const removeVariant = (index: number) => {
    const newVariants = [...variants];
    newVariants.splice(index, 1);
    setVariants(newVariants);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Check Limits First
      try {
        await api.get('/products/check-limit');
      } catch (limitErr: any) {
        if (limitErr.response?.data?.message === 'PRODUCT_LIMIT_REACHED') {
          setShowUpgradeModal(true);
          return; // Stop here, don't upload images
        }
        throw limitErr;
      }

      if (imageFiles.length === 0) {
        throw new Error('At least one product image is required');
      }

      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (['length', 'width', 'height', 'saveAmount'].includes(key)) return; // Handled below
        if (value) data.append(key, value as string);
      });

      // Dimensions Object
      const dimensions = {
        length: parseFloat(formData.length || '0'),
        width: parseFloat(formData.width || '0'),
        height: parseFloat(formData.height || '0')
      };
      data.append('dimensions', JSON.stringify(dimensions));
      
      // Specifications
      if (specifications.length > 0) {
        data.append('specifications', JSON.stringify(specifications));
      }
      
      // Features
      const filteredFeatures = features.filter(f => f.trim() !== '');
      if (filteredFeatures.length > 0) {
        data.append('features', JSON.stringify(filteredFeatures));
      } else {
        data.append('features', '[]');
      }

      // Videos
      const filteredVideos = videos.filter(v => v.trim() !== '');
      if (filteredVideos.length > 0) {
        data.append('videos', JSON.stringify(filteredVideos));
      } else {
        data.append('videos', '[]');
      }

      // Save amount calculation (only valid for single)
      data.append('saveAmount', calculateSaveAmount());
      
      if (formData.productType === 'VARIANT' && variants.length > 0) {
        // Prepare variants with numbers instead of strings for prices/stock
        const formattedVariants = variants.map(v => ({
          ...v,
          originalPrice: parseFloat(v.originalPrice || '0'),
          discountedPrice: parseFloat(v.discountedPrice || '0'),
          stock: parseInt(v.stock || '0')
        }));
        data.append('variants', JSON.stringify(formattedVariants));
      }
      
      imageFiles.forEach(file => {
        data.append('images', file);
      });

      await api.post('/products/create-product', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Product created successfully!');
      localStorage.removeItem('draftProduct');
      router.push('/dashboard/products');
    } catch (err: any) {
      if (err.response?.data?.message === 'PRODUCT_LIMIT_REACHED') {
        setShowUpgradeModal(true);
        return;
      }
      const errMsg = err.response?.data?.message || err.message || 'Failed to create product';
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
          <Link href="/dashboard/products" onClick={handleDiscard} className="text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Add Product</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href="/dashboard/products"
            onClick={handleDiscard}
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
        <div className="w-full max-w-[1800px] mx-auto flex flex-col xl:flex-row gap-6">
          
          {/* Main Content Column */}
          <div className="flex-1 flex flex-col gap-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm">
                {error}
              </div>
            )}

            <Card title="General Information">
              <div className="space-y-6">
                <Input 
                  label="Item Name" 
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="E.g. Sony WH-1000XM5 Headphones"
                  required
                />
                
                <Textarea 
                  label="Short Description" 
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleChange}
                  placeholder="Brief summary of the product..."
                  rows={2}
                />
                
                <Textarea 
                  label="Product Description" 
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Write something..."
                />
              </div>
            </Card>

            <Card title="External Videos (Max 2)">
              <div className="space-y-3">
                {videos.map((video, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Input 
                      placeholder="E.g. https://www.youtube.com/watch?v=..."
                      value={video}
                      onChange={(e) => handleVideoChange(index, e.target.value)}
                    />
                    <button 
                      type="button" 
                      onClick={() => removeVideo(index)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {videos.length < 2 && (
                  <button 
                    type="button"
                    onClick={addVideo}
                    className="text-sm font-medium text-[#5022C3] flex items-center gap-1 mt-2 hover:underline"
                  >
                    <Plus className="w-3 h-3" /> Add Video URL
                  </button>
                )}
              </div>
            </Card>

            <Card title="Quick Overview (Features)">
              <div className="space-y-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Input 
                      placeholder="E.g. Experience the new standard with..."
                      value={feature}
                      onChange={(e) => handleFeatureChange(index, e.target.value)}
                    />
                    <button 
                      type="button" 
                      onClick={() => removeFeature(index)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button 
                  type="button"
                  onClick={addFeature}
                  className="text-sm font-medium text-[#5022C3] flex items-center gap-1 mt-2 hover:underline"
                >
                  <Plus className="w-3 h-3" /> Add Feature
                </button>
              </div>
            </Card>

            <Card title="Media">
              <MultipleImageUpload 
                files={imageFiles}
                previewUrls={previewUrls}
                onChange={handleImageChange}
                maxFiles={5}
              />
            </Card>

            {formData.productType === 'SINGLE' ? (
              <Card title="Pricing">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input 
                    label="Sell/Current Price" 
                    name="discountedPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.discountedPrice}
                    onChange={handleChange}
                    placeholder="E.g. 299.99"
                    required
                  />
                  <Input 
                    label="Regular/Old Price" 
                    name="originalPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.originalPrice}
                    onChange={handleChange}
                    placeholder="E.g. 399.99"
                    required
                  />
                </div>
              </Card>
            ) : (
              <Card title="Product Variants">
                <div className="space-y-6">
                  {variants.map((variant, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-semibold text-gray-900">Variant {index + 1}</h4>
                        <button 
                          type="button"
                          onClick={() => removeVariant(index)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input 
                          label="Variant Name" 
                          placeholder="e.g. Space Gray / 128GB"
                          value={variant.variantName}
                          onChange={(e) => updateVariant(index, 'variantName', e.target.value)}
                          required
                        />
                        <Input 
                          label="SKU" 
                          placeholder="Variant SKU"
                          value={variant.sku}
                          onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                        />
                        <Input 
                          label="Sell Price" 
                          type="number"
                          step="0.01"
                          min="0"
                          value={variant.discountedPrice}
                          onChange={(e) => updateVariant(index, 'discountedPrice', e.target.value)}
                          required
                        />
                        <Input 
                          label="Original Price" 
                          type="number"
                          step="0.01"
                          min="0"
                          value={variant.originalPrice}
                          onChange={(e) => updateVariant(index, 'originalPrice', e.target.value)}
                          required
                        />
                        <Input 
                          label="Stock Quantity" 
                          type="number"
                          min="0"
                          value={variant.stock}
                          onChange={(e) => updateVariant(index, 'stock', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  ))}
                  <button 
                    type="button"
                    onClick={addVariant}
                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-medium hover:bg-gray-50 hover:border-gray-400 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Add Variant
                  </button>
                </div>
              </Card>
            )}

            <Card title="Specifications">
              <div className="space-y-6">
                {specifications.map((spec, groupIndex) => (
                  <div key={groupIndex} className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                      <Input 
                        placeholder="Group Name (e.g. General, Technical Info)"
                        value={spec.group}
                        onChange={(e) => updateSpecGroup(groupIndex, e.target.value)}
                      />
                      <button 
                        type="button" 
                        onClick={() => removeSpecGroup(groupIndex)}
                        className="p-2.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="space-y-3 pl-4 border-l-2 border-gray-200 ml-2">
                      {spec.entries.map((entry, entryIndex) => (
                        <div key={entryIndex} className="flex items-center gap-3">
                          <Input 
                            placeholder="Name (e.g. Brand)"
                            value={entry.name}
                            onChange={(e) => updateSpecEntry(groupIndex, entryIndex, 'name', e.target.value)}
                          />
                          <Input 
                            placeholder="Value (e.g. EcoFlow)"
                            value={entry.value}
                            onChange={(e) => updateSpecEntry(groupIndex, entryIndex, 'value', e.target.value)}
                          />
                          <button 
                            type="button" 
                            onClick={() => removeSpecEntry(groupIndex, entryIndex)}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button 
                        type="button"
                        onClick={() => addSpecEntry(groupIndex)}
                        className="text-sm font-medium text-[#5022C3] flex items-center gap-1 mt-2 hover:underline"
                      >
                        <Plus className="w-3 h-3" /> Add Spec Entry
                      </button>
                    </div>
                  </div>
                ))}
                <button 
                  type="button"
                  onClick={addSpecGroup}
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-medium hover:bg-gray-50 hover:border-gray-400 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Specification Group
                </button>
              </div>
            </Card>

            <Card title="Inventory">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input 
                  label="Product Serial / SKU" 
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  placeholder="E.g. PROD-001"
                />
                <Input 
                  label="Unit Name" 
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  placeholder="E.g. kg, ml, l, pc"
                />
                {formData.productType === 'SINGLE' && (
                  <Input 
                    label="Stock Quantity" 
                    name="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={handleChange}
                    placeholder="E.g. 100"
                  />
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar Column */}
          <div className="w-full lg:w-[380px] flex flex-col gap-6">
            
            <Card title="Category">
              {categories.length === 0 ? (
                <div className="text-sm text-gray-500 mb-4 bg-gray-50 p-4 rounded-lg border border-dashed border-gray-200 text-center">
                  No categories found. Create one first!
                </div>
              ) : (
                <Select 
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  required
                  options={categories.map(c => ({ label: c.name, value: c._id }))}
                />
              )}
              <Link 
                href="/dashboard/categories/new"
                className="w-full mt-4 block text-center px-4 py-2.5 text-sm font-medium text-white bg-[#5022C3] hover:bg-purple-700 rounded-lg transition-colors"
              >
                Add Category
              </Link>
            </Card>

            <Card title="Product Type">
              <Select 
                name="productType"
                value={formData.productType}
                onChange={handleChange}
                options={[
                  { label: 'Single Product', value: 'SINGLE' },
                  { label: 'Variant Product', value: 'VARIANT' },
                ]}
              />
            </Card>

            <Card title="Brand (SEO & Data Feed)">
              <Input 
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                placeholder="Brand Name"
              />
            </Card>

            <Card title="Product Weight & Dimensions">
              <div className="space-y-6">
                <Input 
                  label="Weight (kg)" 
                  name="weight"
                  type="number"
                  step="0.01"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="e.g. 1.5"
                />
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Dimensions (cm)</label>
                  <div className="grid grid-cols-3 gap-3">
                    <Input name="length" type="number" placeholder="L" value={formData.length} onChange={handleChange} />
                    <Input name="width" type="number" placeholder="W" value={formData.width} onChange={handleChange} />
                    <Input name="height" type="number" placeholder="H" value={formData.height} onChange={handleChange} />
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Condition (SEO & Data Feed)">
              <Select 
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                options={[
                  { label: 'New', value: 'New' },
                  { label: 'Refurbished', value: 'Refurbished' },
                  { label: 'Used', value: 'Used' },
                ]}
              />
            </Card>
            <Card title="Product Status">
              <Select 
                name="status"
                value={formData.status}
                onChange={handleChange}
                options={[
                  { label: 'ACTIVE', value: 'ACTIVE' },
                  { label: 'DRAFT', value: 'DRAFT' },
                  { label: 'ARCHIVED', value: 'ARCHIVED' },
                ]}
              />
            </Card>

            <Card title="Authentication">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  name="isAuthentic"
                  checked={formData.isAuthentic}
                  onChange={handleChange}
                  className="w-5 h-5 text-[#5022C3] rounded focus:ring-[#5022C3]"
                />
                <div>
                  <span className="font-semibold text-gray-900 block">100% Authentic Product</span>
                  <span className="text-xs text-gray-500">Shows an authenticity guarantee badge on the product page</span>
                </div>
              </label>
            </Card>

          </div>
        </div>
      </div>

      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl relative animate-in zoom-in-95 duration-200">
            <button 
              type="button"
              onClick={() => setShowUpgradeModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-600 font-bold text-xl">!</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Product Limit Reached</h3>
              <p className="text-gray-500 mb-6 text-sm">
                You have reached the maximum number of products allowed on your current plan. Please upgrade your plan to continue growing your store.
              </p>
              <div className="flex gap-3 w-full">
                <button 
                  type="button"
                  onClick={() => setShowUpgradeModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <Link 
                  href="/dashboard/subscription"
                  className="flex-1 px-4 py-2.5 bg-[#5022C3] hover:bg-purple-700 text-white font-medium rounded-xl transition-colors text-center"
                >
                  Upgrade Plan
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}

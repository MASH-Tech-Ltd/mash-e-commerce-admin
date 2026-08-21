'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Save, LogOut, Store, Shield, Phone, Mail, 
  MapPin, Package, Building2, User, ImagePlus, Upload, Image as ImageIcon
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { api } from '@/utils/api';
import { toast } from 'react-hot-toast';

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const getCachedUser = () => {
    if (typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem('merchantUser');
        if (stored) return JSON.parse(stored);
      } catch (e) {}
    }
    return null;
  };

  const cachedUser = getCachedUser();
  let extraDetails: any = {};
  if (cachedUser?.details && cachedUser.details.startsWith('{')) {
    try {
      extraDetails = JSON.parse(cachedUser.details);
    } catch(e) {}
  }

  const [merchantUser, setMerchantUser] = useState<any>(cachedUser);
  const [previewUrl, setPreviewUrl] = useState<string | null>(cachedUser?.avatar?.secure_url || null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [storeLogo, setStoreLogo] = useState<File | null>(null);
  const [storeLogoPreview, setStoreLogoPreview] = useState<string | null>(null);
  const [checkoutNote, setCheckoutNote] = useState<string>(extraDetails.checkoutNote || '');
  const storeLogoInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: cachedUser?.name || '',
    email: cachedUser?.email || '',
    phone: cachedUser?.phone || '',
    address: cachedUser?.address || '',
    details: cachedUser?.details && !cachedUser.details.startsWith('{') ? cachedUser.details : extraDetails.details || '',
    storeName: extraDetails.storeName || cachedUser?.name || '',
    taxId: extraDetails.taxId || '',
    supportEmail: extraDetails.supportEmail || cachedUser?.email || '',
    supportPhone: extraDetails.supportPhone || cachedUser?.phone || '',
    warrantyPeriod: extraDetails.warrantyPeriod || '1 Year',
    returnPolicy: extraDetails.returnPolicy || '14 Days',
  });

  useEffect(() => {
    const fetchFreshProfile = async () => {
      try {
        const res = await api.get('/users/me');
        if (res.data?.data) {
          const user = res.data.data;
          sessionStorage.setItem('merchantUser', JSON.stringify(user));
          setMerchantUser(user);
          let extra = {};
          if (user.details && user.details.startsWith('{')) {
            try { extra = JSON.parse(user.details); } catch(e) {}
          }
          setFormData({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            address: user.address || '',
            details: user.details && !user.details.startsWith('{') ? user.details : (extra as any).details || '',
            storeName: (extra as any).storeName || user.name || '',
            taxId: (extra as any).taxId || '',
            supportEmail: (extra as any).supportEmail || user.email || '',
            supportPhone: (extra as any).supportPhone || user.phone || '',
            warrantyPeriod: (extra as any).warrantyPeriod || '1 Year',
            returnPolicy: (extra as any).returnPolicy || '14 Days',
          });
          setCheckoutNote((extra as any).checkoutNote || '');
          if (user.avatar?.secure_url && !imageFile) {
            setPreviewUrl(user.avatar.secure_url);
          }
        }
      } catch (e) {}
    };
    fetchFreshProfile();
  }, []);

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

  const handleStoreLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setStoreLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setStoreLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      
      const detailsJson = JSON.stringify({
        details: formData.details,
        storeName: formData.storeName,
        taxId: formData.taxId,
        supportEmail: formData.supportEmail,
        supportPhone: formData.supportPhone,
        warrantyPeriod: formData.warrantyPeriod,
        returnPolicy: formData.returnPolicy,
        checkoutNote: checkoutNote,
      });

      data.append('name', formData.name);
      data.append('email', formData.email);
      data.append('phone', formData.phone);
      data.append('address', formData.address);
      data.append('details', detailsJson);
      
      if (imageFile) {
        data.append('avatar', imageFile);
      } else if (previewUrl === null) {
        data.append('removeAvatar', 'true');
      }

      const userResponse = await api.put('/users/me', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (userResponse.data?.data) {
        sessionStorage.setItem('merchantUser', JSON.stringify(userResponse.data.data));
        setMerchantUser(userResponse.data.data);
      }

      toast.success('Profile and Store Settings updated successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutAll = async () => {
    if (confirm('Are you sure you want to logout from all devices? You will be logged out of this session as well.')) {
      try {
        await api.post('/auth/logout-all');
      } catch (err) {
        console.error('Logout all failed', err);
      } finally {
        sessionStorage.removeItem('merchantToken');
        sessionStorage.removeItem('merchantUser');
        router.push('/login');
      }
    }
  };

  return (
    <div className="p-6 w-full max-w-[1800px] mx-auto min-h-screen" suppressHydrationWarning>
      
      {/* Header Section */}
      <div className="relative mb-10 overflow-hidden rounded-2xl bg-gradient-to-r from-[#1E1B4B] via-[#312E81] to-[#1E1B4B] shadow-xl">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="relative z-10 px-8 py-12 flex flex-col md:flex-row items-center md:items-end justify-between gap-6 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-32 h-32 rounded-2xl bg-white/10 p-2 backdrop-blur-md border border-white/20 shadow-2xl flex-shrink-0 group relative overflow-hidden">
              {previewUrl ? (
                <img src={previewUrl} alt="Store Avatar" className="w-full h-full rounded-xl object-cover bg-white" />
              ) : (
                <div className="w-full h-full rounded-xl bg-white/20 flex items-center justify-center border-2 border-dashed border-white/40">
                  <Store className="w-10 h-10 text-white/70" />
                </div>
              )}
              <label className="absolute inset-0 m-2 rounded-xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer z-10">
                <ImagePlus className="w-6 h-6 text-white mb-1" />
                <span className="text-[10px] text-white font-medium">Change</span>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleImageChange(e.target.files[0]);
                    }
                  }} 
                />
              </label>
            </div>
            <div className="text-white text-center md:text-left">
              <h1 className="text-4xl font-extrabold tracking-tight">{formData.storeName || 'Your Store'}</h1>
              <p className="text-indigo-200 mt-2 flex items-center justify-center md:justify-start gap-2 text-sm font-medium">
                <Store className="w-4 h-4" /> MashEasy Merchant Dashboard
              </p>
            </div>
          </div>
          
          <button 
            type="button"
            onClick={handleLogoutAll}
            className="group bg-white/10 hover:bg-red-500/20 text-white hover:text-red-200 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 border border-white/20 hover:border-red-500/50 backdrop-blur-md"
          >
            <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" /> Sign Out All Devices
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50/80 backdrop-blur-md text-red-600 p-4 rounded-xl border border-red-200 shadow-sm text-sm mb-8 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-2 font-medium"><Shield className="w-5 h-5"/> {error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-8 pb-12">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Column 1: Personal & Store Identity */}
          <div className="xl:col-span-2 space-y-8">
            <Card className="border-0 shadow-lg shadow-gray-200/50 rounded-2xl overflow-hidden bg-white/80 backdrop-blur-xl">
              <div className="border-b border-gray-100 bg-gray-50/50 p-6 flex items-center gap-3">
                <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Personal Information</h2>
                  <p className="text-xs text-gray-500 font-medium">Your personal contact details</p>
                </div>
              </div>
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Input 
                    label="Full Name" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="E.g. John Doe"
                    required
                  />
                  <Input 
                    label="Personal Phone" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Your contact number"
                  />
                </div>
                <Input 
                  label="Email Address" 
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="E.g. your@email.com"
                  required
                />
              </div>
            </Card>

            <Card className="border-0 shadow-lg shadow-gray-200/50 rounded-2xl overflow-hidden bg-white/80 backdrop-blur-xl">
              <div className="border-b border-gray-100 bg-gray-50/50 p-6 flex items-center gap-3">
                <div className="p-2.5 bg-purple-100 text-purple-600 rounded-xl">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Store Identity</h2>
                  <p className="text-xs text-gray-500 font-medium">Public details for your MashEasy shop</p>
                </div>
              </div>
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Input 
                    label="Store Name" 
                    name="storeName"
                    value={formData.storeName}
                    onChange={handleChange}
                    placeholder="E.g. TechHaven MashEasy"
                  />
                  <Input 
                    label="Tax / Registration ID" 
                    name="taxId"
                    value={formData.taxId}
                    onChange={handleChange}
                    placeholder="VAT or Business ID"
                  />
                </div>
                <Input 
                  label="Business Address" 
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Complete business address"
                />
                <Textarea 
                  label="About the Store" 
                  name="details"
                  value={formData.details}
                  onChange={handleChange}
                  placeholder="Tell customers about your MashEasy specialties..."
                  rows={4}
                />
                
                <div className="pt-2">
                  <Textarea 
                    label="Checkout Note (Optional)" 
                    name="checkoutNote"
                    value={checkoutNote}
                    onChange={(e) => setCheckoutNote(e.target.value)}
                    placeholder="E.g. Our representative will call you for confirmation."
                    rows={2}
                  />
                  <p className="text-xs text-gray-500 mt-1.5">This text will appear at the bottom of the payment options on the checkout page.</p>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <label className="block text-xs font-semibold text-gray-700 mb-3 flex items-center gap-2 uppercase tracking-wide">
                    <ImageIcon className="w-4 h-4 text-gray-400" />
                    Store Logo
                  </label>
                  
                  <div className="flex items-start gap-6">
                    <div className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 relative group flex-shrink-0">
                      {storeLogoPreview ? (
                        <img src={storeLogoPreview} alt="Store Logo" className="w-full h-full object-contain p-2" />
                      ) : (
                        <div className="text-center p-2">
                          <ImageIcon className="w-6 h-6 text-gray-300 mx-auto mb-1" />
                        </div>
                      )}
                      
                      <div 
                        className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        onClick={() => storeLogoInputRef.current?.click()}
                      >
                        <Upload className="w-5 h-5 text-white mb-1" />
                        <span className="text-[10px] text-white font-medium">Upload</span>
                      </div>
                    </div>
                    
                    <div className="flex-1 pt-1">
                      <input 
                        type="file" 
                        ref={storeLogoInputRef} 
                        onChange={handleStoreLogoChange} 
                        className="hidden" 
                        accept="image/*"
                      />
                      <button 
                        type="button"
                        onClick={() => storeLogoInputRef.current?.click()}
                        className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors"
                      >
                        Choose Image
                      </button>
                      <p className="text-[11px] text-gray-500 mt-2 leading-relaxed">
                        Recommended size: 200x50px. Max file size: 2MB. Supported formats: PNG, JPG, SVG.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Column 2: Policies & Support */}
          <div className="space-y-8">
            <Card className="border-0 shadow-lg shadow-gray-200/50 rounded-2xl overflow-hidden bg-white/80 backdrop-blur-xl h-full">
              <div className="border-b border-gray-100 bg-gray-50/50 p-6 flex items-center gap-3">
                <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Operations & Policies</h2>
                  <p className="text-xs text-gray-500 font-medium">Support info and MashEasy rules</p>
                </div>
              </div>
              <div className="p-6 space-y-8">
                
                <div className="space-y-5">
                  <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2 border-b border-gray-100 pb-2">
                    <Phone className="w-4 h-4 text-gray-400"/> Customer Support
                  </h3>
                  <Input 
                    label="Support Email" 
                    name="supportEmail"
                    value={formData.supportEmail}
                    onChange={handleChange}
                    placeholder="support@store.com"
                  />
                  <Input 
                    label="Support Phone" 
                    name="supportPhone"
                    value={formData.supportPhone}
                    onChange={handleChange}
                    placeholder="Customer service line"
                  />
                </div>

                <div className="space-y-5">
                  <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2 border-b border-gray-100 pb-2">
                    <Shield className="w-4 h-4 text-gray-400"/> MashEasy Policies
                  </h3>
                  <Select
                    label="Default Warranty"
                    name="warrantyPeriod"
                    value={formData.warrantyPeriod}
                    onChange={handleChange as any}
                    options={[
                      { value: 'None', label: 'None' },
                      { value: '3 Months', label: '3 Months' },
                      { value: '6 Months', label: '6 Months' },
                      { value: '1 Year', label: '1 Year' },
                      { value: '2 Years', label: '2 Years' },
                    ]}
                  />
                  <Select
                    label="Return Policy"
                    name="returnPolicy"
                    value={formData.returnPolicy}
                    onChange={handleChange as any}
                    options={[
                      { value: 'No Returns', label: 'No Returns' },
                      { value: '7 Days', label: '7 Days' },
                      { value: '14 Days', label: '14 Days' },
                      { value: '30 Days', label: '30 Days' },
                    ]}
                  />
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Floating Action Bar */}
        <div className="sticky bottom-6 z-20 flex justify-end">
          <div className="bg-white/90 backdrop-blur-xl p-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100/50 flex items-center gap-4">
            <p className="text-sm text-gray-500 font-medium mr-4 hidden sm:block">Update your profile to save changes</p>
            <button 
              type="submit" 
              disabled={loading}
              className="px-8 py-3 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl transition-all duration-300 flex items-center gap-2 disabled:opacity-70 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5"
            >
              <Save className="w-5 h-5" /> 
              {loading ? 'Saving Changes...' : 'Save Profile Settings'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

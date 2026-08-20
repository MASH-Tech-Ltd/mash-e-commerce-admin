'use client';

import { useState, useEffect } from 'react';
import { 
  Palette, CheckCircle2, LayoutTemplate, 
  Settings, Type, Link as LinkIcon, Save,
  Phone, Mail, MapPin, Shield, HelpCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../../utils/api';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

const availableThemes = [
  { id: 'light', name: 'Clean Light', color: '#ffffff', textColor: '#171717', accent: '#5022C3' },
  { id: 'dark', name: 'Midnight Dark', color: '#0f172a', textColor: '#f8fafc', accent: '#3b82f6' },
  { id: 'nature', name: 'Earthy Green', color: '#f0fdf4', textColor: '#14532d', accent: '#16a34a' },
  { id: 'sunset', name: 'Sunset Warm', color: '#fffbeb', textColor: '#78350f', accent: '#d97706' },
];

export default function ThemesPage() {
  const [activeTheme, setActiveTheme] = useState('light');
  const [primaryColor, setPrimaryColor] = useState('#5022C3');
  const [fontFamily, setFontFamily] = useState('Inter');
  const [language, setLanguage] = useState('en');
  const [footer, setFooter] = useState({
    socialLinks: { facebook: '', youtube: '', tiktok: '' },
    contactInfo: { email: '', phone: '', address: '' },
    policies: { aboutUs: '', privacyPolicy: '', termsAndConditions: '', returnPolicy: '' },
    copyrightText: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTheme();
  }, []);

  const fetchTheme = async () => {
    try {
      const res = await api.get('/themes/my-theme');
      const themeData = res.data.data;
      if (themeData) {
        if (themeData.themeId) setActiveTheme(themeData.themeId);
        if (themeData.primaryColor) setPrimaryColor(themeData.primaryColor);
        if (themeData.fontFamily) setFontFamily(themeData.fontFamily);
        if (themeData.language) setLanguage(themeData.language);
        if (themeData.footer) {
          setFooter({
            socialLinks: {
              facebook: themeData.footer.socialLinks?.facebook || '',
              youtube: themeData.footer.socialLinks?.youtube || '',
              tiktok: themeData.footer.socialLinks?.tiktok || '',
            },
            contactInfo: {
              email: themeData.footer.contactInfo?.email || '',
              phone: themeData.footer.contactInfo?.phone || '',
              address: themeData.footer.contactInfo?.address || '',
            },
            policies: {
              aboutUs: themeData.footer.policies?.aboutUs || '',
              privacyPolicy: themeData.footer.policies?.privacyPolicy || '',
              termsAndConditions: themeData.footer.policies?.termsAndConditions || '',
              returnPolicy: themeData.footer.policies?.returnPolicy || '',
            },
            copyrightText: themeData.footer.copyrightText || '',
          });
        }
      }
    } catch (error) {
      console.error('Error fetching theme', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTheme = async () => {
    setSaving(true);
    try {
      await api.put('/themes/update', {
        themeId: activeTheme,
        primaryColor,
        fontFamily,
        language,
        footer
      });
      toast.success('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving theme', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateFooter = (section: 'socialLinks' | 'contactInfo' | 'policies', field: string, value: string) => {
    setFooter(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 w-full max-w-[1800px] mx-auto min-h-screen">
      
      {/* Header Section */}
      <div className="relative mb-10 overflow-hidden rounded-2xl bg-gradient-to-r from-[#1E1B4B] via-[#312E81] to-[#1E1B4B] shadow-xl">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="relative z-10 px-8 py-10 flex flex-col md:flex-row items-center md:items-end justify-between gap-6 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-white/10 p-4 backdrop-blur-md border border-white/20 shadow-2xl flex items-center justify-center flex-shrink-0">
               <Palette className="w-10 h-10 text-white" />
            </div>
            <div className="text-white text-center md:text-left">
              <h1 className="text-3xl font-extrabold tracking-tight">Store Theme & Settings</h1>
              <p className="text-indigo-200 mt-2 text-sm font-medium">
                Customize the look, feel, and details of your storefront
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-8 pb-24">
        

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Advanced Customization */}
          <Card className="border-0 shadow-lg shadow-gray-200/50 rounded-2xl overflow-hidden bg-white/80 backdrop-blur-xl h-full mb-0">
            <div className="border-b border-gray-100 bg-gray-50/50 p-6 flex items-center gap-3">
              <div className="p-2.5 bg-purple-100 text-purple-600 rounded-xl">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Advanced Customization</h2>
                <p className="text-xs text-gray-500 font-medium">Fine-tune your store's appearance</p>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-50/50 p-5 rounded-xl border border-gray-100">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                    <Palette className="w-4 h-4 text-gray-500" /> Primary Accent Color
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden border-2 border-gray-200 shadow-sm cursor-pointer group">
                      <input 
                        type="color" 
                        value={primaryColor} 
                        onChange={(e) => setPrimaryColor(e.target.value)} 
                        className="absolute inset-[-10px] w-20 h-20 cursor-pointer" 
                      />
                    </div>
                    <Input 
                      value={primaryColor} 
                      onChange={(e) => setPrimaryColor(e.target.value)} 
                      className="w-32 font-mono uppercase text-center" 
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-3 font-medium">Used for primary buttons, active states, and highlights.</p>
                </div>

                <div className="bg-gray-50/50 p-5 rounded-xl border border-gray-100">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                    <Type className="w-4 h-4 text-gray-500" /> Heading Font
                  </label>
                  <Select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    options={[
                      { value: "Inter", label: "Inter (Default)" },
                      { value: "Roboto", label: "Roboto" },
                      { value: "Playfair Display", label: "Playfair Display" },
                      { value: "Montserrat", label: "Montserrat" }
                    ]}
                  />
                  <p className="text-xs text-gray-500 mt-3 font-medium">Select the font used for titles and headers.</p>
                </div>

                <div className="bg-gray-50/50 p-5 rounded-xl border border-gray-100 md:col-span-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                    <LayoutTemplate className="w-4 h-4 text-gray-500" /> Store Language
                  </label>
                  <Select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    options={[
                      { value: "en", label: "English (EN)" },
                      { value: "bn", label: "Bengali (BN)" }
                    ]}
                  />
                  <p className="text-xs text-gray-500 mt-3 font-medium">Select the default language for your storefront.</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Footer Settings */}
          <Card className="border-0 shadow-lg shadow-gray-200/50 rounded-2xl overflow-hidden bg-white/80 backdrop-blur-xl h-full mb-0">
          <div className="border-b border-gray-100 bg-gray-50/50 p-6 flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl">
              <LayoutTemplate className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Footer Settings</h2>
              <p className="text-xs text-gray-500 font-medium">Manage contact info and important links</p>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              
              {/* Contact Info */}
              <div className="space-y-6">
                <h4 className="font-bold text-gray-800 border-b border-gray-100 pb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" /> Contact Information
                </h4>
                <div className="space-y-5">
                  <Input 
                    label="Support Email"
                    type="email" 
                    value={footer.contactInfo.email} 
                    onChange={(e) => updateFooter('contactInfo', 'email', e.target.value)}
                    placeholder="support@mystore.com"
                  />
                  <Input 
                    label="Phone Number"
                    type="text" 
                    value={footer.contactInfo.phone} 
                    onChange={(e) => updateFooter('contactInfo', 'phone', e.target.value)}
                    placeholder="+1 234 567 890"
                  />
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Store Address</label>
                    <textarea 
                      value={footer.contactInfo.address} 
                      onChange={(e) => updateFooter('contactInfo', 'address', e.target.value)}
                      placeholder="123 Main St, City, Country"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 bg-gray-50/50 hover:bg-gray-50 text-gray-900 placeholder:text-gray-400 min-h-[100px] resize-none" 
                    />
                  </div>
                </div>
              </div>

              {/* Policy Links */}
              <div className="space-y-6">
                <h4 className="font-bold text-gray-800 border-b border-gray-100 pb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-gray-400" /> Policy Pages (URLs)
                </h4>
                <div className="space-y-5">
                  <Input 
                    label="About Us URL"
                    type="url" 
                    value={footer.policies.aboutUs} 
                    onChange={(e) => updateFooter('policies', 'aboutUs', e.target.value)}
                    placeholder="https://yourstore.com/about"
                  />
                  <Input 
                    label="Privacy Policy URL"
                    type="url" 
                    value={footer.policies.privacyPolicy} 
                    onChange={(e) => updateFooter('policies', 'privacyPolicy', e.target.value)}
                    placeholder="https://yourstore.com/privacy"
                  />
                  <Input 
                    label="Terms & Conditions URL"
                    type="url" 
                    value={footer.policies.termsAndConditions} 
                    onChange={(e) => updateFooter('policies', 'termsAndConditions', e.target.value)}
                    placeholder="https://yourstore.com/terms"
                  />
                  <Input 
                    label="Return Policy URL"
                    type="url" 
                    value={footer.policies.returnPolicy} 
                    onChange={(e) => updateFooter('policies', 'returnPolicy', e.target.value)}
                    placeholder="https://yourstore.com/returns"
                  />
                </div>
              </div>

              {/* Social Links & Copyright */}
              <div className="lg:col-span-2 space-y-6 pt-4">
                <h4 className="font-bold text-gray-800 border-b border-gray-100 pb-2 flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-gray-400" /> Social Links & Copyright
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <Input 
                    label="Facebook URL"
                    type="url" 
                    value={footer.socialLinks.facebook} 
                    onChange={(e) => updateFooter('socialLinks', 'facebook', e.target.value)}
                    placeholder="https://facebook.com/yourstore"
                  />
                  <Input 
                    label="YouTube URL"
                    type="url" 
                    value={footer.socialLinks.youtube} 
                    onChange={(e) => updateFooter('socialLinks', 'youtube', e.target.value)}
                    placeholder="https://youtube.com/@yourstore"
                  />
                  <Input 
                    label="TikTok URL"
                    type="url" 
                    value={footer.socialLinks.tiktok} 
                    onChange={(e) => updateFooter('socialLinks', 'tiktok', e.target.value)}
                    placeholder="https://tiktok.com/@yourstore"
                  />
                </div>
                <div className="pt-2 max-w-md">
                  <Input 
                    label="Copyright Text"
                    type="text" 
                    value={footer.copyrightText} 
                    onChange={(e) => setFooter(prev => ({ ...prev, copyrightText: e.target.value }))}
                    placeholder="© 2026 Your Store Name"
                  />
                </div>
              </div>

            </div>
          </div>
        </Card>
      </div>
    </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:right-10 z-50">
        <div className="bg-white/90 backdrop-blur-xl p-3 md:p-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100/50 flex items-center gap-4">
          <p className="text-sm text-gray-500 font-medium ml-2 hidden sm:block">Update theme to save changes</p>
          <button 
            onClick={handleSaveTheme}
            disabled={saving}
            className="px-6 md:px-8 py-3 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 w-full md:w-auto"
          >
            <Save className="w-5 h-5" /> 
            {saving ? 'Saving Changes...' : 'Save Theme Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}

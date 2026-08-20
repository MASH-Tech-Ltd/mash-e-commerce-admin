'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, ShoppingBag, Package, ListTree, Users, Truck,
  Store, BarChart2, Palette, Paintbrush, LayoutTemplate, Smartphone, 
  Star, Tag, BadgeCheck, RefreshCw, Boxes, UserCog, CreditCard,
  GraduationCap, ShieldCheck, Handshake, ChevronRight, Globe, Key, LifeBuoy
} from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { api } from '@/utils/api';
import NotificationBell from '@/components/NotificationBell';

const Badge = ({ children, type = 'NEW' }: { children: React.ReactNode, type?: 'NEW' | 'BETA' }) => (
  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ml-auto ${
    type === 'BETA' ? 'bg-purple-100 text-purple-700' : 'bg-[#5022C3] text-white'
  }`}>
    {children}
  </span>
);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [merchantUser, setMerchantUser] = useState<any>(null);



  useEffect(() => {
    const token = sessionStorage.getItem('merchantToken');
    if (!token) {
      router.push('/login');
    } else {
      try {
        const storedUser = sessionStorage.getItem('merchantUser');
        if (storedUser) {
          setMerchantUser(JSON.parse(storedUser));
        } else {
          // Fallback to decode JWT if user object is not in local storage
          const payload = token.split('.')[1];
          const decoded = atob(payload);
          setMerchantUser(JSON.parse(decoded));
        }
      } catch (e) {
        console.error('Error parsing user data', e);
      }
      setIsAuthenticated(true);
    }
  }, [router]);



  if (!isAuthenticated) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-purple-200 border-t-[#5022C3] rounded-full animate-spin"></div>
      </div>
    );
  }

  const navGroups = [
    {
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Orders', path: '/dashboard/orders', icon: ShoppingBag },
        { name: 'Products', path: '/dashboard/products', icon: Package },
        { name: 'Categories', path: '/dashboard/categories', icon: ListTree },
        { name: 'Customers', path: '/dashboard/customers', icon: Users },
        { name: 'Courier', path: '/dashboard/courier-automation', icon: Truck, badge: 'NEW' },
        { name: 'Fraud Check', path: '/dashboard/fraud-check', icon: ShieldCheck, badge: 'NEW' },
      ]
    },
    {
      title: 'Shop & Growth',
      items: [
        // { name: 'Manage Shop', path: '/dashboard/manage-shop', icon: Store, badge: 'NEW' },
        { name: 'Analytics', path: '/dashboard/analytics', icon: BarChart2 },
        { name: 'Themes', path: '/dashboard/themes', icon: Palette },

      ]
    },
    {
      title: 'Settings',
      items: [
        { name: 'Profile', path: '/dashboard/profile', icon: UserCog },
      ]
    }
  ];

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[260px] flex-shrink-0 border-r border-gray-200 bg-white flex flex-col h-full overflow-hidden">
        <div className="h-16 flex items-center px-6 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 rounded-lg overflow-hidden">
              <img src="/MEasy.png" alt="MashEasy" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-base font-bold text-gray-900 tracking-tight leading-tight">
                {process.env.NEXT_PUBLIC_PLATFORM_NAME || 'Platform'}
              </h1>
              <span className="text-xs font-medium text-gray-500">Admin Hub</span>
            </div>
          </div>
        </div>
        <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
          {navGroups.map((group, idx) => (
            <div key={idx} className={idx > 0 ? 'mt-6' : ''}>
              {group.title && (
                <div className="flex items-center px-3 mb-2">
                  <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    {group.title}
                  </h3>
                  {(group as any).titleBadge && <Badge>{(group as any).titleBadge}</Badge>}
                </div>
              )}
              <nav className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const isActive = pathname === item.path;
                  return (
                    <Link
                      key={item.name}
                      href={item.path}
                      className={`flex items-center px-3 py-2 rounded-lg text-sm transition-colors group ${
                        isActive 
                          ? 'bg-purple-50 text-[#5022C3] font-medium' 
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-[#5022C3]' : 'text-slate-400 group-hover:text-slate-600'}`} />
                      <span>{item.name}</span>
                      {(item as any).badge && <Badge type={(item as any).badge}>{(item as any).badge}</Badge>}
                      {(item as any).hasArrow && <ChevronRight className="w-4 h-4 ml-auto text-slate-300" />}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#FAFBFF]">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex flex-col justify-center">
             <h2 className="text-lg font-bold text-gray-900">
               {pathname === '/dashboard/orders' ? 'Orders Management' : 
                pathname === '/dashboard/products' ? 'Products Management' : 
                pathname === '/dashboard/categories' ? 'Categories Management' : 
                pathname === '/dashboard/customers' ? 'Customers Management' : 
                'Dashboard'}
             </h2>
             {pathname !== '/dashboard' && (
               <p className="text-xs text-gray-500">
                 {pathname === '/dashboard/orders' ? 'View and process customer orders' : 
                  pathname === '/dashboard/products' ? "Manage your store's inventory" : 
                  pathname === '/dashboard/categories' ? 'Organize your products into categories' : 
                  pathname === '/dashboard/customers' ? 'Manage your customer relationships' : 
                  pathname === '/dashboard/courier-automation' ? 'Automate courier integration and shipments' : 
                  pathname === '/dashboard/fraud-check' ? 'Monitor orders for fraud detection' : 
                  ''}
               </p>
             )}
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell userId={merchantUser?._id} />
            {merchantUser && (
              <div className="flex items-center gap-3">
                <div className="text-sm text-right hidden sm:block">
                  <div className="font-medium text-gray-900">{merchantUser.name || 'Merchant'}</div>
                  <div className="text-xs text-gray-500">{merchantUser.email}</div>
                </div>
                <div className="w-9 h-9 rounded-full bg-purple-100 text-[#5022C3] flex items-center justify-center font-bold">
                  {(merchantUser.name || merchantUser.email || 'M').charAt(0).toUpperCase()}
                </div>
              </div>
            )}
            <button 
              onClick={() => {
                sessionStorage.removeItem('merchantToken');
                sessionStorage.removeItem('merchantUser');
                router.push('/login');
              }}
              className="ml-4 p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Logout"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
      
      <Toaster position="top-right" />

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 4px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: #d1d5db;
        }
      `}</style>
    </div>
  );
}

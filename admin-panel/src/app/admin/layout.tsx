"use client";

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAdminStore } from '@/store/adminStore';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LayoutDashboard, 
  CalendarRange, 
  Users, 
  UserCheck, 
  CreditCard, 
  Headphones, 
  LineChart, 
  Settings as SettingsIcon, 
  LogOut, 
  Bell, 
  Flame, 
  Wrench,
  X
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { getStats, activeAlertMessage, clearAlert, fetchBookings } = useAdminStore();
  const { user, logout } = useAuth();
  
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const stats = getStats();

  const navigationItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Bookings', href: '/admin/bookings', icon: CalendarRange, badge: stats.pendingRequests > 0 ? stats.pendingRequests : undefined, badgeColor: stats.activeEmergencies > 0 ? 'bg-emergency animate-pulse text-white' : 'bg-warning text-background' },
    { name: 'Technicians', href: '/admin/technicians', icon: UserCheck, badge: stats.availableTechnicians, badgeColor: 'bg-success/20 text-success border border-success/35' },
    { name: 'Customers', href: '/admin/customers', icon: Users },
    { name: 'Payments', href: '/admin/payments', icon: CreditCard },
    { name: 'Support', href: '/admin/support', icon: Headphones, badge: 3, badgeColor: 'bg-secondary/20 text-secondary border border-secondary/35' },
    { name: 'Analytics', href: '/admin/analytics', icon: LineChart },
    { name: 'Settings', href: '/admin/settings', icon: SettingsIcon },
  ];

  const handleLogout = async () => {
    if (confirm('Are you sure you want to log out of the Operations Command Center?')) {
      await logout();
    }
  };

  const getPageTitle = () => {
    const matched = navigationItems.find(item => pathname.startsWith(item.href));
    return matched ? matched.name : 'Operations';
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-foreground flex font-sans overflow-hidden">
      
      {/* 1. Dynamic Top Operational Emergency Banner */}
      {activeAlertMessage && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-emergency text-white flex items-center justify-between px-6 py-3 font-black text-xs uppercase tracking-widest shadow-2xl shadow-emergency/45 border-b border-white/20 animate-bounce">
          <div className="flex items-center gap-2">
            <Flame size={16} className="animate-pulse" />
            <span>{activeAlertMessage}</span>
          </div>
          <button 
            onClick={clearAlert} 
            className="hover:bg-white/20 p-1 rounded transition-all cursor-pointer"
            title="Dismiss Alert"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* 2. Left Navigation Sidebar */}
      <aside className="w-64 bg-card border-r border-border shrink-0 flex flex-col h-screen sticky top-0 z-20">
        
        {/* Brand Header */}
        <div className="p-6 border-b border-border flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg shadow-primary/25">
            <Wrench size={20} className="text-background stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-base font-black tracking-wider text-white uppercase">Erina</span>
              <span className="text-[8px] bg-primary/20 text-primary border border-primary/30 px-1.5 py-0.2 rounded-full font-bold uppercase tracking-widest">Ops</span>
            </div>
            <span className="text-[9px] text-foreground/45 uppercase tracking-wider font-semibold block mt-0.5">Control Center</span>
          </div>
        </div>

        {/* Menu Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navigationItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${
                  isActive 
                    ? 'bg-primary/10 text-primary border border-primary/20 font-bold shadow-lg shadow-primary/5' 
                    : 'text-foreground/55 hover:text-foreground/80 hover:bg-white/3'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className={`transition-transform group-hover:scale-105 ${isActive ? 'text-primary' : 'text-foreground/40'}`} />
                  <span className="text-xs uppercase tracking-widest font-bold">{item.name}</span>
                </div>
                {item.badge !== undefined && (
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Dispatcher Profile & Logout Area */}
        <div className="p-4 border-t border-border bg-black/20 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 border border-primary/20 flex items-center justify-center font-bold text-xs text-white">
              {user?.email ? user.email.charAt(0).toUpperCase() : 'AB'}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-black text-white truncate">{user?.email || 'Abhishek B.'}</h4>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                <span className="text-[9px] text-success font-bold uppercase tracking-wider">Lead Dispatcher</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-emergency/15 text-foreground/45 hover:text-emergency border border-white/5 hover:border-emergency/25 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
          >
            <LogOut size={14} />
            <span>Logout Hub</span>
          </button>
        </div>
      </aside>

      {/* 3. Main Dashboard Workspace Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Navbar */}
        <header className="h-16 bg-card/65 backdrop-blur-md border-b border-border flex items-center justify-between px-8 z-10 shrink-0">
          
          {/* Section Title */}
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-black text-white uppercase tracking-widest">
              {getPageTitle()}
            </h2>
            <div className="h-4 w-[1px] bg-border" />
            <span className="text-[10px] text-foreground/35 font-bold uppercase tracking-wider">
              Control Panel Grid
            </span>
          </div>

          {/* Operational Indicators */}
          <div className="flex items-center gap-6">
            
            {/* Active emergencies indicators */}
            {stats.activeEmergencies > 0 && (
              <div className="flex items-center gap-1.5 bg-emergency/10 border border-emergency/30 px-3 py-1 rounded-full text-xs font-bold text-emergency animate-pulse">
                <Flame size={14} />
                <span>{stats.activeEmergencies} Active Emergencies</span>
              </div>
            )}

            {/* Pending Dispatchers */}
            <div className="flex items-center gap-1.5 text-xs text-foreground/50 font-bold bg-white/5 px-3 py-1 rounded-full border border-white/5">
              <span className="w-2 h-2 rounded-full bg-warning animate-ping" />
              <span>{stats.pendingRequests} Bookings Waiting</span>
            </div>

            {/* Notification Drawer Trigger */}
            <button className="relative p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 text-foreground/60 hover:text-white transition-all cursor-pointer">
              <Bell size={16} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
            </button>
          </div>
        </header>

        {/* Content Body Grid */}
        <main className={`flex-1 overflow-y-auto p-8 relative ${activeAlertMessage ? 'pt-16' : ''}`}>
          {children}
        </main>
      </div>

    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAdminStore } from '@/frontend/store/adminStore';
import { useAuth } from '@/frontend/contexts/AuthContext';
import { useSettingsStore } from '@/frontend/store/settingsStore';
import { useDispatchAlarm } from '@/frontend/lib/useDispatchAlarm';
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
  Package,
  X,
  Menu
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { getStats, activeAlertMessage, clearAlert, fetchBookings, bookings } = useAdminStore();
  const { user, logout } = useAuth();
  const { soundAlerts } = useSettingsStore();
  const { playAlarm } = useDispatchAlarm();

  // Track previous emergency count to detect NEW emergencies
  const prevEmergencyCountRef = useRef<number>(0);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // 🚨 Acoustic Dispatch Alarm: fires when a new emergency booking appears
  useEffect(() => {
    const currentEmergencyCount = bookings.filter(b => b.status === 'emergency').length;
    if (soundAlerts && currentEmergencyCount > prevEmergencyCountRef.current) {
      playAlarm();
    }
    prevEmergencyCountRef.current = currentEmergencyCount;
  }, [bookings, soundAlerts, playAlarm]);

  const stats = getStats();

  const navigationItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Bookings', href: '/admin/bookings', icon: CalendarRange, badge: stats.pendingRequests > 0 ? stats.pendingRequests : undefined, badgeColor: stats.activeEmergencies > 0 ? 'bg-emergency animate-pulse text-white' : 'bg-warning text-background' },
    { name: 'Technicians', href: '/admin/technicians', icon: UserCheck, badge: stats.availableTechnicians, badgeColor: 'bg-success/20 text-success border border-success/35' },
    { name: 'Customers', href: '/admin/customers', icon: Users },
    { name: 'Products', href: '/admin/products', icon: Package },
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

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0B0F19] text-foreground flex font-sans overflow-hidden relative">
      
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

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 md:hidden transition-all duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* 2. Responsive Navigation Sidebar (Drawer on Mobile / Sticky on Desktop) */}
      <aside 
        className={`fixed md:sticky top-0 left-0 z-50 md:z-20 w-64 bg-card border-r border-border shrink-0 flex flex-col h-screen transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        
        {/* Brand Header */}
        <div className="p-6 border-b border-border flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 relative overflow-hidden transition-transform hover:scale-105 duration-300">
              <img
                src="/logo-icon.svg"
                alt="Erina Assistance"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-base font-black tracking-wider text-white uppercase">Erina</span>
                <span className="text-[8px] bg-primary/20 text-primary border border-primary/30 px-1.5 py-0.2 rounded-full font-bold uppercase tracking-widest">Ops</span>
              </div>
              <span className="text-[9px] text-foreground/45 uppercase tracking-wider font-semibold block mt-0.5">Control Center</span>
            </div>
          </div>
          {/* Mobile Close Button */}
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden text-foreground/45 hover:text-white p-1 cursor-pointer transition-colors"
          >
            <X size={18} />
          </button>
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
                onClick={() => setIsMobileMenuOpen(false)}
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
        <header className="h-16 bg-card/65 backdrop-blur-md border-b border-border flex items-center justify-between px-4 md:px-8 z-10 shrink-0">
          
          {/* Mobile hamburger menu & Section Title */}
          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 hover:bg-white/5 rounded-xl border border-white/5 text-foreground/60 hover:text-white transition-all cursor-pointer mr-1"
            >
              <Menu size={18} />
            </button>
            <h2 className="text-xs md:text-sm font-black text-white uppercase tracking-widest truncate max-w-[100px] sm:max-w-none">
              {getPageTitle()}
            </h2>
            <div className="h-4 w-[1px] bg-border hidden sm:block" />
            <span className="text-[10px] text-foreground/35 font-bold uppercase tracking-wider hidden sm:block">
              Control Panel Grid
            </span>
          </div>

          {/* Operational Indicators */}
          <div className="flex items-center gap-2 sm:gap-6">
            
            {/* Active emergencies indicators */}
            {stats.activeEmergencies > 0 && (
              <div className="flex items-center gap-1.5 bg-emergency/10 border border-emergency/30 px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold text-emergency animate-pulse">
                <Flame size={12} className="sm:size-[14px]" />
                <span className="hidden sm:inline">{stats.activeEmergencies} Active Emergencies</span>
                <span className="sm:hidden">{stats.activeEmergencies} 🚨</span>
              </div>
            )}

            {/* Pending Dispatchers */}
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-foreground/50 font-bold bg-white/5 px-2 sm:px-3 py-1 rounded-full border border-white/5">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-warning animate-ping" />
              <span className="hidden sm:inline">{stats.pendingRequests} Bookings Waiting</span>
              <span className="sm:hidden">{stats.pendingRequests} ⏳</span>
            </div>

            {/* Notification Drawer Trigger */}
            <button className="relative p-1.5 sm:p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 text-foreground/60 hover:text-white transition-all cursor-pointer">
              <Bell size={14} className="sm:size-[16px]" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full" />
            </button>
          </div>
        </header>

        {/* Content Body Grid */}
        <main className={`flex-1 overflow-y-auto p-4 md:p-8 relative ${activeAlertMessage ? 'pt-16' : ''}`}>
          {children}
        </main>
      </div>

    </div>
  );
}

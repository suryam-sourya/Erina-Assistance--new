"use client";

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
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
  Menu,
  MessageSquare,
  Bot
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

  // Chatbot State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string; time: string }>>([
    { sender: 'bot', text: 'Operational greeting, Dispatcher! I am your Erina Ops Copilot. Ask me about hub coordinates, standard pricing, or copy dispatch notification templates.', time: 'Just Now' }
  ]);
  const [isBotTyping, setIsBotTyping] = useState(false);

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput.trim();
    const newMsg = { sender: 'user' as const, text: userMsg, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setChatMessages(prev => [...prev, newMsg]);
    setChatInput('');
    setIsBotTyping(true);

    setTimeout(() => {
      let botResponse = "I am processing your operational request. Could you please specify a ticket ID, coordinate request, or pricing query?";
      const msg = userMsg.toLowerCase();

      if (msg.includes('coordinate') || msg.includes('hub') || msg.includes('kadugodi') || msg.includes('address')) {
        botResponse = "📍 Erina Central Ops Hub:\nShop No. 02, Dinnur Main Road, Kadugodi Colony, Bengaluru - 560067.\nCoordinates: 12.9902° N, 77.7602° E.";
      } else if (msg.includes('pricing') || msg.includes('fare') || msg.includes('charge') || msg.includes('cost') || msg.includes('gst')) {
        botResponse = "💰 Standard SLA Fares:\n• Towing: Base ₹4,500 + ₹50/km (above 15km)\n• Battery Service: Base ₹1,800\n• Lockout: Base ₹1,500\n• standard GST (18%) is dynamically calculated on all services.";
      } else if (msg.includes('template') || msg.includes('sms') || msg.includes('message') || msg.includes('notification')) {
        botResponse = "📱 Dispatch SMS Templates:\n• Assigned: 'Dear [Customer], your responder is assigned and gathering tools at Kadugodi Central Hub.'\n• En Route: 'Your responder is en route. ETA: 15-20 mins. Live link: [URL]'\n• Arrived: 'Responder has arrived at your stranded coordinates.'";
      } else if (msg.includes('hi') || msg.includes('hello') || msg.includes('hey') || msg.includes('help')) {
        botResponse = "Greetings, Lead Dispatcher! How can I accelerate your emergency dispatch coordination today?";
      }

      setChatMessages(prev => [...prev, {
        sender: 'bot',
        text: botResponse,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setIsBotTyping(false);
    }, 850);
  };

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

      {/* 4. Floating Ops Copilot AI Chatbot Widget */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
        
        {/* Glowing floating action button (FAB) */}
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="w-12 h-12 bg-primary hover:bg-primary-hover text-background rounded-full flex items-center justify-center shadow-lg shadow-primary/30 transition-all cursor-pointer hover:scale-105 active:scale-95 duration-200 border border-primary/20 relative group"
        >
          {isChatOpen ? <X size={20} className="stroke-[2.5]" /> : <MessageSquare size={20} className="stroke-[2.5]" />}
          
          {/* Glowing pulse indicator */}
          {!isChatOpen && (
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-secondary border border-background"></span>
            </span>
          )}
        </button>

        {/* Floating Glassmorphic Chat Window */}
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="w-[340px] h-[450px] bg-card/95 border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-4 glass-panel text-xs select-text"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/30">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
                  <Bot size={15} className="text-primary animate-pulse" />
                </div>
                <div>
                  <h4 className="font-black text-white uppercase tracking-wider text-left">Erina Ops Copilot</h4>
                  <span className="text-[8px] text-success font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-success animate-pulse" /> Active Support Assistant
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setIsChatOpen(false)}
                className="text-foreground/45 hover:text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 min-h-0 bg-background/10">
              {chatMessages.map((msg, index) => (
                <div 
                  key={index}
                  className={`flex flex-col max-w-[80%] ${
                    msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                  }`}
                >
                  <div 
                    className={`p-3 rounded-xl leading-relaxed whitespace-pre-wrap text-left ${
                      msg.sender === 'user'
                        ? 'bg-primary text-background font-bold rounded-tr-none'
                        : 'bg-white/5 text-white border border-white/5 rounded-tl-none font-medium'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[8px] text-foreground/30 mt-1 font-mono uppercase font-bold">{msg.time}</span>
                </div>
              ))}
              
              {/* Typing Ticker */}
              {isBotTyping && (
                <div className="flex flex-col mr-auto items-start max-w-[80%]">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 rounded-tl-none flex items-center gap-1.5 py-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: '0.3s' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendChatMessage} className="p-3 border-t border-white/5 bg-black/20 flex gap-2">
              <input
                type="text"
                placeholder="Ask coordinates, pricing, stock levels..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 bg-background/50 border border-white/5 focus:border-primary/50 text-xs px-4 py-2.5 rounded-xl outline-none text-white font-semibold transition-all placeholder:text-foreground/20"
              />
              <button
                type="submit"
                className="px-3 py-2.5 bg-primary hover:bg-primary-hover text-background font-black rounded-xl text-[10px] uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-primary/10 flex items-center justify-center shrink-0"
              >
                Send
              </button>
            </form>
          </motion.div>
        )}

      </div>

    </div>
  );
}

"use client";

import { useState } from 'react';
import { useAdminStore, Technician } from '@/frontend/store/adminStore';
import { 
  UserCheck, 
  Star, 
  MapPin, 
  Phone, 
  Truck, 
  Plus, 
  User, 
  Search,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function TechniciansManagement() {
  const { technicians, toggleTechnicianAvailability, addActivity } = useAdminStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAvailability, setFilterAvailability] = useState<string>('all');
  
  // Add Technician Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTechName, setNewTechName] = useState('');
  const [newTechPhone, setNewTechPhone] = useState('');
  const [newTechArea, setNewTechArea] = useState('');
  const [newTechVehicle, setNewTechVehicle] = useState('Flatbed Tow Truck');

  const handleToggle = (id: string) => {
    toggleTechnicianAvailability(id);
  };

  const handleAddTechnician = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTechName || !newTechPhone || !newTechArea) return;

    const newId = `TECH-0${technicians.length + 1}`;
    
    // Add to Zustand using a custom activity (simulate add)
    const newTech: Technician = {
      id: newId,
      name: newTechName,
      phone: newTechPhone,
      availability: 'available',
      currentJob: null,
      rating: 5.0,
      serviceArea: newTechArea,
      vehicleType: newTechVehicle,
    };
    
    // We can add it directly to store state!
    useAdminStore.setState((state) => ({
      technicians: [...state.technicians, newTech],
    }));

    addActivity(`New technician ${newTechName} (${newTechVehicle}) successfully registered on duty.`, 'dispatch');
    
    // Reset & close
    setNewTechName('');
    setNewTechPhone('');
    setNewTechArea('');
    setShowAddModal(false);
  };

  // Filter Technicians
  const filteredTechs = technicians.filter(tech => {
    const matchesSearch = 
      tech.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tech.serviceArea.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tech.vehicleType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAvailability = 
      filterAvailability === 'all' ? true : tech.availability === filterAvailability;

    return matchesSearch && matchesAvailability;
  });

  const getAvailabilityColor = (avail: Technician['availability']) => {
    switch (avail) {
      case 'available': return 'bg-success/10 text-success border-success/35';
      case 'busy': return 'bg-[#6366F1]/10 text-[#818CF8] border-[#6366F1]/35';
      case 'offline': return 'bg-white/5 text-foreground/35 border-white/5';
      default: return 'bg-white/5 text-foreground/35 border-white/5';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wider">Technicians Directory</h1>
          <p className="text-xs text-foreground/45 uppercase tracking-wider font-semibold mt-1">
            Monitor mechanical units, deploy responsive support networks, and track operator scores
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-background font-black px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-primary/25 cursor-pointer self-start"
        >
          <Plus size={14} className="stroke-[3]" />
          <span>Register Unit</span>
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card/45 border border-white/5 p-4 rounded-xl">
          <span className="text-[9px] text-foreground/40 font-black uppercase tracking-wider">Total Force</span>
          <h4 className="text-xl font-black text-white mt-1">{technicians.length} Units</h4>
        </div>
        <div className="bg-card/45 border border-white/5 p-4 rounded-xl">
          <span className="text-[9px] text-foreground/40 font-black uppercase tracking-wider">Active Available</span>
          <h4 className="text-xl font-black text-success mt-1">
            {technicians.filter(t => t.availability === 'available').length} On-Duty
          </h4>
        </div>
        <div className="bg-card/45 border border-white/5 p-4 rounded-xl">
          <span className="text-[9px] text-foreground/40 font-black uppercase tracking-wider">Engaged Dispatches</span>
          <h4 className="text-xl font-black text-[#818CF8] mt-1">
            {technicians.filter(t => t.availability === 'busy').length} Busy
          </h4>
        </div>
        <div className="bg-card/45 border border-white/5 p-4 rounded-xl">
          <span className="text-[9px] text-foreground/40 font-black uppercase tracking-wider">Off Duty</span>
          <h4 className="text-xl font-black text-foreground/35 mt-1">
            {technicians.filter(t => t.availability === 'offline').length} Offline
          </h4>
        </div>
      </div>

      {/* Control Filters */}
      <div className="glass-panel p-5 rounded-2xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/35" size={16} />
          <input
            type="text"
            placeholder="Search by technician name, service area, vehicle type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-background border border-white/5 focus:border-primary/50 text-xs px-11 py-3 rounded-xl outline-none text-white font-semibold transition-all"
          />
        </div>

        {/* Filter selection */}
        <div className="flex items-center gap-3">
          <span className="text-[9px] text-foreground/45 font-black uppercase tracking-widest">Filter status</span>
          <div className="grid grid-cols-4 bg-background/60 p-1 rounded-xl border border-white/5">
            {['all', 'available', 'busy', 'offline'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterAvailability(status)}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  filterAvailability === status
                    ? 'bg-card text-primary border border-white/5'
                    : 'text-foreground/40 hover:text-foreground/80'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Technicians Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTechs.length > 0 ? (
          filteredTechs.map((tech) => (
            <div 
              key={tech.id} 
              className={`glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between hover:shadow-lg transition-all duration-300 relative group overflow-hidden ${
                tech.availability === 'busy' ? 'border-indigo-500/20' : ''
              }`}
            >
              
              {/* Profile Card Header */}
              <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 border border-white/5 flex items-center justify-center font-bold text-sm text-white group-hover:scale-105 transition-transform">
                      {tech.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-white uppercase tracking-wider">{tech.name}</h3>
                      <span className="text-[9px] font-mono text-foreground/30 font-bold block mt-0.5">{tech.id}</span>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${getAvailabilityColor(tech.availability)}`}>
                    {tech.availability}
                  </span>
                </div>

                {/* Mechanic Specs */}
                <div className="space-y-2.5 text-xs pb-5 border-b border-white/5 mb-5">
                  <div className="flex items-center gap-2 text-foreground/60 font-semibold">
                    <Truck size={14} className="text-foreground/30 shrink-0" />
                    <span className="truncate">{tech.vehicleType}</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground/60 font-semibold">
                    <MapPin size={14} className="text-red-500/60 shrink-0" />
                    <span className="truncate">{tech.serviceArea}</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground/60 font-semibold">
                    <Phone size={14} className="text-foreground/30 shrink-0" />
                    <span>{tech.phone}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer Roster actions */}
              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-1 bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg">
                  <Star size={12} className="fill-yellow-500 text-yellow-500" />
                  <span className="text-[10px] font-black text-white">{tech.rating.toFixed(1)}</span>
                </div>

                <div className="flex items-center gap-2">
                  
                  {/* If Busy, show job code */}
                  {tech.availability === 'busy' && tech.currentJob && (
                    <div className="flex items-center gap-1 text-[9px] bg-indigo-500/10 text-[#818CF8] border border-indigo-500/30 px-2 py-1 rounded-lg font-black uppercase tracking-wider">
                      <AlertCircle size={10} className="animate-spin" />
                      <span>Job: {tech.currentJob}</span>
                    </div>
                  )}

                  {/* Toggle availability switches */}
                  {tech.availability !== 'busy' && (
                    <button
                      onClick={() => handleToggle(tech.id)}
                      className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                        tech.availability === 'available'
                          ? 'bg-white/5 hover:bg-emergency/15 text-foreground/50 hover:text-emergency border border-white/5 hover:border-emergency/35'
                          : 'bg-primary hover:bg-primary-hover text-background hover:shadow-md hover:shadow-primary/20'
                      }`}
                    >
                      {tech.availability === 'available' ? 'Go Offline' : 'Set Duty'}
                    </button>
                  )}

                </div>
              </div>

            </div>
          ))
        ) : (
          <div className="col-span-full border border-white/5 rounded-2xl p-12 text-center text-foreground/30 font-bold uppercase tracking-widest text-xs leading-relaxed">
            No dynamic dispatch units found in this sector query
          </div>
        )}
      </div>

      {/* REGISTER NEW DISPATCH UNIT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md glass-panel p-6 rounded-2xl border border-white/10"
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
              <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-1.5">
                <UserCheck size={16} className="text-primary" />
                <span>Onboard Mechanical Operator</span>
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-foreground/45 hover:text-white p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddTechnician} className="space-y-4">
              <div>
                <label className="block text-[9px] text-foreground/45 font-bold uppercase tracking-wider mb-1.5">Operator Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30" size={14} />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anand Mahindra"
                    value={newTechName}
                    onChange={(e) => setNewTechName(e.target.value)}
                    className="w-full bg-background border border-white/10 focus:border-primary/50 text-xs px-9 py-2.5 rounded-lg outline-none text-white font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] text-foreground/45 font-bold uppercase tracking-wider mb-1.5">Contact Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30" size={14} />
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 99999 00000"
                    value={newTechPhone}
                    onChange={(e) => setNewTechPhone(e.target.value)}
                    className="w-full bg-background border border-white/10 focus:border-primary/50 text-xs px-9 py-2.5 rounded-lg outline-none text-white font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] text-foreground/45 font-bold uppercase tracking-wider mb-1.5">Active Service Sector Area</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30" size={14} />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Koramangala / HSR Layout"
                    value={newTechArea}
                    onChange={(e) => setNewTechArea(e.target.value)}
                    className="w-full bg-background border border-white/10 focus:border-primary/50 text-xs px-9 py-2.5 rounded-lg outline-none text-white font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] text-foreground/45 font-bold uppercase tracking-wider mb-1.5">Service Vehicle Category</label>
                <select
                  value={newTechVehicle}
                  onChange={(e) => setNewTechVehicle(e.target.value)}
                  className="w-full bg-background border border-white/10 focus:border-primary/50 text-xs p-2.5 rounded-lg outline-none text-white font-semibold cursor-pointer"
                >
                  <option value="Flatbed Tow Truck">Flatbed Tow Truck</option>
                  <option value="Heavy Duty Tow & Battery Rig">Heavy Duty Tow & Battery Rig</option>
                  <option value="EV Mobile Charger Van">EV Mobile Charger Van</option>
                  <option value="Battery Jumpstart & Fuel Van">Battery Jumpstart & Fuel Van</option>
                  <option value="RSA Response Bike & Lockout Toolset">RSA Response Bike & Lockout Toolset</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-primary hover:bg-primary-hover text-background font-black rounded-lg text-xs uppercase tracking-wider mt-4 transition-all hover:shadow-lg hover:shadow-primary/20 cursor-pointer"
              >
                Register Operator & Go Duty
              </button>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}

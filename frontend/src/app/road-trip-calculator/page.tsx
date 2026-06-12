'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, CheckCircle2, AlertTriangle, ArrowRight, Activity, Battery, MapPin, Car, Calendar, Phone } from 'lucide-react';

export default function RoadTripCalculator() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isCalculating, setIsCalculating] = useState(false);
  const [results, setResults] = useState<any>(null);

  const [formData, setFormData] = useState({
    startCity: '',
    endCity: '',
    make: 'Toyota',
    model: '',
    year: '2020',
    batteryAge: '0-1',
    lastService: '0-3',
  });
  const [phone, setPhone] = useState('');

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalculating(true);
    
    // Fake calculation delay to build anticipation
    setTimeout(() => {
      setIsCalculating(false);
      setStep(2); // Move to lead capture step
    }, 2000);
  };

  const handleUnlockReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalculating(true);

    try {
      const res = await fetch('/api/calculator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, phone })
      });
      const data = await res.json();
      
      if (data.success) {
        setResults(data.data);
        setStep(3);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            AI Road Trip <span className="text-primary">Safety Engine</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Our AI analyzes your exact vehicle model, live weather, and route terrain to calculate your exact breakdown risk and optimal tire pressure.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          
          {/* Form Area */}
          <div className="glass-panel p-8 rounded-3xl border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.form 
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleInitialSubmit} 
                  className="relative z-10 space-y-5"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Start City</label>
                      <input type="text" required placeholder="e.g. Bangalore" value={formData.startCity} onChange={e => setFormData({...formData, startCity: e.target.value})} className="w-full bg-dark/50 border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-primary outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Destination</label>
                      <input type="text" required placeholder="e.g. Ooty" value={formData.endCity} onChange={e => setFormData({...formData, endCity: e.target.value})} className="w-full bg-dark/50 border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-primary outline-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Car Make</label>
                      <select value={formData.make} onChange={e => setFormData({...formData, make: e.target.value})} className="w-full bg-dark/50 border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-primary outline-none">
                        <option value="Toyota">Toyota</option>
                        <option value="Honda">Honda</option>
                        <option value="Hyundai">Hyundai</option>
                        <option value="Maruti">Maruti Suzuki</option>
                        <option value="Mahindra">Mahindra</option>
                        <option value="Tata">Tata</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Year</label>
                      <select value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} className="w-full bg-dark/50 border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-primary outline-none">
                        {[...Array(15)].map((_, i) => (
                          <option key={i} value={2024 - i}>{2024 - i}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Battery Age</label>
                    <div className="grid grid-cols-3 gap-3">
                      {['0-1', '1-3', '3+'].map((age) => (
                        <button key={age} type="button" onClick={() => setFormData({...formData, batteryAge: age})} className={`py-2 rounded-lg border text-sm font-semibold transition-all ${formData.batteryAge === age ? 'bg-primary/20 border-primary text-white' : 'bg-dark/50 border-gray-800 text-gray-400'}`}>
                          {age === '3+' ? '3+ Yrs' : `${age} Yrs`}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Last Full Service</label>
                    <div className="grid grid-cols-3 gap-3">
                      {['0-3', '3-6', '6+'].map((serv) => (
                        <button key={serv} type="button" onClick={() => setFormData({...formData, lastService: serv})} className={`py-2 rounded-lg border text-sm font-semibold transition-all ${formData.lastService === serv ? 'bg-primary/20 border-primary text-white' : 'bg-dark/50 border-gray-800 text-gray-400'}`}>
                          {serv === '6+' ? '6+ Mo' : `${serv} Mo`}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button type="submit" disabled={isCalculating} className="w-full mt-4 bg-primary hover:bg-primary-hover text-white font-black text-lg py-4 rounded-xl flex items-center justify-center gap-2 glow-primary transition-all">
                    {isCalculating ? <Activity className="animate-spin" /> : 'Run AI Analysis'}
                  </button>
                </motion.form>
              )}

              {step === 2 && (
                <motion.form 
                  key="step2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onSubmit={handleUnlockReport}
                  className="relative z-10 space-y-6 py-4"
                >
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
                      <CheckCircle2 size={32} />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-2">Analysis Complete!</h3>
                    <p className="text-gray-400 text-sm">We generated your custom tire pressure and mechanic insights.</p>
                  </div>

                  <div className="bg-black/40 rounded-xl p-5 border border-white/5 space-y-4">
                    <label className="block text-sm font-bold text-white mb-2">Enter WhatsApp Number to Unlock Free Report:</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        type="tel" 
                        required 
                        placeholder="+91 98765 43210" 
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className="w-full bg-dark/80 border border-gray-700 rounded-xl pl-12 pr-4 py-4 text-white font-bold text-lg focus:border-primary outline-none" 
                      />
                    </div>
                  </div>

                  <button type="submit" disabled={isCalculating} className="w-full bg-primary hover:bg-primary-hover text-white font-black text-lg py-4 rounded-xl flex items-center justify-center gap-2 glow-primary transition-all">
                    {isCalculating ? <Activity className="animate-spin" /> : 'Unlock My Insights'}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* Results Area */}
          <div className="relative h-full min-h-[400px]">
            <AnimatePresence mode="wait">
              {step < 3 && !isCalculating && (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 border border-dashed border-gray-800 rounded-3xl"
                >
                  <Activity size={48} className="text-gray-700 mb-4" />
                  <p className="text-gray-500 font-medium">Enter your details to generate your highly personalized trip safety report.</p>
                </motion.div>
              )}

              {step === 3 && results && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`h-full glass-panel p-8 rounded-3xl border ${
                    results.finalRisk === 'high' ? 'border-red-500/50 bg-red-500/5' : 
                    results.finalRisk === 'medium' ? 'border-yellow-500/50 bg-yellow-500/5' : 
                    'border-green-500/50 bg-green-500/5'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-6">
                    {results.finalRisk === 'high' ? <ShieldAlert className="text-red-500 w-10 h-10" /> :
                     results.finalRisk === 'medium' ? <AlertTriangle className="text-yellow-500 w-10 h-10" /> :
                     <CheckCircle2 className="text-green-500 w-10 h-10" />}
                    
                    <div>
                      <h3 className="text-2xl font-black text-white">
                        {results.finalRisk === 'high' ? 'High Risk' : results.finalRisk === 'medium' ? 'Caution Advised' : 'Good to Go!'}
                      </h3>
                      <p className={`text-sm font-bold uppercase tracking-wider ${
                        results.finalRisk === 'high' ? 'text-red-400' : results.finalRisk === 'medium' ? 'text-yellow-400' : 'text-green-400'
                      }`}>
                        Trip Readiness Score
                      </p>
                    </div>
                  </div>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-8">
                    <div className="bg-black/50 rounded-xl p-4 border border-white/5">
                      <p className="text-gray-500 text-[10px] font-bold uppercase mb-1">Recommended Tire PSI</p>
                      <p className="text-white font-black text-xl">{results.recommendedPsi} PSI</p>
                    </div>
                    <div className="bg-black/50 rounded-xl p-4 border border-white/5">
                      <p className="text-gray-500 text-[10px] font-bold uppercase mb-1">Route Weather</p>
                      <p className="text-white font-black text-xl">{results.tempC}°C</p>
                    </div>
                  </div>

                  <div className="bg-black/40 rounded-xl p-5 border border-white/5 mb-8">
                    <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                      <Activity size={16} className="text-primary" />
                      Key Insights
                    </h4>
                    <ul className="space-y-4 text-sm text-gray-300">
                      {results.insights.map((insight: string, idx: number) => (
                        <li key={idx} className="flex gap-3 leading-relaxed">
                          <span className="text-primary mt-1">•</span> 
                          <span>{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link 
                    href="/booking?service=battery"
                    className={`block text-center w-full py-4 rounded-xl font-black text-black transition-all hover:scale-105 ${
                      results.finalRisk === 'high' ? 'bg-red-500 hover:bg-red-400 glow-emergency' :
                      results.finalRisk === 'medium' ? 'bg-yellow-500 hover:bg-yellow-400' :
                      'bg-green-500 hover:bg-green-400'
                    }`}
                  >
                    {results.finalRisk === 'high' ? 'Book Urgent Pre-Trip Check' : 'Book Pre-Trip Inspection'}
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
}

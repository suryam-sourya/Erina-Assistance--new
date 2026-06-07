"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Shield, Star, Car, X, Send, Loader2 } from 'lucide-react';

const plans = [
  {
    name: 'Basic',
    icon: <Car size={24} />,
    price: '₹1,499',
    period: '/year',
    description: 'Essential coverage for city commuters.',
    features: [
      '2 Free Towing Services (up to 25km)',
      'Unlimited Battery Jumpstarts',
      'Flat Tyre Assistance',
      'Fuel Delivery (cost of fuel extra)',
      '24/7 Phone Support',
      'Standard Response Time (45 mins)'
    ],
    buttonText: 'Get Basic Plan',
    popular: false,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    name: 'Premium',
    icon: <Star size={24} />,
    price: '₹2,999',
    period: '/year',
    description: 'Comprehensive coverage for peace of mind.',
    features: [
      '4 Free Towing Services (up to 50km)',
      'Unlimited Battery Jumpstarts',
      'Flat Tyre Repair & Replacement',
      '5L Free Fuel Delivery (Twice a year)',
      'Lockout Assistance',
      'Priority Response Time (30 mins)',
      'Key Replacement Cover up to ₹2,000'
    ],
    buttonText: 'Get Premium Plan',
    popular: true,
    color: 'from-primary to-secondary'
  },
  {
    name: 'Fleet',
    icon: <Shield size={24} />,
    price: 'Custom',
    period: '',
    description: 'Tailored solutions for businesses and multiple vehicles.',
    features: [
      'Coverage for 5+ Vehicles',
      'Unlimited Towing (City limits)',
      'Dedicated Account Manager',
      'Monthly Service Reports',
      'On-site Preventive Maintenance',
      'Custom SLA & Response Times',
      'API Access for Tracking'
    ],
    buttonText: 'Contact Sales',
    popular: false,
    color: 'from-gray-700 to-gray-900'
  }
];

export default function MembershipPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    vehicleDetails: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleOpenInquiry = (planName: string) => {
    setSelectedPlan(planName);
    setIsModalOpen(true);
    setSuccess(false);
    setError('');
  };

  const handleCloseInquiry = () => {
    setIsModalOpen(false);
    // Reset form after exit animation completes
    setTimeout(() => {
      setFormData({
        name: '',
        phone: '',
        email: '',
        vehicleDetails: '',
        message: ''
      });
      setSuccess(false);
      setError('');
    }, 200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.name || !formData.phone || !formData.email) {
      setError('Please fill in all required fields (Name, Phone, Email).');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/membership/inquiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          plan: selectedPlan,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong. Please try again.');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-24 bg-light dark:bg-[#0B0F19] relative overflow-hidden">
      
      {/* Background Elements */}
      <div className="absolute top-0 w-full h-96 bg-primary/5 rounded-b-[100px] blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-6">
              Peace of mind, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">guaranteed.</span>
            </h1>
            <p className="text-lg text-foreground/60">
              Choose a membership plan that fits your needs. Drive anywhere in Bangalore knowing Erina Assistance is always just a tap away.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-20">
          {plans.map((plan, index) => (
            <motion.div 
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white dark:bg-gray-900 rounded-3xl p-8 relative shadow-xl border flex flex-col justify-between ${
                plan.popular 
                  ? 'border-primary border-2 shadow-primary/20 scale-105 z-10' 
                  : 'border-gray-100 dark:border-gray-800'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-primary to-secondary text-white px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider shadow-lg">
                  Most Popular
                </div>
              )}
              
              <div>
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center text-white mb-6 shadow-lg`}>
                  {plan.icon}
                </div>
                
                <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                <p className="text-sm text-foreground/60 mb-6 min-h-[40px]">{plan.description}</p>
                
                <div className="mb-8">
                  <span className="text-4xl font-extrabold text-foreground">{plan.price}</span>
                  <span className="text-foreground/60 font-medium">{plan.period}</span>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check size={20} className="text-primary shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground/80 font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <button 
                onClick={() => handleOpenInquiry(plan.name)}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                  plan.popular 
                    ? 'bg-gradient-to-r from-primary to-primary-hover text-white shadow-lg shadow-primary/30 hover:scale-105 cursor-pointer' 
                    : 'bg-gray-100 dark:bg-gray-800 text-foreground hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer'
                }`}
              >
                {plan.buttonText}
              </button>
            </motion.div>
          ))}
        </div>

        {/* General Inquiry CTA bottom banner */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-gray-900 via-primary/20 to-gray-900 rounded-3xl p-8 md:p-12 border border-white/10 text-center max-w-4xl mx-auto shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-primary/20 rounded-full blur-3xl -z-10" />
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-4">Not sure which plan fits your vehicle?</h2>
          <p className="text-gray-300 max-w-2xl mx-auto mb-8">
            Submit a general membership inquiry, and our roadside assistance specialist will guide you through custom coverages for your cars or bikes.
          </p>
          <button 
            onClick={() => handleOpenInquiry('General Inquiry')}
            className="bg-primary text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary/30 hover:bg-primary-hover hover:-translate-y-0.5 transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <Send size={20} />
            Submit General Inquiry
          </button>
        </motion.div>

      </div>

      {/* Inquiry Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseInquiry}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            {/* Modal Box */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white/90 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl p-6 md:p-8 w-full max-w-lg border border-gray-200 dark:border-gray-800 shadow-2xl relative z-10 overflow-hidden"
            >
              
              <button 
                onClick={handleCloseInquiry}
                className="absolute top-6 right-6 text-foreground/60 hover:text-foreground transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X size={24} />
              </button>

              {!success ? (
                <>
                  <div className="mb-6">
                    <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">
                      {selectedPlan === 'General Inquiry' ? 'Membership Help' : `${selectedPlan} Plan Selection`}
                    </span>
                    <h2 className="text-2xl font-black text-foreground mt-3">
                      {selectedPlan === 'General Inquiry' ? 'Membership Inquiry' : 'Join Erina Assistance'}
                    </h2>
                    <p className="text-sm text-foreground/60 mt-1">
                      Fill in your details below, and our agent will connect with you shortly to setup your subscription.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                      <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl text-sm font-semibold">
                        {error}
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-foreground/70 mb-1">Full Name *</label>
                      <input 
                        type="text" 
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/80 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground transition-all"
                        placeholder="e.g. Rahul Sharma"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-foreground/70 mb-1">Phone Number *</label>
                        <input 
                          type="tel" 
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/80 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground transition-all"
                          placeholder="e.g. 9876543210"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-foreground/70 mb-1">Email Address *</label>
                        <input 
                          type="email" 
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/80 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground transition-all"
                          placeholder="e.g. rahul@gmail.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-foreground/70 mb-1">Vehicle Make / Model</label>
                      <input 
                        type="text" 
                        value={formData.vehicleDetails}
                        onChange={(e) => setFormData({ ...formData, vehicleDetails: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/80 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground transition-all"
                        placeholder="e.g. Hyundai i20 / Royal Enfield 350"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-foreground/70 mb-1">Remarks or Questions</label>
                      <textarea 
                        rows={3}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/80 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground transition-all resize-none"
                        placeholder="Any specific towing requirements or questions?"
                      />
                    </div>

                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary/30 hover:bg-primary-hover hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="animate-spin" size={20} />
                          Submitting Inquiry...
                        </>
                      ) : (
                        <>
                          <Send size={20} />
                          Submit Subscription Request
                        </>
                      )}
                    </button>
                  </form>
                </>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/10">
                    <Check size={36} className="stroke-[3]" />
                  </div>
                  <h2 className="text-2xl font-black text-foreground mb-3">Inquiry Submitted!</h2>
                  <p className="text-foreground/60 text-sm max-w-sm mx-auto mb-8">
                    Thank you, <span className="font-bold text-foreground">{formData.name}</span>. We have received your inquiry for the <span className="font-bold text-primary">{selectedPlan} Plan</span>. Our activation team will contact you shortly at <span className="font-bold text-foreground">{formData.phone}</span>.
                  </p>
                  <button 
                    onClick={handleCloseInquiry}
                    className="bg-gray-100 dark:bg-gray-800 text-foreground px-8 py-3 rounded-xl font-bold transition-all hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
                  >
                    Close Window
                  </button>
                </motion.div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

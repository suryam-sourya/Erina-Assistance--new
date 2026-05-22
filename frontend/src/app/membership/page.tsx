"use client";

import { motion } from 'framer-motion';
import { Check, Shield, Star, Car } from 'lucide-react';

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
  return (
    <div className="min-h-screen pt-28 pb-24 bg-light dark:bg-[#0B0F19] relative overflow-hidden">
      
      {/* Background Elements */}
      <div className="absolute top-0 w-full h-96 bg-primary/5 rounded-b-[100px] blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-6">Peace of mind, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">guaranteed.</span></h1>
            <p className="text-lg text-foreground/60">
              Choose a membership plan that fits your needs. Drive anywhere in Bangalore knowing Erina Assistance is always just a tap away.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {plans.map((plan, index) => (
            <motion.div 
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white dark:bg-gray-900 rounded-3xl p-8 relative shadow-xl border ${plan.popular ? 'border-primary border-2 shadow-primary/20 scale-105 z-10' : 'border-gray-100 dark:border-gray-800'}`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-primary to-secondary text-white px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider shadow-lg">
                  Most Popular
                </div>
              )}
              
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
              
              <button className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${plan.popular ? 'bg-gradient-to-r from-primary to-primary-hover text-white shadow-lg shadow-primary/30 hover:scale-105' : 'bg-gray-100 dark:bg-gray-800 text-foreground hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                {plan.buttonText}
              </button>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}

"use client";

import { useState, useRef, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { MapPin, Camera, ShieldCheck, Navigation, CheckCircle2, XCircle, TrendingUp, Zap } from 'lucide-react';
import { calculatePrice, DEFAULT_PRICING, PricingConfig } from '@/lib/pricingEngine';

export default function BookingPage() {
  const [locationDetecting, setLocationDetecting] = useState(false);
  const [isPriority, setIsPriority] = useState(false);

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicleType, setVehicleType] = useState('Car (Hatchback/Sedan)');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [selectedIssue, setSelectedIssue] = useState('');
  const [locationName, setLocationName] = useState('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [distanceKm, setDistanceKm] = useState(10);

  // Pricing
  const [pricingConfig, setPricingConfig] = useState<PricingConfig>(DEFAULT_PRICING);
  useEffect(() => {
    const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || 'https://admin-panel-psi-pearl.vercel.app';
    fetch(`${adminUrl}/api/pricing`)
      .then((r) => r.json())
      .then((data) => { if (data?.pricing) setPricingConfig(data.pricing); })
      .catch(() => { /* use default */ });
  }, []);

  const priceBreakdown = useMemo(() => calculatePrice({
    serviceType:  selectedIssue || 'other',
    vehicleType,
    distanceKm,
    isEmergency: isPriority,
    config: pricingConfig,
  }), [selectedIssue, vehicleType, distanceKm, isPriority, pricingConfig]);

  // Upload states
  const [imageUrl, setImageUrl] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageError, setImageError] = useState('');
  const [createdBookingId, setCreatedBookingId] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Status states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setImageError('Image must be less than 5MB.');
      return;
    }

    setIsUploadingImage(true);
    setImageError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const response = await fetch(`${apiUrl}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setImageUrl(data.url);
      } else {
        setImageError(data.error || 'Failed to upload image.');
      }
    } catch (err: any) {
      console.error(err);
      setImageError('Network error uploading image.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl('');
    setImageError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDetectLocation = () => {
    setLocationDetecting(true);
    setTimeout(() => {
      setLocationDetecting(false);
      setCoordinates({ lat: 12.9716, lng: 77.5946 }); // Mock Bangalore Coordinates
      setLocationName('Hebbal Flyover, Bangalore');
    }, 1500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIssue) {
      setErrorMessage('Please select the type of issue.');
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const response = await fetch(`${apiUrl}/api/bookings/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName,
          phone,
          serviceType: selectedIssue.toLowerCase().replace(' ', '_'),
          vehicleType,
          vehicleNumber,
          vehiclePlate: vehicleNumber,
          status: isPriority ? 'emergency' : 'pending',
          location: coordinates || { lat: 12.9716, lng: 77.5946 },
          address: locationName || 'Stranded Location, Bangalore',
          paymentAmount: priceBreakdown.total,
          distanceKm,
          paymentStatus: 'pending',
          imageUrl: imageUrl || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitStatus('success');
        setCreatedBookingId(data.booking._id || data.booking.id || '');
        // Clear fields
        setCustomerName('');
        setPhone('');
        setVehicleNumber('');
        setSelectedIssue('');
        setLocationName('');
        setCoordinates(null);
      } else {
        setErrorMessage(data.error || 'Failed to submit request.');
        setSubmitStatus('error');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Network error occurred. Please try again.');
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitStatus === 'success') {
    return (
      <div className="min-h-screen pt-28 pb-16 bg-light dark:bg-[#0B0F19] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-800 text-center space-y-6"
        >
          <div className="w-20 h-20 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-3xl font-extrabold text-foreground">Request Received!</h2>
          <p className="text-foreground/60">
            Your emergency roadside assistance request has been recorded. Our team is dispatching the nearest service operator to your location.
          </p>
          <div className="flex flex-col gap-3">
            <a
              href={`/tracking?id=${createdBookingId}`}
              className="w-full bg-gradient-to-r from-primary to-primary-hover text-white py-4 rounded-xl font-bold transition-all hover:scale-[1.01] shadow-lg shadow-primary/20 block text-center"
            >
              Track Your Live Rescue
            </a>
            <button
              onClick={() => {
                setSubmitStatus('idle');
                setCreatedBookingId('');
              }}
              className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-foreground py-4 rounded-xl font-bold transition-all cursor-pointer"
            >
              Submit Another Request
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-16 bg-light dark:bg-[#0B0F19]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-sm mb-4">
              <div className="relative w-[18px] h-[18px] animate-pulse">
                <Image src="/warning.png" alt="Emergency" fill className="object-contain" />
              </div>
              Emergency Assistance Request
            </div>
            <h1 className="text-4xl font-extrabold text-foreground mb-4">Get Help Now</h1>
            <p className="text-foreground/60 max-w-2xl mx-auto">
              Fill out the details below. Our nearest available technician will be dispatched to your location immediately.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800"
        >
          <div className="p-8 md:p-10">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Priority Toggle */}
              <div className={`p-5 rounded-2xl border-2 transition-colors flex items-center justify-between cursor-pointer ${isPriority ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'}`} onClick={() => setIsPriority(!isPriority)}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center relative p-2.5 ${isPriority ? 'bg-primary/20 shadow-lg shadow-primary/10' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                    <div className="relative w-full h-full">
                      <Image src="/warning.png" alt="Priority" fill className="object-contain" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-foreground">High Priority Emergency</h3>
                    <p className="text-sm text-foreground/60">Move to the top of the queue for faster response</p>
                  </div>
                </div>
                <div className={`w-14 h-8 rounded-full p-1 transition-colors ${isPriority ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-700'}`}>
                  <div className={`w-6 h-6 rounded-full bg-white transition-transform ${isPriority ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
              </div>

              {submitStatus === 'error' && (
                <div className="flex items-center gap-3 bg-emergency/10 border border-emergency/20 text-emergency p-4 rounded-xl text-sm font-semibold">
                  <XCircle size={18} />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Personal Info */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Full Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="John Doe" 
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-5 py-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Mobile Number</label>
                    <input 
                      type="tel" 
                      required
                      placeholder="+91 98765 43210" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-5 py-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground" 
                    />
                  </div>
                </div>

                {/* Vehicle Info */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Vehicle Type</label>
                    <select 
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value)}
                      className="w-full px-5 py-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground"
                    >
                      <option>Car (Hatchback/Sedan)</option>
                      <option>SUV / MUV</option>
                      <option>Luxury Vehicle</option>
                      <option>Two-Wheeler</option>
                      <option>Commercial Vehicle</option>
                      <option>Electric Vehicle (EV)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Vehicle Number</label>
                    <input 
                      type="text" 
                      required
                      placeholder="KA 01 AB 1234" 
                      value={vehicleNumber}
                      onChange={(e) => setVehicleNumber(e.target.value)}
                      className="w-full px-5 py-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all uppercase text-foreground" 
                    />
                  </div>
                </div>
              </div>

              {/* Issue Type */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Select Issue</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['Towing', 'Flat Tyre', 'Battery', 'Fuel', 'Lockout', 'Engine', 'Accident', 'Other'].map((issue) => (
                    <label key={issue} className="cursor-pointer">
                      <input 
                        type="radio" 
                        name="issue" 
                        value={issue}
                        checked={selectedIssue === issue}
                        onChange={() => setSelectedIssue(issue)}
                        className="peer sr-only" 
                      />
                      <div className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-center peer-checked:bg-primary peer-checked:text-white peer-checked:border-primary transition-all hover:bg-gray-50 dark:hover:bg-gray-800 peer-checked:hover:bg-primary font-medium text-foreground">
                        {issue}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Pickup Location</label>
                <div className="flex gap-4">
                  <div className="relative flex-grow">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                      type="text" 
                      required
                      placeholder="Search location or drop pin..." 
                      value={locationName}
                      onChange={(e) => setLocationName(e.target.value)}
                      className="w-full pl-12 pr-5 py-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground" 
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={handleDetectLocation}
                    className="flex items-center justify-center gap-2 px-6 py-4 bg-gray-900 dark:bg-gray-700 text-white rounded-xl font-semibold hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors whitespace-nowrap"
                  >
                    {locationDetecting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Navigation size={18} />
                        <span className="hidden sm:inline">Detect</span>
                      </>
                    )}
                  </button>
                </div>
                {/* Mock Map Area */}
                <div 
                  onClick={handleDetectLocation}
                  className="mt-4 w-full h-48 bg-gray-200 dark:bg-gray-800 rounded-xl relative overflow-hidden flex items-center justify-center group cursor-pointer border border-gray-200 dark:border-gray-700"
                >
                   <div className="absolute inset-0 opacity-50 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
                   <div className="relative z-10 flex flex-col items-center">
                     <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg mb-2 group-hover:scale-110 transition-transform text-primary">
                       <MapPin size={24} />
                     </div>
                     <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                       {locationName ? `Selected: ${locationName}` : 'Tap to select on map'}
                     </span>
                   </div>
                </div>
              </div>

              {/* Upload Image */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Upload Image (Optional)</label>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden" 
                />
                
                {imageUrl ? (
                  <div className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-4 flex items-center justify-between gap-4 group">
                    <div className="flex items-center gap-4">
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 flex-shrink-0">
                        <img src={imageUrl} alt="Uploaded vehicle" className="object-cover w-full h-full" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">Vehicle Photo Uploaded</p>
                        <p className="text-xs text-success font-semibold flex items-center gap-1 mt-1">
                          <CheckCircle2 size={12} />
                          Saved to Cloudinary
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="px-4 py-2 text-xs font-bold text-emergency hover:bg-emergency/10 border border-emergency/20 hover:border-emergency/35 rounded-xl transition-all cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-200 dark:border-gray-800 hover:border-primary/50 dark:hover:border-primary/50 rounded-2xl p-8 text-center bg-white dark:bg-gray-900 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-all cursor-pointer group flex flex-col items-center justify-center space-y-4"
                  >
                    {isUploadingImage ? (
                      <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center animate-spin border-2 border-primary border-t-transparent" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Camera size={28} />
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-foreground text-sm">
                        {isUploadingImage ? 'Uploading photo to cloud...' : 'Upload incident or vehicle photo'}
                      </p>
                      <p className="text-xs text-foreground/50 mt-1">PNG, JPG, JPEG or WEBP (max. 5MB)</p>
                    </div>
                    {imageError && (
                      <p className="text-xs font-semibold text-emergency mt-2">{imageError}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Distance Slider */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Estimated Distance: <span className="text-primary">{distanceKm} km</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={100}
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-foreground/40 font-semibold mt-1">
                  <span>1 km</span><span>100 km</span>
                </div>
              </div>

              {/* Live Price Estimate Card */}
              {selectedIssue && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-primary/20 bg-primary/5 p-5 space-y-3"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="text-primary" size={16} />
                    <span className="text-sm font-black text-foreground uppercase tracking-wider">Price Estimate</span>
                    {isPriority && (
                      <span className="ml-auto flex items-center gap-1 text-[9px] font-black text-emergency bg-emergency/10 border border-emergency/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        <Zap size={8} /> Priority Surcharge
                      </span>
                    )}
                  </div>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between text-foreground/60">
                      <span>Base fee ({selectedIssue})</span>
                      <span className="font-semibold text-foreground">₹{priceBreakdown.baseFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-foreground/60">
                      <span>Distance ({distanceKm} km)</span>
                      <span className="font-semibold text-foreground">₹{priceBreakdown.distanceFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-foreground/60">
                      <span>Vehicle type</span>
                      <span className="font-semibold text-foreground">{priceBreakdown.vehicleMultiplier}×</span>
                    </div>
                    {priceBreakdown.timeSurcharge > 1 && (
                      <div className="flex justify-between text-foreground/60">
                        <span>{priceBreakdown.surchargeLabel}</span>
                        <span className="font-semibold text-warning">{priceBreakdown.timeSurcharge}×</span>
                      </div>
                    )}
                    {isPriority && (
                      <div className="flex justify-between text-foreground/60">
                        <span>Emergency priority</span>
                        <span className="font-semibold text-emergency">{priceBreakdown.emergencySurcharge}×</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-primary/15">
                    <span className="text-sm font-black text-foreground">Estimated Total</span>
                    <span className="text-2xl font-black text-primary">₹{priceBreakdown.total.toLocaleString()}</span>
                  </div>
                  <p className="text-[10px] text-foreground/40 font-semibold">Final amount confirmed by dispatcher. Estimate may vary with actual distance.</p>
                </motion.div>
              )}

              {/* Submit Button */}
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-primary to-primary-hover text-white py-5 rounded-2xl font-bold text-xl shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.01] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ShieldCheck size={24} />
                    Request Assistance Now
                  </>
                )}
              </button>
              
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}


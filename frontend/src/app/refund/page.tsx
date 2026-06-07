"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Shield, ArrowLeft, Calendar, BadgePercent } from 'lucide-react';

export default function RefundPage() {
  return (
    <div className="min-h-screen pt-28 pb-24 bg-light dark:bg-[#0B0F19] relative overflow-hidden">
      
      {/* Background Elements */}
      <div className="absolute top-0 w-full h-96 bg-primary/5 rounded-b-[100px] blur-3xl -z-10" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb / Back button */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-foreground/60 hover:text-primary transition-colors font-medium">
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>

        {/* Header */}
        <div className="mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                <BadgePercent size={24} />
              </div>
              <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">Cancellation &amp; Returns</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-foreground mb-6">Refund Policy</h1>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-foreground/60 border-y border-gray-100 dark:border-gray-800/80 py-4">
              <span className="flex items-center gap-1.5 font-medium">
                <Calendar size={16} className="text-primary" />
                Last Updated: July 18th 2025
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Shield size={16} className="text-primary" />
                Consumer Protection Compliant
              </span>
            </div>
          </motion.div>
        </div>

        {/* Body Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="prose prose-slate dark:prose-invert max-w-none space-y-8 text-foreground/80 leading-relaxed"
        >
          
          <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-gray-200/60 dark:border-gray-800/80 shadow-lg">
            <p className="text-sm font-semibold text-foreground leading-relaxed">
              At Erina Assistance, we strive for complete customer satisfaction with our Battery Sales &amp; Services and Roadside Assistance. Please review our refund policy carefully. This policy is aligned with the Consumer Protection Act, 2019 and related e-commerce regulations of India.
            </p>
          </div>

          {/* Section 1 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">1. Scope of Policy</h2>
            <p>This policy applies to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Battery purchases (new/reconditioned) made online or offline.</li>
              <li>Battery installation and testing services.</li>
              <li>Roadside Assistance (RSA) services purchased on a single-use basis.</li>
              <li>Roadside Assistance membership plans or subscriptions.</li>
            </ul>
          </section>

          <hr className="border-gray-100 dark:border-gray-800" />

          {/* Section 2 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">2. Battery Sales (Products)</h2>
            <div className="space-y-4">
              <p><strong>Returns &amp; Refunds (Unused/Unopened Batteries):</strong></p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Batteries in original packaging, unused, undamaged, and with proof of purchase, may be returned within 14 days of purchase for a full refund.</li>
                <li>Return shipping costs for online purchases are the responsibility of the customer unless the battery was defective or shipped in error by Erina Assistance.</li>
              </ul>
              
              <p><strong>Defective Batteries:</strong></p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Batteries covered under warranty found to be defective within the warranty period will be replaced free of charge. Refunds are issued only if a replacement is unavailable.</li>
                <li>Proof of purchase and warranty documentation are required.</li>
              </ul>

              <p><strong>Installed Batteries &amp; Core Charges:</strong></p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Once a battery is installed, it is considered used and cannot be returned for a standard refund. Warranty claims apply.</li>
                <li>Core charges (if applicable) are refunded upon return of the old battery in accordance with core return policies at the time of purchase.</li>
              </ul>

              <p><strong>Non-Refundable Battery Purchases:</strong></p>
              <p className="text-sm text-foreground/60">
                Clearance, special order, or custom batteries are typically non-refundable unless defective.
              </p>
            </div>

            <div className="bg-primary/5 rounded-3xl p-6 md:p-8 border border-primary/10 mt-6 space-y-3">
              <h3 className="text-lg font-bold text-foreground">Request &amp; Processing Timelines</h3>
              <ul className="space-y-2 text-sm">
                <li><strong>Batteries:</strong> Refund requests should be made within 7 days of delivery to allow for inspection and return.</li>
                <li><strong>Services/RSA:</strong> Cancellations can be made on the day of booking before the technician is dispatched. If a technician has already been sent, standard service fees apply and no refund will be issued.</li>
                <li><strong>Processing:</strong> Once approved, digital refunds are initiated promptly. Refunds typically process within 5–7 business days of approval, and should reflect in your account within 7–10 business days overall, in alignment with RBI guidelines.</li>
              </ul>
            </div>
          </section>

          <hr className="border-gray-100 dark:border-gray-800" />

          {/* Section 3 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">3. Battery Services (Installation/Testing)</h2>
            <ul className="list-disc pl-6 space-y-3">
              <li><strong>Cancellation Before Service:</strong> If you cancel a scheduled battery installation or testing service before the technician arrives or begins work, you will receive a full refund.</li>
              <li><strong>Cancellation During/After Service:</strong> Fees for battery installation or testing services are non-refundable once the technician has arrived on site and begun work, as dispatch resources have been deployed.</li>
            </ul>
          </section>

          <hr className="border-gray-100 dark:border-gray-800" />

          {/* Section 4 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">4. Roadside Assistance Services (Single Use)</h2>
            <ul className="list-disc pl-6 space-y-3">
              <li><strong>Service Not Rendered:</strong> If you pay for a specific roadside assistance service (e.g., tow, jump-start, tire change) and Erina Assistance fails to dispatch a provider or the provider fails to perform the service (through no fault of the customer), you are entitled to a full refund for that service fee.</li>
              <li><strong>Service Rendered:</strong> Fees for roadside assistance services that were successfully dispatched and rendered are non-refundable. Payment is for the deployment and attempt/completion of the service, regardless of the ultimate outcome.</li>
              <li><strong>Customer Cancellation:</strong> If you cancel a dispatched roadside assistance request after a technician has been assigned or is en route, a cancellation fee (up to the full service fee) may apply and is non-refundable.</li>
              <li><strong>User Error / Ineligibility:</strong> No refund is provided if service is unavailable due to customer error (e.g., incorrect location provided, inaccessible vehicle, unsafe conditions) or if the vehicle/situation falls outside the scope of covered services.</li>
            </ul>
          </section>

          <hr className="border-gray-100 dark:border-gray-800" />

          {/* Section 5 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">5. Roadside Assistance Memberships/Subscriptions</h2>
            <ul className="list-disc pl-6 space-y-3">
              <li><strong>Cancellation During Cooling-Off Period:</strong> If local law provides a cooling-off period, you may cancel your membership within this period for a full refund, provided no services have been used.</li>
              <li><strong>Cancellation After Cooling-Off / During Term:</strong>
                <ul className="list-circle pl-6 space-y-1 mt-2">
                  <li>If you cancel your membership after the cooling-off period, you may be eligible for a pro-rata refund of the unused portion of the membership fee, minus any services already used and potentially an administrative fee.</li>
                  <li>If you have used any services during the membership term, you are generally not eligible for a refund of the membership fee.</li>
                </ul>
              </li>
              <li><strong>Non-Refundable Fees:</strong> Initiation fees or one-time setup fees associated with memberships are typically non-refundable.</li>
            </ul>
          </section>

          <hr className="border-gray-100 dark:border-gray-800" />

          {/* Section 6 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">6. How to Request a Refund</h2>
            <p>To initiate a refund, please follow these steps:</p>
            <ol className="list-decimal pl-6 space-y-3">
              <li><strong>Contact Us:</strong> Reach out via email or WhatsApp using the contact information provided on your invoice or our website, or visit the Erina Assistance hub where you made the purchase.</li>
              <li><strong>Provide Details:</strong> Tell us your name, order/booking number, and the reason for the refund.</li>
              <li><strong>Submit Documentation:</strong> Send us the original invoice/receipt (photo or copy) and, if applicable, the service report or RSA booking reference. For product returns, please keep the battery in its original box if possible.</li>
              <li><strong>Inspection:</strong> If a battery or part is being returned, our team will inspect it to confirm the issue.</li>
              <li><strong>Approval &amp; Notification:</strong> Once we verify the claim, we will approve the refund and notify you about the refund initiation. Approved refunds are issued to the original payment method by default.</li>
            </ol>
          </section>

          <hr className="border-gray-100 dark:border-gray-800" />

          {/* Section 7 & 8 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            <div className="space-y-3 bg-white dark:bg-gray-900/40 p-6 rounded-2xl border border-gray-100 dark:border-gray-800/80">
              <h3 className="text-lg font-bold text-foreground">Exceptions &amp; Final Sale</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Gift cards are non-refundable.</li>
                <li>Services rendered as described are non-refundable.</li>
                <li>Fees paid to third-party providers arranged by Erina Assistance may not be eligible for refund.</li>
              </ul>
            </div>
            
            <div className="space-y-3 bg-white dark:bg-gray-900/40 p-6 rounded-2xl border border-gray-100 dark:border-gray-800/80">
              <h3 className="text-lg font-bold text-foreground">Disputes &amp; Contact</h3>
              <p className="text-sm">
                If you disagree with a refund decision, please contact our Customer Service Manager at <a href="mailto:manager@erinaassistance.com" className="text-primary hover:underline">manager@erinaassistance.com</a>. Final determinations rest with Erina Assistance management.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900/40 p-6 rounded-2xl border border-gray-100 dark:border-gray-800/80 space-y-2 text-sm mt-6">
            <span className="font-bold text-foreground block">Erina Assistance Contact Information</span>
            <span className="block text-foreground/75">Website: www.erinaassistance.com</span>
            <span className="block text-foreground/75">Email: <a href="mailto:info@erinaassistance.com" className="text-primary hover:underline font-semibold">info@erinaassistance.com</a></span>
            <span className="block text-foreground/75">Phone: +91 73400 66655</span>
          </div>

        </motion.div>

        {/* Footer info inside refund page */}
        <div className="mt-16 border-t border-gray-100 dark:border-gray-800/80 pt-8 text-center text-xs text-foreground/50">
          <p>&copy; {new Date().getFullYear()} Erina Assistance Pvt. Ltd. All rights reserved.</p>
          <p className="mt-1">बेंगलुरु, कर्नाटक, भारत | Compliance: Consumer Protection Act, 2019</p>
        </div>

      </div>
    </div>
  );
}

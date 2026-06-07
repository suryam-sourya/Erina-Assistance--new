"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Shield, ArrowLeft, Calendar, Eye } from 'lucide-react';

export default function PrivacyPage() {
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
                <Eye size={24} />
              </div>
              <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">Legal Policy</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-foreground mb-6">Privacy Policy</h1>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-foreground/60 border-y border-gray-100 dark:border-gray-800/80 py-4">
              <span className="flex items-center gap-1.5 font-medium">
                <Calendar size={16} className="text-primary" />
                Last Updated: 7/06/2026
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Shield size={16} className="text-primary" />
                Compliant with DPDP Act, 2023
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
              Erina Assistance and its affiliates respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and protect your personal and non-personal information when you use our website and services. By visiting or using our website (the “Site”) or otherwise providing us with your information, you agree to the practices described in this policy.
            </p>
          </div>

          <div className="space-y-4">
            <p>
              “Personal Information” refers to any information that can be used to identify you, such as your name, address, telephone number, date of birth, email address, vehicle details, etc. “Non-Personal Information” means data that cannot personally identify you (for example, aggregated usage data, IP address in anonymised form, browser type, etc.). Please read this policy carefully. If you do not agree with any part of this policy, you should not use our Site or services.
            </p>
          </div>

          <hr className="border-gray-100 dark:border-gray-800" />

          {/* Section 1 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Information We Collect</h2>
            
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-foreground">Personal Information</h3>
              <p>
                Erina Assistance collects Personal Information only when it is relevant and necessary to provide our services. We collect Personal Information when, for example, you:
              </p>
              <ul className="list-disc pl-6 space-y-3">
                <li><strong>Purchase or Register or Book a Service:</strong> When you create an account, schedule roadside assistance, or register for services, we may collect your name, address, telephone number, email address, vehicle details (such as make, model, license plate, VIN), and any other information necessary to fulfil your request.</li>
                <li><strong>Contact Customer Support:</strong> If you contact us by phone, email, or live chat, we may collect the information you provide (such as your name, contact details, and the content of your communication) to assist you.</li>
                <li><strong>Participate in Promotions or Surveys:</strong> If you enter a contest, sweepstakes, survey, or promotion, we may collect your contact information and any other information you choose to provide (such as preferences or feedback).</li>
                <li><strong>Subscribe to Newsletters or Mailing Lists:</strong> When you subscribe to our newsletter or marketing communications, we collect your name and email address.</li>
                <li><strong>Apply for a Job:</strong> When you apply for a job with Erina Assistance, we collect information such as your resume details, employment history, and contact information.</li>
                <li><strong>Submit Feedback or Upload Content:</strong> If you submit reviews, comments, or other content on our Site or social media pages, we may collect any personal information included in that content. Be aware that such information may be visible to other users.</li>
              </ul>
              <p className="text-sm text-foreground/60 font-medium">
                You are not required to provide Personal Information when simply browsing the Site. However, certain features or services may be unavailable if you choose not to provide required information.
              </p>
            </div>

            <div className="space-y-4 pt-4">
              <h3 className="text-lg font-bold text-foreground">Non-Personal Information</h3>
              <p>
                When you visit our Site or use our services, we may automatically collect certain non-personal or aggregated information to help us improve the Site and our services. This includes:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Device and Usage Data:</strong> Technical details of your visit to the Site, such as your IP address (anonymized), browser type (e.g., Chrome, Firefox, Safari), operating system (e.g., Windows, Android, iOS), and referring URL.</li>
                <li><strong>Website Interaction Data:</strong> Time spent on the Site, pages viewed, date and time of access, clickstream data, and other usage statistics.</li>
                <li><strong>Location Data:</strong> General location data derived from your IP address or, if you grant permission, more precise GPS location information for dispatching.</li>
                <li><strong>Cookies and Similar Technologies:</strong> Cookies, pixel tags, and similar tools to gather anonymous browsing pattern statistics.</li>
              </ul>
            </div>
          </section>

          <hr className="border-gray-100 dark:border-gray-800" />

          {/* Section 2 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Collected Information Use and Sharing</h2>
            <p>
              <strong>Data Use:</strong> We use the Personal Information you provide for the purposes for which you provided it (for example, to fulfil your service request, register you for a promotion, or send you updates). We use Non-Personal Information to understand site usage and to improve the Site and our services.
            </p>
            <p>
              <strong>Data Sharing:</strong> We may share your information in the following ways:
            </p>
            <ul className="list-disc pl-6 space-y-3">
              <li><strong>Service Providers and Partners:</strong> We engage trusted third-party companies and individuals to perform tasks on our behalf (such as payment processing, website hosting, email delivery, customer support, marketing, and analytics). They are contractually required to keep it confidential and use it only for the specified purposes.</li>
              <li><strong>Affiliated Companies:</strong> We may share information within our corporate group (including affiliates, subsidiaries, and joint ventures) to manage our operations and provide services following this Privacy Policy.</li>
              <li><strong>Advertisers and Sponsors:</strong> We use Non-Personal Information in aggregate form. This data is always anonymised and does not include any personal details about you. We do not sell or rent your Personal Information to advertisers.</li>
              <li><strong>Legal and Security:</strong> We may disclose your information if required to do so by law, regulation, or legal process (for example, in response to a subpoena, court order, or government inquiry) or to protect legal rights.</li>
            </ul>
          </section>

          <hr className="border-gray-100 dark:border-gray-800" />

          {/* Section 3 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">How We Use Your Information</h2>
            <p>
              Erina Assistance uses your information to provide and improve our services, communicate with you, and ensure the security and efficiency of our Site. Specifically, we may use your information for:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Service Delivery:</strong> To process and complete your requests, bookings, orders, or transactions (for example, scheduling roadside assistance, processing payments, or delivering vehicle services).</li>
              <li><strong>Personalisation:</strong> To tailor our Site and services to your preferences and settings.</li>
              <li><strong>Communication:</strong> To contact you with important information related to your account, service requests, invoices, or reminders.</li>
              <li><strong>Marketing and Promotions:</strong> With your consent, to send you newsletters, promotional materials, or other marketing communications about our offerings.</li>
              <li><strong>Site Administration and Improvement:</strong> To administer, operate, and improve our Site, perform audits, and enhance services.</li>
              <li><strong>Security and Fraud Prevention:</strong> To detect, prevent, and address fraud, unauthorised access, security breaches, and other illegal activities.</li>
              <li><strong>Legal Compliance:</strong> To comply with applicable laws, regulations, and governmental requests.</li>
            </ul>
          </section>

          <hr className="border-gray-100 dark:border-gray-800" />

          {/* Section 4 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Cookies and Tracking Technologies</h2>
            <p>
              We use cookies, web beacons, pixel tags, and similar tracking technologies to improve your experience on our Site. A cookie is a small text file that is placed on your computer or mobile device. Cookies may be “session” cookies (which expire when you close your browser) or “persistent” cookies (which stay on your device for a set period).
            </p>
            <p>
              <strong>Your Choices Regarding Cookies:</strong> Most web browsers are set to accept cookies by default. You can usually adjust your browser settings to refuse cookies, or to notify you when a cookie is set. You can also delete cookies already stored on your device. However, if you disable or refuse cookies, some parts of the Site may not function properly or as intended.
            </p>
          </section>

          <hr className="border-gray-100 dark:border-gray-800" />

          {/* Section 5 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Data Security</h2>
            <p>
              We take the security of your information seriously and strive to protect it. Erina Assistance implements a variety of reasonable administrative, physical, and technical safeguards to secure your Personal Information and prevent unauthorised access, use, or disclosure. For example, we use encryption (such as HTTPS/SSL) when transmitting sensitive data, maintain secure data centres, and restrict access to personal data to authorised personnel only.
            </p>
            <p className="text-sm text-foreground/60">
              However, no security system is impenetrable, and no method of transmission over the Internet or electronic storage is 100% secure. We cannot guarantee the absolute security of your information. In the unlikely event of a data breach, we will take appropriate steps to notify you and any applicable authorities, as required by law.
            </p>
          </section>

          <hr className="border-gray-100 dark:border-gray-800" />

          {/* Section 6 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Data Retention</h2>
            <p>
              Erina Assistance will retain your Personal Information only for as long as necessary to fulfil the purposes for which it was collected, unless a longer retention period is required or permitted by law. We may keep certain information after you close your account or cease using our services if needed to comply with legal obligations, resolve disputes, or prevent fraud. Non-Personal Information may be retained indefinitely for analytics.
            </p>
          </section>

          <hr className="border-gray-100 dark:border-gray-800" />

          {/* Section 7 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Your Choices and Rights</h2>
            <p>
              We provide you with choices regarding the Personal Information you share with us and how we communicate with you:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Access and Correction:</strong> You may review and update certain Personal Information by logging into your account or by contacting us directly.</li>
              <li><strong>Opt-Out of Marketing:</strong> If you no longer wish to receive promotional emails, you may opt out by using the “unsubscribe” link included in those emails or by contacting us at <a href="mailto:privacy@erinaassistance.com" className="text-primary hover:underline">privacy@erinaassistance.com</a>.</li>
              <li><strong>Withdraw Consent:</strong> Where we rely on your consent to process Personal Information, you may withdraw that consent at any time.</li>
              <li><strong>Data Protection Rights:</strong> Under applicable law (e.g., the Digital Personal Data Protection Act, 2023 of India), you may have additional rights such as requesting access, data portability, or requesting deletion of your data. To exercise these rights, please email us at <a href="mailto:privacy@erinaassistance.com" className="text-primary hover:underline">privacy@erinaassistance.com</a>.</li>
            </ul>
          </section>

          <hr className="border-gray-100 dark:border-gray-800" />

          {/* Section 8 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Children’s Privacy</h2>
            <p>
              Our Site and services are not directed to children under the age of 18. Erina Assistance does not knowingly collect Personal Information from children under 18. If we discover that we have inadvertently gathered personal data from a child under 18, we will promptly delete such information.
            </p>
          </section>

          <hr className="border-gray-100 dark:border-gray-800" />

          {/* Section 9 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Contact Information</h2>
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us at:
            </p>
            <div className="bg-white dark:bg-gray-900/40 p-6 rounded-2xl border border-gray-100 dark:border-gray-800/80 space-y-2 text-sm">
              <span className="font-bold text-foreground block">Erina Assistance – Privacy Officer</span>
              <span className="block text-foreground/75">Email: <a href="mailto:privacy@erinaassistance.com" className="text-primary hover:underline font-semibold">privacy@erinaassistance.com</a></span>
              <span className="block text-foreground/75">Address: Shop No. 02, Dinnur Main Road, Kadugodi Colony, Bengaluru, Karnataka — 560067</span>
            </div>
          </section>

        </motion.div>

        {/* Footer info inside privacy page */}
        <div className="mt-16 border-t border-gray-100 dark:border-gray-800/80 pt-8 text-center text-xs text-foreground/50">
          <p>&copy; {new Date().getFullYear()} Erina Assistance Pvt. Ltd. All rights reserved.</p>
          <p className="mt-1">बेंगलुरु, कर्नाटक, भारत | Governing Law: India</p>
        </div>

      </div>
    </div>
  );
}

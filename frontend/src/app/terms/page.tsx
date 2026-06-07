"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Shield, ArrowLeft, Calendar, FileText } from 'lucide-react';

export default function TermsPage() {
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
                <FileText size={24} />
              </div>
              <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">Legal Agreement</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-foreground mb-6">Terms &amp; Conditions</h1>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-foreground/60 border-y border-gray-100 dark:border-gray-800/80 py-4">
              <span className="flex items-center gap-1.5 font-medium">
                <Calendar size={16} className="text-primary" />
                Effective Date: 7/06/2026
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Shield size={16} className="text-primary" />
                Verified Legal Record
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
              This Terms and Conditions page is an electronic record (a User Agreement) under applicable Indian laws (e.g. the Information Technology Act, 2000 and other statutes). It does not require any physical or digital signature. This Agreement is legally binding between you and Erina Assistance and becomes effective upon your acceptance (for example, by using the website). By using the Erina Assistance website, you confirm that you understand, agree to, and consent to this User Agreement. If you do not agree with any of these terms, please do not use the website.
            </p>
          </div>

          <div>
            <p>
              The Erina Assistance website is an online platform that offers services related to batteries and vehicle assistance. Customers can use the site to book service appointments (such as battery charging, maintenance, or replacements), register newly purchased products (provided brand’s forms), locate nearby service Hubs or technicians, avail warranty support, and determine the correct battery fit for their vehicle application.
            </p>
            <p className="text-sm text-foreground/60 mt-2 font-medium">
              Effective Date: This User Agreement is effective from 00:00 hours (Indian Standard Time) on 18th July 2023.
            </p>
          </div>

          <hr className="border-gray-100 dark:border-gray-800" />

          {/* Definitions Section */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Definitions &amp; Interpretation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm">
              <div className="bg-white dark:bg-gray-900/40 p-5 rounded-2xl border border-gray-100 dark:border-gray-800/80">
                <span className="font-bold text-foreground block mb-1">“Erina Assistance”</span>
                Means Erina Assistance Private Limited (and its subsidiaries, affiliates or associate companies). The terms “we/us/our” refer to Erina Assistance.
              </div>
              <div className="bg-white dark:bg-gray-900/40 p-5 rounded-2xl border border-gray-100 dark:border-gray-800/80">
                <span className="font-bold text-foreground block mb-1">“Laws”</span>
                Refers to applicable Indian statutes and regulations (e.g. the Information Technology Act, 2000 and the Digital Personal Data Protection Act, 2023) and any rules, regulations, or amendments made under them.
              </div>
              <div className="bg-white dark:bg-gray-900/40 p-5 rounded-2xl border border-gray-100 dark:border-gray-800/80">
                <span className="font-bold text-foreground block mb-1">“Force Majeure Event”</span>
                Means any event beyond Erina’s reasonable control (such as acts of God, fire, flood, earthquake, epidemic, war, strike, riot, government action, sabotage, hacking of the website, etc.) that prevents Erina from fulfilling its obligations.
              </div>
              <div className="bg-white dark:bg-gray-900/40 p-5 rounded-2xl border border-gray-100 dark:border-gray-800/80">
                <span className="font-bold text-foreground block mb-1">“Website”</span>
                Means Erina Assistance’s website used to provide its services (for example, domain names such as ‘www.erinaassistance.com’ or similar).
              </div>
              <div className="bg-white dark:bg-gray-900/40 p-5 rounded-2xl border border-gray-100 dark:border-gray-800/80">
                <span className="font-bold text-foreground block mb-1">“Personal Information”</span>
                Means information that can be used to identify you (such as name, address, email, phone number, etc.) and any sensitive personal data as defined by law.
              </div>
              <div className="bg-white dark:bg-gray-900/40 p-5 rounded-2xl border border-gray-100 dark:border-gray-800/80">
                <span className="font-bold text-foreground block mb-1">“User Generated Content”</span>
                Means any content (such as reviews or feedback) that users post on the Website, as described in clause 12 of the General Terms.
              </div>
            </div>
            <p className="text-sm text-foreground/70 mt-4">
              <strong>Structure:</strong> This Agreement is divided into three parts: Part I – Privacy Policy, Part II – Terms of Use, and Part III – General Terms. You should read the Privacy Policy and the Terms of Use together with these General Terms at all times.
            </p>
            <p className="text-sm text-foreground/70">
              <strong>Changes:</strong> Erina Assistance may change this User Agreement at any time without notice. To stay informed, please review this page periodically.
            </p>
          </section>

          <hr className="border-gray-100 dark:border-gray-800" />

          {/* Part I */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Part I: Privacy Policy</h2>
            <p>
              The Privacy Policy for Erina Assistance (available on our website) is part of this User Agreement and governs how we collect, use, store, and transfer your information. Please read it carefully along with these Terms.
            </p>
          </section>

          <hr className="border-gray-100 dark:border-gray-800" />

          {/* Part II */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Part II: Terms of Use</h2>
            
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-foreground">A. Eligibility to Use</h3>
              <p>
                Use of the Website is available only to persons who can form legally binding contracts under Indian law. This excludes persons who are legally incapable of contracting (such as minors or undischarged insolvents). Erina Assistance reserves the right to refuse access to any new user or to terminate an existing user’s access at any time, without giving any reason.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-foreground">B. User Information, Password, and Security</h3>
              <p>
                You are responsible for maintaining the accuracy and security of your account information. You must not host, display, upload, modify, publish, transmit, update or share any information on the Website that is:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Fraudulent or inaccurate;</li>
                <li>Defamatory, obscene, abusive, harassing, blasphemous, invasive of another’s privacy, hateful, or racially/ethnically objectionable;</li>
                <li>Pornographic, paedophilic, or otherwise illegal;</li>
                <li>Threatening, violent, or inciting illegal behaviour;</li>
                <li>Infringing on any patent, trademark, copyright or other proprietary rights;</li>
                <li>Deceptive or misleading about its origin, or grossly offensive;</li>
                <li>Impersonating another person;</li>
                <li>Containing viruses, worms, or malicious code;</li>
                <li>Promoting terrorism, money laundering, gambling, or other unlawful activities;</li>
                <li>Political campaigning or unsolicited advertising (spam).</li>
              </ul>
              <p>
                If you provide any information that is untrue, inaccurate, outdated or incomplete, or if Erina Assistance has reasonable grounds to suspect that your information is false, Erina may suspend or terminate your account and refuse any further use of the Website.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-foreground">C. User Obligations</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Erina grants you a limited, revocable license to access and use the Website and Services, subject to this Agreement. You agree to use the Website and its materials only for purposes permitted by this Agreement and all applicable laws and regulations.</li>
                <li>You agree not to access (or attempt to access) the Website by any means other than through the interface provided by Erina. In particular, you shall not use any automated tools (robots, scripts, spiders, “deep-link” bypasses, etc.) to copy, monitor, or reproduce any portion of the Website’s content or structure.</li>
                <li>You acknowledge that content from other users may appear on the Website (for example, reviews). Erina is not responsible for any such user-generated content and disclaims all liability in connection with it. You may report any content you find objectionable using the procedures described on the site.</li>
                <li>If the Website allows you to post or upload any material, you must ensure that it complies with the rules above and with all applicable laws.</li>
                <li>You alone are responsible for any breach of your obligations under this Agreement and for any consequences of such a breach (including any losses or damages Erina may suffer).</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-foreground">D. Use of Materials</h3>
              <p>
                Erina grants you a non-exclusive, freely revocable (upon notice), non-transferable right to view, download, and print product catalogues or other materials available on the Website for personal, informational, and internal use only.
              </p>
              <p>
                You must not modify or alter any of these materials. You must not distribute, sell, rent, lease, license or otherwise make any of the materials available to others. You also must not remove any copyright, trademark or other proprietary notices from the materials.
              </p>
              <p>
                This limited license does not include the design, layout or look and feel of the Website. Those elements are protected by intellectual property rights and may not be copied or imitated without Erina Assistance’s express permission.
              </p>
            </div>

            <div className="space-y-4 bg-primary/5 rounded-3xl p-6 md:p-8 border border-primary/10">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Shield size={20} className="text-primary" />
                E. Service Booking Terms and Conditions
              </h3>
              <ul className="space-y-3 text-sm">
                <li><strong>First Responders:</strong> Erina Assistance provides a platform to book services (such as battery servicing or roadside assistance) from enrolled service providers. The actual services will be delivered by independent or In-house technicians (“First Responders”) who may or may not be affiliated with Erina Assistance. While Erina Assistance may select, train and enable these First Responders, it is not responsible for their service quality or any commitments they make.</li>
                <li><strong>No Mediation:</strong> Erina Assistance is not a party to any contract between you and the First Responders/Technicians. We do not guarantee that you and the service provider will complete any transactions. Erina Assistance does not mediate or resolve any disputes between you and the provider.</li>
                <li><strong>Service Availability:</strong> Service via this platform is available only in select locations and is subject to the availability and willingness of First Responders. Even within a location, the service may only be available at certain times or if a provider is available. Erina Assistance does not control the interest or availability of any First Responder.</li>
                <li><strong>Payments:</strong> Erina Assistance never takes title to or possession of your products during the service call. Any service fees (for example, charging a dead battery or topping up distilled water) or parts are payable directly to the Technician’s provided QR Code or Payment links or Dealer. Erina Assistance is not involved in such CASH payments.</li>
                <li><strong>Non-Erina Products:</strong> Erina is not liable for any service performed on products not manufactured by Erina Assistance. If you use our booking platform for non-Erina products, you do so at your own risk. All services and products listed on the Website are offered by Erina Assistance, and all prices displayed are It’s Maximum Retail Prices (MRPs) for those services/products. MRPs are subject to change at any time without notice.</li>
                <li><strong>Payment Gateway:</strong> If you pay via the Website’s payment gateway, those transactions are subject to the terms of the payment gateway provider. You are responsible for any gateway fees, taxes or charges. All payment issues or disputes must be resolved directly with the payment provider or the service provider; Erina Assistance will not involve itself in those disputes.</li>
              </ul>
            </div>
          </section>

          <hr className="border-gray-100 dark:border-gray-800" />

          {/* Part III */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Part III: General Terms</h2>
            
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-foreground">A. Usage Conduct</h3>
              <p>
                You must provide and maintain all equipment (computer, smartphone, internet connection, etc.) needed to access and use the Website. You agree to use the Website only for lawful purposes and under this Agreement. Erina Assistance grants you a personal, non-exclusive, non-transferable, revocable license to use the Website and its services solely for personal, non-commercial purposes (the “Restricted Purpose”).
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-bold text-foreground">B. Representations, Warranties and Covenants</h3>
              <p>
                You represent and warrant that all information you provide to Erina Assistance is authentic, correct, and current, and that you have all necessary rights or consents to provide that information. You agree not to interfere with the proper working of the Website or with any other person’s use of it. You access this Website voluntarily and at your own risk. You confirm that you are at least 18 years old.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-bold text-foreground">C. Intellectual Property Rights</h3>
              <p>
                The Website and all of its content (text, graphics, design, source code, etc.) are owned or controlled by Erina Assistance and are protected by copyright, patent, trademark and other intellectual property laws. The Marks displayed on the Website are the property of Erina Assistance or its licensors.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-bold text-foreground">D. Limitation of Liability</h3>
              <p>
                Erina Assistance provides the Website and Services “as is” and makes no warranty that they will meet your requirements, be uninterrupted, timely, secure, or error-free. To the maximum extent allowed by law, Erina Assistance will have no liability arising from your use of the website. To the fullest extent permitted by law, Erina Assistance will not be liable for any indirect, incidental, special, punitive, consequential or exemplary damages.
              </p>
              <p>
                By using this platform, you agree that Erina Assistance will not be held responsible for any uncontrollable security attacks or resulting damages as per the provisions of the IT Act (including sections 43, 43A and 45) and other laws of India.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-bold text-foreground">E. Indemnification</h3>
              <p>
                You agree to indemnify, defend and hold harmless Erina Assistance (including its affiliates, dealers, agents and employees) from and against any losses, liabilities, damages, claims, fines, penalties, costs and expenses (including attorneys’ fees) arising out of or related to any breach by you of this Agreement.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-bold text-foreground">F. Geographical Limit</h3>
              <p>
                Unless stated otherwise, the services provided through this Website are intended for use within India. Erina Assistance makes no representation that the Website is appropriate or available outside India.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-bold text-foreground">G. Restriction / Cancellation / Termination</h3>
              <p>
                Erina Assistance may, in its sole discretion and without notice, restrict or disable your access to the Website for cause. You may terminate this Agreement by stopping use of the Website.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-bold text-foreground">H. Cookies Policy</h3>
              <p>
                Erina Assistance’s websites use cookies (small text files) to enhance your experience. These cookies help our websites function properly, allow us to analyse visitor behaviour, and personalise content.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Session Cookies:</strong> Remain active only during your visit.</li>
                <li><strong>Functionality Cookies:</strong> Remember your preferences (e.g. language/location).</li>
                <li><strong>Analytical Cookies:</strong> Collect information on how you use the site.</li>
                <li><strong>Advertising Cookies:</strong> Track visits to serve relevant ads.</li>
              </ul>
              <p>
                You can block cookies in the privacy settings of the web browser you are using. Please note that if you block all cookies, you may not be able to access parts of our website.
              </p>
            </div>
          </section>

        </motion.div>

        {/* Footer info inside terms */}
        <div className="mt-16 border-t border-gray-100 dark:border-gray-800/80 pt-8 text-center text-xs text-foreground/50">
          <p>&copy; {new Date().getFullYear()} Erina Assistance Pvt. Ltd. All rights reserved.</p>
          <p className="mt-1"> बेंगलुरु, कर्नाटक, भारत</p>
        </div>

      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Mail, Phone, MapPin, Send, CheckCircle } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    
    // Simulate API call
    setTimeout(() => {
      setSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 500);
  };

  return (
    <>
      <Navbar />
      <main className="py-16 bg-vlink-paper/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-semibold uppercase tracking-widest text-vlink-trust font-mono bg-vlink-trust/10 px-3 py-1 rounded-full">
              Get in touch
            </span>
            <h1 className="text-4xl font-bold text-vlink-trust-deep font-display sm:text-5xl">
              We're here to help you stay safe.
            </h1>
            <p className="text-vlink-ink-soft">
              Have questions about bulk orders for schools/corporations, tag setup, or our API integrations? Send us a message.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start max-w-5xl mx-auto">
            {/* Contact details */}
            <div className="lg:col-span-5 space-y-8 bg-vlink-trust-deep text-white p-8 rounded-3xl border border-vlink-trust">
              <h3 className="text-2xl font-bold font-display">Contact Information</h3>
              <p className="text-sm text-vlink-paper/70 leading-relaxed">
                Reach out to our customer advocacy or partnership teams. We are available 24/7 for urgent profile inquiries.
              </p>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <Mail className="w-5 h-5 text-vlink-pulse" />
                  <div>
                    <h4 className="text-xs font-bold font-mono text-vlink-paper/75 uppercase tracking-wider">Email Us</h4>
                    <p className="text-sm">support@virtallinkai.com</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Phone className="w-5 h-5 text-vlink-pulse" />
                  <div>
                    <h4 className="text-xs font-bold font-mono text-vlink-paper/75 uppercase tracking-wider">Call Advocacy</h4>
                    <p className="text-sm">+91 22 8887 7766</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <MapPin className="w-5 h-5 text-vlink-pulse" />
                  <div>
                    <h4 className="text-xs font-bold font-mono text-vlink-paper/75 uppercase tracking-wider">Office Location</h4>
                    <p className="text-sm text-vlink-paper/90 leading-relaxed">
                      12, MG Road, Ashok Nagar,<br />Bengaluru, Karnataka 560001
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-7 bg-white p-8 rounded-3xl border border-vlink-line shadow-sm">
              {submitted ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-12 h-12 bg-vlink-trust/10 text-vlink-trust flex items-center justify-center rounded-full mx-auto">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-vlink-trust-deep font-display">Message Sent Successfully!</h3>
                  <p className="text-sm text-vlink-ink-soft max-w-sm mx-auto">
                    Thank you for contacting VitalLink AI. Our support advocacy team will respond within 4-6 hours.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="px-6 py-2.5 bg-vlink-paper text-vlink-trust-deep font-semibold rounded-full text-xs hover:bg-vlink-line transition-colors"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="name" className="text-xs font-semibold text-vlink-trust-deep">Full Name *</label>
                      <input
                        type="text"
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Aanya Verma"
                        className="w-full px-4 py-3 border border-vlink-line rounded-xl text-sm outline-none focus:border-vlink-trust bg-vlink-paper/10"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label htmlFor="email" className="text-xs font-semibold text-vlink-trust-deep">Email Address *</label>
                      <input
                        type="email"
                        id="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="e.g. aanya@verma.com"
                        className="w-full px-4 py-3 border border-vlink-line rounded-xl text-sm outline-none focus:border-vlink-trust bg-vlink-paper/10"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="subject" className="text-xs font-semibold text-vlink-trust-deep">Subject</label>
                    <input
                      type="text"
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="e.g. Inquiry about tag materials"
                      className="w-full px-4 py-3 border border-vlink-line rounded-xl text-sm outline-none focus:border-vlink-trust bg-vlink-paper/10"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="message" className="text-xs font-semibold text-vlink-trust-deep">Message *</label>
                    <textarea
                      id="message"
                      rows={5}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Type your message here..."
                      className="w-full px-4 py-3 border border-vlink-line rounded-xl text-sm outline-none focus:border-vlink-trust bg-vlink-paper/10 resize-none"
                    ></textarea>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-vlink-pulse hover:bg-vlink-pulse/95 text-white font-bold rounded-full text-sm shadow-md transition-colors"
                    >
                      <Send className="w-4 h-4" /> Send Message
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

import React, { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { SiteSetting } from "../types";

interface ContactProps {
  settings: SiteSetting | null;
  lang: "EN" | "BN";
}

export default function ContactUs({ settings, lang }: ContactProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setError("Please fill out all required fields.");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(data.message || "Thank you for contacting us! We've received your message.");
        setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      } else {
        setError(data.error || "Failed to submit inquiry. Please try again.");
      }
    } catch (err) {
      setError("An unexpected network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const email = settings?.email || "admissions@sunrisekindergarten.edu";
  const phone1 = settings?.phone1 || "+880 1711-123456";
  const phone2 = settings?.phone2 || "+880 1811-987654";
  const address = settings?.address || "Road 12, Sector 4, Uttara, Dhaka, Bangladesh";

  return (
    <div className="py-20 md:py-28 space-y-16">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <span className="font-serif italic text-base text-amber-600 block">
          {lang === "EN" ? "GET IN TOUCH" : "যোগাযোগ করুন"}
        </span>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-[#0F172A] leading-tight">
          {lang === "EN" ? "Contact Our Administration" : "প্রশাসনিক দপ্তরের সাথে যোগাযোগ"}
        </h1>
        <p className="text-slate-500 max-w-2xl mx-auto text-base font-light">
          {lang === "EN"
            ? "Have dynamic inquiries or need a personal guided campus tour? Reach out directly via our form or hotline."
            : "আমাদের স্কুল ক্যাম্পাস পরিদর্শনের জন্য অথবা যেকোনো তথ্যের জন্য সরাসরি আমাদের বার্তা পাঠান বা যোগাযোগ করুন।"}
        </p>
      </section>

      {/* Cards & Form Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left 5-Columns: Office Details & Map */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-[#0F172A] text-white p-8 rounded-[2rem] space-y-8 shadow-xl relative overflow-hidden border border-white/5">
            <div className="absolute top-0 right-0 h-48 w-48 bg-amber-500/10 rounded-full blur-3xl" />
            <h3 className="text-xl font-serif font-bold text-white border-b border-slate-800 pb-3">Campus Directory</h3>

            <div className="space-y-6 text-sm">
              <div className="flex gap-4">
                <div className="h-10 w-10 bg-white/5 rounded-xl flex items-center justify-center shrink-0 border border-white/10">
                  <MapPin className="text-amber-400" size={18} />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-slate-200">Main Office Address</h4>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed">{address}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="h-10 w-10 bg-white/5 rounded-xl flex items-center justify-center shrink-0 border border-white/10">
                  <Phone className="text-amber-400" size={18} />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-slate-200">Helpdesks & Hotline</h4>
                  <p className="text-slate-400 text-xs mt-1">{phone1}</p>
                  {phone2 && <p className="text-slate-400 text-xs mt-0.5">{phone2}</p>}
                </div>
              </div>

              <div className="flex gap-4">
                <div className="h-10 w-10 bg-white/5 rounded-xl flex items-center justify-center shrink-0 border border-white/10">
                  <Mail className="text-amber-400" size={18} />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-slate-200">Registrar General Email</h4>
                  <p className="text-slate-400 text-xs mt-1 truncate">{email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Embedded Map */}
          <div className="rounded-[2rem] overflow-hidden border border-slate-100 shadow-xl h-64 relative bg-slate-100 transform -rotate-0.5 hover:rotate-0 transition-transform duration-300">
            <iframe
              title="Campus Map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3648.2415124036154!2d90.3957!3d23.8759!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c425!2sUttara%20Dhaka!5e0!3m2!1sen!2sbd!4v1600000000"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
            />
          </div>
        </div>

        {/* Right 7-Columns: Contact Form */}
        <div className="lg:col-span-7 bg-white p-8 sm:p-12 rounded-[2rem] border border-slate-100 shadow-xl space-y-6 transform rotate-0.5">
          <h3 className="text-xl font-serif font-bold text-[#0F172A] border-b border-slate-100 pb-3">Send an Electronic Message</h3>

          {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-sm font-medium">
              ✓ {success}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-sm font-medium">
              ⚠ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block uppercase tracking-wider">Your Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500 rounded-xl px-4 py-3 outline-none transition"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block uppercase tracking-wider">Your Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. john@example.com"
                  className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500 rounded-xl px-4 py-3 outline-none transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block uppercase tracking-wider">Contact Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. +880 1700..."
                  className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500 rounded-xl px-4 py-3 outline-none transition"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block uppercase tracking-wider">Subject of inquiry</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g. Admission Criteria"
                  className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500 rounded-xl px-4 py-3 outline-none transition"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 block uppercase tracking-wider">Detailed Inquiry Message *</label>
              <textarea
                required
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Write your detailed questions or comments here..."
                className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500 rounded-xl px-4 py-3 outline-none transition resize-none font-light"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0F172A] hover:bg-transparent text-white hover:text-[#0F172A] border-2 border-[#0F172A] font-bold py-4 rounded-full text-xs tracking-widest uppercase transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send size={15} />
                  <span>Send Electronic Inquiry</span>
                </>
              )}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

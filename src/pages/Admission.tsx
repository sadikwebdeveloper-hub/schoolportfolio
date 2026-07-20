import React, { useState, useRef } from "react";
import { GraduationCap, Upload, CheckCircle2, AlertCircle } from "lucide-react";

interface AdmissionProps {
  lang: "EN" | "BN";
}

export default function Admission({ lang }: AdmissionProps) {
  const [formData, setFormData] = useState({
    studentName: "",
    dob: "",
    classApplyingFor: "Play",
    guardianName: "",
    guardianPhone: "",
    guardianEmail: "",
    address: "",
  });

  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const classesList = ["Play", "Nursery", "KG", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5"];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setDocumentFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.studentName ||
      !formData.dob ||
      !formData.classApplyingFor ||
      !formData.guardianName ||
      !formData.guardianPhone ||
      !formData.guardianEmail ||
      !formData.address
    ) {
      setError("Please fill out all student and guardian parameters.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const payload = new FormData();
      payload.append("studentName", formData.studentName);
      payload.append("dob", formData.dob);
      payload.append("classApplyingFor", formData.classApplyingFor);
      payload.append("guardianName", formData.guardianName);
      payload.append("guardianPhone", formData.guardianPhone);
      payload.append("guardianEmail", formData.guardianEmail);
      payload.append("address", formData.address);

      if (documentFile) {
        payload.append("document", documentFile);
      }

      const res = await fetch("/api/admissions", {
        method: "POST",
        body: payload, // multipart/form-data
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(`SUN-${data.application.id}`);
        setFormData({
          studentName: "",
          dob: "",
          classApplyingFor: "Play",
          guardianName: "",
          guardianPhone: "",
          guardianEmail: "",
          address: "",
        });
        setDocumentFile(null);
      } else {
        setError(data.error || "Submission failed. Please try again.");
      }
    } catch (err) {
      setError("A networking or gateway error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-20 md:py-28 space-y-16">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <span className="font-serif italic text-base text-amber-600 block">
          {lang === "EN" ? "ONLINE PORTAL" : "ভর্তি পোর্টাল"}
        </span>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-[#0F172A] leading-tight">
          {lang === "EN" ? "Admission Registration Form" : "অনলাইন ভর্তি আবেদন ফরম"}
        </h1>
        <p className="text-slate-500 max-w-2xl mx-auto text-base font-light">
          {lang === "EN"
            ? "Submit your child's legal credentials below to apply for standard enrollment. Successful submitters receive a structured PDF checklist and confirm email."
            : "আপনার সন্তানের ভর্তির জন্য নিচের ফরমটি পূরণ করুন। আবেদন সফল হলে আপনার মেইলে একটি কনফার্মেশন পাঠানো হবে।"}
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {success ? (
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 sm:p-14 text-center space-y-6 shadow-xl">
            <div className="h-20 w-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 size={40} />
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-serif font-bold text-[#0F172A]">Application Submitted!</h2>
              <p className="text-slate-500 text-sm max-w-md mx-auto font-light">
                The admissions desk is currently reviewing the legal credentials. A formal decision notification has been dispatched to your email.
              </p>
            </div>
            <div className="bg-amber-50/50 px-6 py-4 rounded-2xl border border-amber-100 inline-block font-mono text-xs text-slate-700">
              <strong>Your Reference ID:</strong> <span className="text-amber-600 font-bold">{success}</span>
            </div>
            <div className="pt-4">
              <button
                onClick={() => setSuccess(null)}
                className="bg-[#0F172A] hover:bg-transparent text-white hover:text-[#0F172A] border-2 border-[#0F172A] font-bold text-xs px-8 py-3.5 rounded-full tracking-widest uppercase transition-all duration-300 shadow-md"
              >
                Submit Another Application
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-xl overflow-hidden transform rotate-0.5">
            <div className="bg-[#0F172A] text-white px-8 py-8 flex items-center gap-4 border-b border-amber-400">
              <div className="p-3 bg-white/5 rounded-2xl">
                <GraduationCap className="text-amber-400 animate-pulse" size={32} />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg sm:text-xl">Student Admission Gateway</h3>
                <p className="text-slate-400 text-xs mt-1 uppercase tracking-widest font-mono">Session: 2026 - 2027 Academic Year</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 sm:p-12 space-y-10">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-sm font-medium flex items-center gap-2">
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              {/* A. Student Particulars */}
              <div className="space-y-6">
                <h4 className="font-serif font-bold text-[#0F172A] text-base border-b border-slate-100 pb-3">
                  A. Student Particulars
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 block uppercase tracking-wider">Student's Full Legal Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.studentName}
                      onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                      placeholder="e.g. Safwan Hasan"
                      className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500 rounded-xl px-4 py-3 outline-none transition"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 block uppercase tracking-wider">Date of Birth *</label>
                    <input
                      type="date"
                      required
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                      className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500 rounded-xl px-4 py-3 outline-none transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 block uppercase tracking-wider">Class Applying For *</label>
                    <select
                      value={formData.classApplyingFor}
                      onChange={(e) => setFormData({ ...formData, classApplyingFor: e.target.value })}
                      className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500 rounded-xl px-4 py-3 outline-none transition"
                    >
                      {classesList.map((cls) => (
                        <option key={cls} value={cls}>
                          {cls}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 block uppercase tracking-wider">Birth Certificate / Transcript PDF</label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-200 hover:border-amber-500 cursor-pointer bg-slate-50 hover:bg-white p-3 rounded-xl transition flex items-center justify-center gap-2 text-xs text-slate-500"
                    >
                      <Upload size={14} className="text-slate-400" />
                      <span>{documentFile ? documentFile.name : "Select or drag file"}</span>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                  </div>
                </div>
              </div>

              {/* B. Guardian Particulars */}
              <div className="space-y-6">
                <h4 className="font-serif font-bold text-[#0F172A] text-base border-b border-slate-100 pb-3">
                  B. Parent & Guardian Particulars
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 block uppercase tracking-wider">Guardian's Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.guardianName}
                      onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                      placeholder="e.g. Mahmudul Hasan"
                      className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500 rounded-xl px-4 py-3 outline-none transition"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 block uppercase tracking-wider">Guardian's Mobile Phone *</label>
                    <input
                      type="tel"
                      required
                      value={formData.guardianPhone}
                      onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                      placeholder="e.g. +880 1711..."
                      className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500 rounded-xl px-4 py-3 outline-none transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 block uppercase tracking-wider">Guardian's Email Address *</label>
                    <input
                      type="email"
                      required
                      value={formData.guardianEmail}
                      onChange={(e) => setFormData({ ...formData, guardianEmail: e.target.value })}
                      placeholder="e.g. parent@example.com"
                      className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500 rounded-xl px-4 py-3 outline-none transition"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 block uppercase tracking-wider">Residential Address *</label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Complete current residential address"
                      className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500 rounded-xl px-4 py-3 outline-none transition"
                    />
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-6 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#0F172A] hover:bg-transparent text-white hover:text-[#0F172A] border-2 border-[#0F172A] font-bold py-4 rounded-full text-xs tracking-widest uppercase transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <GraduationCap size={16} />
                      <span>Submit Secure Application</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </section>
    </div>
  );
}

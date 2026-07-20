import React from "react";
import { Mail, Facebook, Twitter, Linkedin } from "lucide-react";
import { TeacherStaff } from "../types";

interface TeachersProps {
  teachers: TeacherStaff[];
  lang: "EN" | "BN";
}

export default function Teachers({ teachers, lang }: TeachersProps) {
  return (
    <div className="py-20 md:py-28 space-y-16">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <span className="font-serif italic text-base text-amber-600 block">
          {lang === "EN" ? "FACULTY DIRECTORY" : "শিক্ষক মণ্ডলী"}
        </span>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-[#0F172A] leading-tight">
          {lang === "EN" ? "Meet Our Certified Educators" : "আমাদের নিবেদিত শিক্ষক মণ্ডলী"}
        </h1>
        <p className="text-slate-500 max-w-2xl mx-auto text-base font-light">
          {lang === "EN"
            ? "Our teachers hold prestigious certifications and are trained in modern early-childhood interactive pedagogy."
            : "আমাদের শিক্ষক শিক্ষিকাবৃন্দ অত্যন্ত অভিজ্ঞ, স্নেহশীল এবং আধুনিক শিক্ষাদান পদ্ধতিতে বিশেষভাবে প্রশিক্ষিত।"}
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {teachers.length === 0 ? (
          <p className="text-center text-slate-400 py-12">No educators added yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {teachers.map((t, idx) => (
              <div
                key={t.id}
                className={`bg-white border border-slate-100 rounded-[2rem] p-6 shadow-xl hover:shadow-2xl transition-all duration-300 text-center flex flex-col justify-between transform ${
                  idx % 4 === 0 ? "-rotate-1" : idx % 4 === 1 ? "rotate-1" : idx % 4 === 2 ? "-rotate-2" : "rotate-2"
                } hover:rotate-0`}
              >
                <div>
                  {t.photoUrl ? (
                    <img
                      src={t.photoUrl}
                      alt={t.name}
                      referrerPolicy="no-referrer"
                      className="h-32 w-32 rounded-full mx-auto object-cover border-4 border-white shadow-lg ring-4 ring-amber-50"
                    />
                  ) : (
                    <div className="h-32 w-32 rounded-full bg-slate-100 text-slate-400 font-bold mx-auto flex items-center justify-center text-3xl border-4 border-white shadow-lg ring-4 ring-amber-50">
                      {t.name.charAt(0)}
                    </div>
                  )}
                  <h3 className="font-serif font-bold text-[#0F172A] text-lg mt-5 leading-tight">
                    {t.name}
                  </h3>
                  <p className="text-amber-600 text-xs font-semibold mt-1 font-serif italic">
                    {t.designation}
                  </p>
                  <p className="text-slate-500 text-xs mt-3 leading-relaxed font-light">
                    {t.bio}
                  </p>
                </div>

                {/* Social/Mail Links */}
                {(t.email || t.facebook || t.twitter || t.linkedin) && (
                  <div className="flex justify-center gap-3.5 pt-4 mt-6 border-t border-slate-100">
                    {t.email && (
                      <a href={`mailto:${t.email}`} className="text-slate-400 hover:text-amber-500 transition">
                        <Mail size={15} />
                      </a>
                    )}
                    {t.facebook && (
                      <a href={t.facebook} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-amber-500 transition">
                        <Facebook size={15} />
                      </a>
                    )}
                    {t.twitter && (
                      <a href={t.twitter} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-amber-500 transition">
                        <Twitter size={15} />
                      </a>
                    )}
                    {t.linkedin && (
                      <a href={t.linkedin} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-amber-500 transition">
                        <Linkedin size={15} />
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

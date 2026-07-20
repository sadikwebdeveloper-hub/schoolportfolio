import React from "react";
import { Authority } from "../types";

interface AuthoritiesProps {
  authorities: Authority[];
  lang: "EN" | "BN";
}

export default function Authorities({ authorities, lang }: AuthoritiesProps) {
  return (
    <div className="py-20 md:py-28 space-y-16">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <span className="font-serif italic text-base text-amber-600 block">
          {lang === "EN" ? "School Administration" : "প্রশাসন ও পরিচালনা পর্ষদ"}
        </span>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-[#0F172A] leading-tight">
          {lang === "EN" ? "Messages from School Leadership" : "স্কুল নেতৃত্বের বাণী"}
        </h1>
        <p className="text-slate-500 max-w-2xl mx-auto text-base font-light">
          {lang === "EN"
            ? "Read notes and guiding visions from our respected Governing Body Chair and Senior Administrative members."
            : "আমাদের সম্মানিত গভর্নিং বডি চেয়ারম্যান এবং অধ্যক্ষ মহোদয়ের মূল্যবান বাণী ও নির্দেশনা পড়ুন।"}
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {authorities.length === 0 ? (
          <p className="text-center text-slate-400 py-12">No administration members specified yet.</p>
        ) : (
          authorities.map((auth, index) => (
            <div
              key={auth.id}
              className={`bg-white rounded-[2.5rem] border border-slate-100 p-8 sm:p-12 shadow-xl flex flex-col ${
                index % 2 === 0 ? "lg:flex-row rotate-0.5" : "lg:flex-row-reverse -rotate-0.5"
              } gap-10 items-center transform hover:rotate-0 transition-transform duration-300`}
            >
              {auth.photoUrl && (
                <div className="w-48 h-48 sm:w-64 sm:h-64 shrink-0 rounded-[2rem] overflow-hidden shadow-2xl relative border-4 border-white ring-4 ring-amber-50">
                  <img
                    src={auth.photoUrl}
                    alt={auth.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="space-y-6 flex-1">
                <div className="space-y-1">
                  <h3 className="font-serif font-bold text-[#0F172A] text-2xl">
                    {auth.name}
                  </h3>
                  <p className="text-amber-600 text-sm font-semibold tracking-wide uppercase font-serif italic">
                    {auth.designation}
                  </p>
                </div>
                <div className="prose prose-slate max-w-none text-slate-600 text-sm sm:text-base leading-relaxed italic relative">
                  <span className="text-6xl text-amber-500/20 absolute -top-8 -left-5 font-serif">“</span>
                  <p className="pl-6 whitespace-pre-wrap font-light">{auth.message}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}

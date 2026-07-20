import React from "react";
import { Achievement } from "../types";

interface AchievementsProps {
  achievements: Achievement[];
  lang: "EN" | "BN";
}

export default function Achievements({ achievements, lang }: AchievementsProps) {
  return (
    <div className="py-20 md:py-28 space-y-16">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <span className="font-serif italic text-base text-amber-600 block">
          {lang === "EN" ? "Honors & Trophies" : "আমাদের গৌরবগাথা"}
        </span>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-[#0F172A] leading-tight">
          {lang === "EN" ? "Milestones & Achievements" : "অর্জন ও গৌরবসমূহ"}
        </h1>
        <p className="text-slate-500 max-w-2xl mx-auto text-base font-light">
          {lang === "EN"
            ? "We are immensely proud of our student bodies and faculty groups who have secured prestigious trophies in external examinations, athletics, robotics, and creative debates."
            : "আমাদের ছাত্র-ছাত্রী ও শিক্ষকবৃন্দের অসামান্য সাফল্য ও গৌরবময় অর্জনসমূহ যা তারা বিভিন্ন প্রতিযোগিতা ও শিক্ষাক্ষেত্রে অর্জন করেছে।"}
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {achievements.length === 0 ? (
          <p className="text-center text-slate-400 py-12">No achievements recorded yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {achievements.map((item, idx) => (
              <div
                key={item.id}
                className={`bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-xl flex flex-col hover:shadow-2xl transition-all duration-300 transform ${
                  idx % 3 === 0 ? "-rotate-1" : idx % 3 === 1 ? "rotate-1" : "rotate-0"
                } hover:rotate-0`}
              >
                {item.imageUrl && (
                  <div className="h-52 relative overflow-hidden bg-slate-50 border-b border-slate-100">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <div className="p-8 flex-1 flex flex-col justify-between space-y-5">
                  <div className="space-y-3">
                    {item.date && (
                      <span className="font-mono text-[9px] text-amber-800 bg-amber-100 px-3 py-1 rounded-full font-bold uppercase tracking-wider inline-block">
                        {item.date}
                      </span>
                    )}
                    <h3 className="font-serif font-bold text-[#0F172A] text-xl leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-slate-500 text-xs leading-relaxed font-light">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

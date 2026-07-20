import React, { useState } from "react";
import { Calendar, Download, Filter, FileSpreadsheet } from "lucide-react";
import { Routine } from "../types";

interface RoutineProps {
  routines: Routine[];
  lang: "EN" | "BN";
}

export default function RoutinePage({ routines, lang }: RoutineProps) {
  const [filterClass, setFilterClass] = useState("All");

  const classesList = ["All", "Play", "Nursery", "KG", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5"];

  const filteredRoutines = filterClass === "All"
    ? routines
    : routines.filter((r) => r.classLevel.toLowerCase() === filterClass.toLowerCase());

  return (
    <div className="py-20 md:py-28 space-y-16">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <span className="font-serif italic text-base text-amber-600 block">
          {lang === "EN" ? "Timetables" : "ক্লাস রুটিন"}
        </span>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-[#0F172A] leading-tight">
          {lang === "EN" ? "Weekly Class Routines" : "সাপ্তাহিক ক্লাস রুটিন"}
        </h1>
        <p className="text-slate-500 max-w-2xl mx-auto text-base font-light">
          {lang === "EN"
            ? "Stay updated with standard lecture slots, weekend guidelines, and dynamic teacher distributions for each grade."
            : "প্রতিটি শ্রেণীর জন্য নির্ধারিত ক্লাস লেকচার রুটিন, সাপ্তাহিক ক্লাস বিভাজন এবং শিক্ষক বণ্টনের রুটিন পিডিএফ ডাউনলোড করুন।"}
        </p>
      </section>

      {/* Filter and Content */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-wrap items-center justify-center gap-2 bg-white p-4 rounded-3xl border border-slate-100 shadow-xl">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center gap-2 px-3">
            <Filter size={14} className="text-amber-500" />
            <span>Class:</span>
          </span>
          {classesList.map((cls) => (
            <button
              key={cls}
              onClick={() => setFilterClass(cls)}
              className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider transition uppercase ${
                filterClass === cls
                  ? "bg-[#0F172A] text-white shadow-md"
                  : "text-slate-600 hover:bg-amber-50 hover:text-amber-700"
              }`}
            >
              {cls}
            </button>
          ))}
        </div>

        {filteredRoutines.length === 0 ? (
          <div className="text-center bg-white border border-slate-100 py-20 rounded-[2.5rem] shadow-xl space-y-4">
            <div className="h-16 w-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <FileSpreadsheet size={28} />
            </div>
            <p className="text-slate-500 text-sm font-light">No class routine available for the selected grade.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredRoutines.map((r, idx) => (
              <div
                key={r.id}
                className={`bg-white border border-slate-100 rounded-[2rem] p-6 shadow-xl flex items-center justify-between gap-6 hover:shadow-2xl transition-all duration-300 transform ${
                  idx % 2 === 0 ? "rotate-0.5" : "-rotate-0.5"
                } hover:rotate-0`}
              >
                <div className="flex items-center gap-4 truncate">
                  <div className="h-14 w-14 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 shadow-inner">
                    <Calendar size={26} />
                  </div>
                  <div className="truncate space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[9px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        ROUTINE
                      </span>
                      <span className="font-mono text-[9px] font-bold text-slate-500 bg-slate-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        Class: {r.classLevel}
                      </span>
                    </div>
                    <h3 className="font-serif font-bold text-[#0F172A] text-base truncate">
                      {r.title}
                    </h3>
                    <p className="text-slate-400 text-xs truncate font-light">{r.description}</p>
                  </div>
                </div>
                <a
                  href={r.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#0F172A] hover:bg-amber-400 hover:text-[#0F172A] text-white p-3.5 rounded-full transition shadow-md shrink-0 border border-transparent hover:border-amber-400"
                >
                  <Download size={16} />
                </a>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

import React from "react";
import { AcademicBlock } from "../types";

interface ContentPageProps {
  blocks: AcademicBlock[];
  section: "brief_history" | "school_feature" | "academic_overview" | "hostel" | "co_curricular";
  lang: "EN" | "BN";
}

export default function ContentPage({ blocks, section, lang }: ContentPageProps) {
  const block = blocks.find((b) => b.section === section);

  if (!block) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center">
        <div className="h-10 w-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 font-serif italic text-sm">Loading block content...</p>
      </div>
    );
  }

  return (
    <div className="py-20 md:py-28 space-y-16">
      {/* Dynamic Header Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <span className="font-serif italic text-base text-amber-600 block">
          {section.toUpperCase().replace("_", " ")}
        </span>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-[#0F172A] max-w-4xl mx-auto leading-tight">
          {block.title}
        </h1>
      </section>

      {/* Main Grid Content */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 sm:p-14 shadow-xl space-y-12 transform rotate-0.5 hover:rotate-0 transition-transform duration-300">
          {block.imageUrl && (
            <img
              src={block.imageUrl}
              alt={block.title}
              referrerPolicy="no-referrer"
              className="w-full h-[320px] sm:h-[420px] md:h-[480px] object-cover rounded-[2rem] shadow-xl border-4 border-white"
            />
          )}
          <div className="prose prose-slate max-w-none">
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-light">
              {block.content}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

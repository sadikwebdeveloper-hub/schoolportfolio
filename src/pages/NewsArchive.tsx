import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, ArrowRight, ArrowLeft } from "lucide-react";
import { NewsPost } from "../types";

interface NewsArchiveProps {
  news: NewsPost[];
  lang: "EN" | "BN";
}

export default function NewsArchive({ news, lang }: NewsArchiveProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;

  // Calculate paginated posts
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = news.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(news.length / postsPerPage);

  return (
    <div className="py-20 md:py-28 space-y-16">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <span className="font-serif italic text-base text-amber-600 block">
          {lang === "EN" ? "NEWSROOM" : "সংবাদ ও বিজ্ঞপ্তি"}
        </span>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-[#0F172A] leading-tight">
          {lang === "EN" ? "All School Announcements & Blog" : "সকল স্কুল সংবাদ ও ব্লগ"}
        </h1>
        <p className="text-slate-500 max-w-2xl mx-auto text-base font-light">
          {lang === "EN"
            ? "Stay updated with academic timelines, sports fixtures, extracurricular achievements, and notifications."
            : "আমাদের শিক্ষাবর্ষের সময়সূচী, ক্রীড়া প্রতিযোগিতা, সহ-শিক্ষা কার্যক্রমের গৌরব ও সকল অফিশিয়াল নোটিশসমূহ সম্পর্কে জানুন।"}
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {news.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl">
            <p className="text-slate-400 font-serif italic">No news articles registered yet.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {currentPosts.map((post, idx) => (
                <div
                  key={post.id}
                  className={`bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-xl hover:shadow-2xl flex flex-col justify-between transform ${
                    idx % 3 === 0 ? "-rotate-1" : idx % 3 === 1 ? "rotate-1" : "rotate-0"
                  } hover:rotate-0 transition-all duration-300`}
                >
                  <div>
                    {post.imageUrl && (
                      <div className="h-52 relative overflow-hidden bg-slate-50 border-b border-slate-100">
                        <img
                          src={post.imageUrl}
                          alt={post.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="p-8 space-y-3">
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                        <Calendar size={12} />
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      </div>
                      <h3 className="font-serif font-bold text-[#0F172A] text-lg leading-snug line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-slate-500 text-xs line-clamp-3 leading-relaxed font-light">
                        {post.content}
                      </p>
                    </div>
                  </div>
                  <div className="p-8 pt-0">
                    <Link
                      to={`/news/${post.slug}`}
                      className="text-[#0F172A] hover:text-amber-600 text-xs font-bold inline-flex items-center gap-1.5 group font-serif italic"
                    >
                      <span>Read Full Article</span>
                      <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 pt-10">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  className="p-3 bg-white border border-slate-200 text-[#0F172A] hover:bg-amber-400 hover:text-[#0F172A] rounded-full transition-all duration-300 disabled:opacity-40 cursor-pointer shadow-md"
                >
                  <ArrowLeft size={16} />
                </button>
                <span className="text-xs font-bold text-slate-600 font-mono">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  className="p-3 bg-white border border-slate-200 text-[#0F172A] hover:bg-amber-400 hover:text-[#0F172A] rounded-full transition-all duration-300 disabled:opacity-40 cursor-pointer shadow-md"
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar } from "lucide-react";
import { NewsPost } from "../types";

export default function NewsDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<NewsPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPost() {
      try {
        setLoading(true);
        const res = await fetch("/api/news");
        if (res.ok) {
          const list = await res.json();
          const found = list.find((p: NewsPost) => p.slug === slug);
          setPost(found || null);
        }
      } catch (err) {
        console.error("Failed to fetch news post:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="py-20 md:py-28 space-y-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div>
          <div className="h-4 w-24 bg-slate-100 rounded mb-6 animate-pulse" />
          <div className="space-y-3">
            <div className="h-4 w-32 bg-slate-100 rounded animate-pulse" />
            <div className="h-10 w-full bg-slate-100 rounded animate-pulse" />
            <div className="h-10 w-2/3 bg-slate-100 rounded animate-pulse" />
          </div>
        </div>
        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 sm:p-14 shadow-xl space-y-8">
          <div className="w-full h-[320px] sm:h-[480px] bg-slate-100 rounded-[2rem] animate-pulse" />
          <div className="space-y-4">
            <div className="h-4 w-full bg-slate-100 rounded animate-pulse" />
            <div className="h-4 w-full bg-slate-100 rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-slate-100 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center space-y-4">
        <h2 className="text-2xl font-serif font-bold text-[#0F172A]">Article Not Found</h2>
        <p className="text-slate-500 font-light">The news article you are looking for has been removed or archived.</p>
        <Link to="/" className="text-amber-600 hover:underline inline-flex items-center gap-1.5 font-bold">
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="py-20 md:py-28 space-y-16">
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/" className="text-slate-500 hover:text-[#0F172A] inline-flex items-center gap-1.5 text-xs font-mono font-bold tracking-wider mb-6">
          <ArrowLeft size={14} className="text-amber-500" />
          <span>BACK TO HOME</span>
        </Link>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <Calendar size={14} className="text-amber-500" />
            <span>{new Date(post.createdAt).toLocaleDateString(undefined, { dateStyle: "long" })}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-[#0F172A] leading-tight">
            {post.title}
          </h1>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 sm:p-14 shadow-xl space-y-8 transform rotate-0.5 hover:rotate-0 transition-transform duration-300">
          {post.imageUrl && (
            <img
              src={post.imageUrl}
              alt={post.title}
              referrerPolicy="no-referrer"
              className="w-full h-[320px] sm:h-[480px] object-cover rounded-[2rem] shadow-xl border-4 border-white"
            />
          )}
          <div className="prose prose-slate max-w-none text-slate-600 text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-light">
            {post.content}
          </div>
        </div>
      </section>
    </div>
  );
}

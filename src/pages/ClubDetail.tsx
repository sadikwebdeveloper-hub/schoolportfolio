import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Users, Image as ImageIcon } from "lucide-react";
import { Club } from "../types";

export default function ClubDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClub() {
      try {
        setLoading(true);
        const res = await fetch(`/api/clubs/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setClub(data);
        } else {
          setClub(null);
        }
      } catch (err) {
        console.error("Failed to fetch club details:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchClub();
  }, [slug]);

  if (loading) {
    return (
      <div className="py-20 space-y-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Skeleton cover banner */}
        <div className="h-64 sm:h-80 md:h-[400px] w-full bg-slate-100 animate-pulse rounded-[2.5rem] flex flex-col justify-end p-8 sm:p-14">
          <div className="h-4 w-24 bg-slate-200 rounded mb-4 animate-pulse" />
          <div className="h-10 w-2/3 bg-slate-200 rounded animate-pulse" />
        </div>

        {/* Skeleton columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Skeleton Left: Overview */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl space-y-6">
              <div className="h-6 w-1/4 bg-slate-100 rounded animate-pulse" />
              <div className="space-y-3">
                <div className="h-4 w-full bg-slate-100 rounded animate-pulse" />
                <div className="h-4 w-full bg-slate-100 rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-slate-100 rounded animate-pulse" />
              </div>
            </div>
          </div>

          {/* Skeleton Right: Members */}
          <div className="lg:col-span-5">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl space-y-6">
              <div className="h-6 w-1/3 bg-slate-100 rounded animate-pulse" />
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-slate-100 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/2 bg-slate-100 rounded animate-pulse" />
                    <div className="h-3 w-1/3 bg-slate-100 rounded animate-pulse" />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-slate-100 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/2 bg-slate-100 rounded animate-pulse" />
                    <div className="h-3 w-1/3 bg-slate-100 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center space-y-4">
        <h2 className="text-2xl font-serif font-bold text-[#0F172A]">Club Not Found</h2>
        <p className="text-slate-500 font-light">The club you are looking for does not exist or has been removed.</p>
        <Link to="/" className="text-amber-600 hover:underline inline-flex items-center gap-1.5 font-bold">
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="py-20 space-y-16">
      {/* Header Cover Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative h-64 sm:h-80 md:h-[400px] rounded-[2.5rem] overflow-hidden shadow-2xl bg-[#0F172A] border border-white/5">
          {club.coverImageUrl ? (
            <img
              src={club.coverImageUrl}
              alt={club.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover opacity-60"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-slate-900/40" />
          )}
          {/* Subtle warm glow overlay */}
          <div className="absolute inset-0 bg-amber-500/5 mix-blend-color-burn" />
          <div className="absolute inset-0 flex flex-col justify-end p-8 sm:p-14 text-white z-10">
            <Link to="/" className="text-amber-400 hover:text-white inline-flex items-center gap-1.5 text-xs mb-4 font-mono font-bold tracking-wider">
              <ArrowLeft size={14} />
              <span>RETURN HOME</span>
            </Link>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white leading-tight">
              {club.name}
            </h1>
          </div>
        </div>
      </section>

      {/* Main Grid: Description + Members / Gallery */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Description */}
        <div className="lg:col-span-7 space-y-12">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl space-y-6 transform rotate-0.5 hover:rotate-0 transition-transform duration-300">
            <h2 className="text-xl font-serif font-bold text-[#0F172A] border-b border-slate-100 pb-4">
              Club Overview
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-light">
              {club.description}
            </p>
          </div>

          {/* Club Gallery */}
          {club.gallery && club.gallery.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-xl font-serif font-bold text-[#0F172A] inline-flex items-center gap-2">
                <ImageIcon className="text-amber-500" size={20} />
                <span>Activities Gallery</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {club.gallery.map((img) => (
                  <div
                    key={img.id}
                    onClick={() => setLightboxImg(img.imageUrl)}
                    className="aspect-video rounded-2xl overflow-hidden cursor-pointer shadow-lg border border-slate-100 hover:scale-[1.03] transition-all duration-300 relative bg-slate-50"
                  >
                    <img
                      src={img.imageUrl}
                      alt="Club Activity"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Moderator & Members list */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl space-y-6 transform -rotate-0.5 hover:rotate-0 transition-transform duration-300">
            <h2 className="text-xl font-serif font-bold text-[#0F172A] border-b border-slate-100 pb-4 inline-flex items-center gap-2">
              <Users className="text-amber-500" size={20} />
              <span>Moderators & Members</span>
            </h2>
            {(!club.members || club.members.length === 0) ? (
              <p className="text-xs text-slate-400">No active members registered yet.</p>
            ) : (
              <div className="space-y-4">
                {club.members.map((m) => (
                  <div key={m.id} className="flex items-center gap-4 p-4 bg-amber-50/20 rounded-2xl border border-amber-100/30">
                    {m.photoUrl ? (
                      <img
                        src={m.photoUrl}
                        alt={m.name}
                        referrerPolicy="no-referrer"
                        className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-md ring-2 ring-amber-100"
                      />
                    ) : (
                      <div className="h-12 w-12 bg-slate-200 text-slate-500 font-bold rounded-full flex items-center justify-center text-sm border-2 border-white ring-2 ring-amber-100">
                        {m.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-serif font-bold text-[#0F172A]">{m.name}</h4>
                      <p className="text-xs text-amber-600 font-semibold font-serif italic mt-0.5">{m.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {lightboxImg && (
        <div
          className="fixed inset-0 bg-slate-950/95 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setLightboxImg(null)}
        >
          <button className="absolute top-6 right-6 text-white text-sm font-bold bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition">✕ Close</button>
          <img
            src={lightboxImg}
            alt="Club Activity Lightbox"
            referrerPolicy="no-referrer"
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl border-4 border-white/10"
          />
        </div>
      )}
    </div>
  );
}

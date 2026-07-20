import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Calendar, Star, ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { HeroSlide, Facility, Stat, NewsPost, TeacherStaff, GalleryItem, Testimonial } from "../types";
import { DynamicIcon } from "../components/Icons";

function AnimatedCounter({ value }: { value: string }) {
  const [current, setCurrent] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const elementRef = useRef<HTMLSpanElement>(null);

  const hasComma = value.includes(",");
  const cleanValue = value.replace(/,/g, "");
  const matchNum = cleanValue.match(/\d+/);
  const target = matchNum ? parseInt(matchNum[0], 10) : 0;
  
  // Extract suffix/prefix characters
  const nonNumSuffix = value.replace(/[\d,]+/g, "");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setHasStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasStarted || target === 0) return;

    let start = 0;
    const duration = 1500; // 1.5 seconds animation duration
    const stepTime = Math.max(Math.floor(duration / target), 16);
    
    const timer = setInterval(() => {
      // Linear steps with speed-up multiplier
      const step = Math.ceil(target / (duration / stepTime));
      start += step;
      if (start >= target) {
        setCurrent(target);
        clearInterval(timer);
      } else {
        setCurrent(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [hasStarted, target]);

  const displayVal = hasComma ? current.toLocaleString() : current;

  return (
    <span ref={elementRef} className="tabular-nums">
      {hasStarted ? `${displayVal}${nonNumSuffix}` : `0${nonNumSuffix}`}
    </span>
  );
}

interface HomeProps {
  slides: HeroSlide[];
  facilities: Facility[];
  stats: Stat[];
  news: NewsPost[];
  teachers: TeacherStaff[];
  gallery: GalleryItem[];
  testimonials: Testimonial[];
  lang: "EN" | "BN";
}

export default function Home({
  slides,
  facilities,
  stats,
  news,
  teachers,
  gallery,
  testimonials,
  lang,
}: HomeProps) {
  // Slider State
  const [currentSlide, setCurrentSlide] = useState(0);

  // Testimonials Carousel State
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Lightbox State
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  // Slider Timer
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides]);

  // Testimonial Navigation
  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };
  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-24 pb-24 overflow-x-hidden">
      {/* 1. Hero Slider Section */}
      <section className="relative h-[480px] sm:h-[580px] md:h-[680px] w-full bg-[#0F172A] overflow-hidden">
        {slides.length === 0 ? (
          <div className="h-full w-full flex flex-col items-center justify-center bg-[#0F172A] text-slate-400 p-8 text-center">
            <span className="text-4xl mb-4">🏫</span>
            <h2 className="font-serif text-xl font-semibold text-white">No sliders configured.</h2>
            <p className="text-xs text-slate-400 mt-1">Please add slider records in the Admin Panel.</p>
          </div>
        ) : (
          <div className="relative h-full w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2 }}
                className="absolute inset-0 w-full h-full"
              >
                {/* Vintage overlay texture for artistic feel */}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/40 to-transparent z-10" />
                <div className="absolute inset-0 bg-amber-500/5 mix-blend-color-burn z-10" />
                <img
                  src={slides[currentSlide]?.imageUrl}
                  alt={slides[currentSlide]?.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                {/* Caption / Content */}
                <div className="absolute inset-0 z-20 flex items-center px-6 sm:px-16 md:px-28">
                  <div className="max-w-3xl text-white space-y-6">
                    <span className="font-serif italic text-amber-400 text-lg sm:text-xl md:text-2xl block animate-pulse">
                      {lang === "EN" ? "Welcome to Sunrise" : "সানরাইজ-এ স্বাগতম"}
                    </span>
                    {slides[currentSlide]?.title && (
                      <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold tracking-tight leading-tight text-white"
                      >
                        {slides[currentSlide].title}
                      </motion.h1>
                    )}
                    {slides[currentSlide]?.caption && (
                      <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-base sm:text-lg md:text-xl text-slate-200 leading-relaxed max-w-xl font-light"
                      >
                        {slides[currentSlide].caption}
                      </motion.p>
                    )}
                    {slides[currentSlide]?.buttonText && slides[currentSlide]?.buttonUrl && (
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="pt-4"
                      >
                        <Link
                          to={slides[currentSlide].buttonUrl}
                          className="bg-amber-500 hover:bg-amber-600 text-[#0F172A] font-extrabold px-8 py-3.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 inline-flex items-center gap-2 group text-xs tracking-wider uppercase border border-amber-500 hover:border-amber-600"
                        >
                          <span>{slides[currentSlide].buttonText}</span>
                          <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform duration-250" />
                        </Link>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Slider Dots */}
            {slides.length > 1 && (
              <div className="absolute bottom-8 left-0 right-0 z-30 flex justify-center gap-3">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-2 transition-all duration-300 rounded-full ${
                      idx === currentSlide ? "w-10 bg-amber-400" : "w-2 bg-white/40 hover:bg-white"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* 2. Welcome Intro block */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-7 space-y-6">
            <span className="font-serif italic text-lg text-amber-600 block">
              {lang === "EN" ? "Nurturing Future Leaders" : "ভবিষ্যতের নেতৃত্ব গঠন"}
            </span>
            <h2 className="text-4xl sm:text-5xl font-serif font-bold text-[#0F172A] leading-tight">
              {lang === "EN" 
                ? "Where Every Child Shines Brighter" 
                : "যেখানে প্রতিটি শিশু আরো উজ্জ্বলভাবে জ্বলে ওঠে"}
            </h2>
            <p className="text-slate-600 text-base leading-relaxed font-light">
              {lang === "EN"
                ? "At Sunrise Kindergarten & School, we nurture young children with an advanced and interactive English-Version curriculum. Our focus remains deeply rooted in analytical thinking, strong linguistic fluency, healthy spatial values, and modern moral guidelines. We believe education should be a play-filled discovery process rather than a memory-based chore."
                : "সানরাইজ কিন্ডারগার্টেন অ্যান্ড স্কুলে, আমরা একটি উন্নত এবং ইন্টারেক্টিভ ইংরেজি-সংস্করণ পাঠ্যক্রমের মাধ্যমে ছোট বাচ্চাদের লালন-পালন করি। আমাদের মনোযোগ বিশ্লেষণাত্মক চিন্তাভাবনা, দৃঢ় ভাষাগত সাবলীলতা এবং আধুনিক নৈতিক নির্দেশিকার উপর গভীরভাবে নিবদ্ধ। আমরা বিশ্বাস করি যে শিক্ষা স্মৃতি-ভিত্তিক কাজের পরিবর্তে একটি খেলাধুলার আবিষ্কার প্রক্রিয়া হওয়া উচিত।"}
            </p>
            <div className="pt-2">
              <Link
                to="/about"
                className="bg-[#0F172A] hover:bg-transparent text-white hover:text-[#0F172A] px-7 py-3 rounded-full text-xs font-bold tracking-widest transition-all duration-300 border-2 border-[#0F172A] shadow-md inline-flex items-center gap-2 uppercase"
              >
                <span>{lang === "EN" ? "Read Our Story" : "আমাদের ইতিহাস"}</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
          <div className="lg:col-span-5 relative p-6">
            {/* Abstract Tilted Background Frame */}
            <div className="absolute inset-0 bg-[#0F172A]/5 overflow-hidden rounded-[3rem]">
              <div className="absolute top-[15%] left-[-10%] w-[120%] h-[70%] bg-white/80 rotate-[8deg] shadow-lg rounded-[50px]" />
            </div>
            <img
              src="https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=600"
              alt="Welcome Image"
              referrerPolicy="no-referrer"
              className="relative rounded-[2.5rem] shadow-2xl w-full object-cover h-[380px] border-4 border-white transform hover:rotate-1 transition-transform duration-500"
            />
            {/* Floating Artistic Badge */}
            <div className="absolute -bottom-3 -left-3 bg-white p-5 rounded-3xl shadow-2xl border border-slate-100 transform -rotate-3 hover:rotate-0 transition-transform duration-300 max-w-[210px] z-20">
              <div className="flex items-center gap-3">
                <span className="text-2xl">✨</span>
                <div>
                  <h4 className="font-serif font-bold text-xs text-[#0F172A]">25+ Years</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Of scholastic excellence</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Facilities Grid */}
      <section className="bg-amber-50/50 py-24 border-y border-amber-100/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
            <span className="font-serif italic text-base text-amber-600 block">
              {lang === "EN" ? "World Class Facilities" : "উন্নত সুবিধাসমূহ"}
            </span>
            <h2 className="text-4xl font-serif font-bold text-[#0F172A]">
              {lang === "EN" ? "Premium Campus Feature Blocks" : "আমাদের প্রিমিয়াম সুবিধাসমূহ"}
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed font-light">
              {lang === "EN"
                ? "Every facet of our infrastructure is engineered to satisfy strict global safety guidelines and support interactive analytical discovery."
                : "আমাদের অবকাঠামোর প্রতিটি দিক কঠোর বৈশ্বিক নিরাপত্তা নির্দেশিকা পূরণ করতে এবং ইন্টারেক্টিভ বিশ্লেষণাত্মক আবিষ্কারকে সমর্থন করার জন্য তৈরি করা হয়েছে।"}
            </p>
          </div>

          {facilities.length === 0 ? (
            <div className="text-center text-slate-400 py-12">No facilities defined.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {facilities.map((fac, idx) => (
                <div
                  key={fac.id}
                  className={`bg-white p-8 rounded-3xl border border-slate-100/80 shadow-xl transition-all duration-300 hover:shadow-2xl flex flex-col justify-between transform ${
                    idx % 3 === 0 ? "-rotate-1" : idx % 3 === 1 ? "rotate-1" : "rotate-0"
                  } hover:rotate-0`}
                >
                  <div className="space-y-5">
                    <div className="h-14 w-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-inner text-xl">
                      <DynamicIcon name={fac.icon} />
                    </div>
                    <h3 className="font-serif font-bold text-[#0F172A] text-xl">
                      {fac.title}
                    </h3>
                    <p className="text-slate-500 text-xs leading-relaxed font-light">
                      {fac.description}
                    </p>
                  </div>
                  {fac.link && (
                    <div className="pt-6 border-t border-slate-50 mt-6">
                      <Link
                        to={fac.link}
                        className="text-[#0F172A] hover:text-amber-600 text-xs font-bold inline-flex items-center gap-1.5 group font-serif italic"
                      >
                        <span>Learn More</span>
                        <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. Animated Statistics Counters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#0F172A] text-white rounded-[2.5rem] p-10 sm:p-14 md:p-20 relative overflow-hidden shadow-2xl border border-white/5">
          {/* Subtle warm glow backgrounds */}
          <div className="absolute top-0 right-0 h-[400px] w-[400px] bg-amber-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 h-[400px] w-[400px] bg-amber-600/5 rounded-full blur-3xl" />

          {stats.length === 0 ? (
            <div className="text-center text-slate-400">No stats available.</div>
          ) : (
            <div className={`relative z-10 grid grid-cols-2 lg:grid-cols-${Math.min(stats.length, 6)} gap-10 md:gap-16 text-center divide-y lg:divide-y-0 lg:divide-x divide-slate-800`}>
              {stats.map((stat, idx) => (
                <div key={stat.id} className={`pt-10 lg:pt-0 ${idx === 0 ? "pt-0" : ""}`}>
                  <div className="mx-auto h-12 w-12 text-amber-400 flex items-center justify-center mb-5">
                    {stat.imageUrl ? (
                      <img src={stat.imageUrl} alt={stat.label} referrerPolicy="no-referrer" className="h-12 w-12 object-contain" />
                    ) : (
                      <DynamicIcon name={stat.icon || "Award"} />
                    )}
                  </div>
                  <h3 className="text-4xl sm:text-5xl font-serif font-bold tracking-tight text-amber-400">
                    <AnimatedCounter value={`${stat.value}${stat.suffix || ""}`} />
                  </h3>
                  <p className="text-slate-300 text-[10px] tracking-widest font-bold uppercase mt-3">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 5. Latest News / Blog */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-16">
          <div className="space-y-3">
            <span className="font-serif italic text-base text-amber-600 block">
              {lang === "EN" ? "Events & Articles" : "সংবাদ ও ঘটনাবলী"}
            </span>
            <h2 className="text-4xl font-serif font-bold text-[#0F172A]">
              {lang === "EN" ? "Latest School News" : "সর্বশেষ স্কুল সংবাদ"}
            </h2>
          </div>
          <Link
            to="/news"
            className="bg-transparent hover:bg-[#0F172A] text-[#0F172A] hover:text-white px-6 py-2.5 rounded-full text-xs font-bold tracking-widest transition-all duration-300 border-2 border-[#0F172A] inline-flex items-center gap-2 uppercase"
          >
            <span>{lang === "EN" ? "View Archive" : "সংবাদ আর্কাইভ"}</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {news.length === 0 ? (
          <p className="text-center text-slate-400 py-6">No news posts registered yet.</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {news.slice(0, 2).map((post, idx) => (
              <div
                key={post.id}
                className={`bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden flex flex-col md:flex-row transform ${
                  idx % 2 === 0 ? "rotate-1" : "-rotate-1"
                } hover:rotate-0 transition-transform duration-300`}
              >
                {post.imageUrl && (
                  <div className="md:w-2/5 h-52 md:h-auto relative shrink-0">
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-8 md:w-3/5 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
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
                  <Link
                    to={`/news/${post.slug}`}
                    className="text-[#0F172A] hover:text-amber-600 text-xs font-bold inline-flex items-center gap-1.5 group font-serif italic"
                  >
                    <span>{lang === "EN" ? "Read Full Post" : "সম্পূর্ণ পড়ুন"}</span>
                    <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 6. Mission / Vision Block */}
      <section className="bg-amber-50/50 py-24 border-y border-amber-100/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1 relative p-6">
            {/* Abstract Tilted Background Frame */}
            <div className="absolute inset-0 bg-[#0F172A]/5 overflow-hidden rounded-[3rem]">
              <div className="absolute top-[15%] left-[-10%] w-[120%] h-[70%] bg-white/80 -rotate-[6deg] shadow-lg rounded-[40px]" />
            </div>
            <img
              src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=600"
              alt="Mission and Vision"
              referrerPolicy="no-referrer"
              className="relative rounded-[2.5rem] shadow-2xl h-[400px] w-full object-cover border-4 border-white transform hover:-rotate-1 transition-transform duration-500"
            />
          </div>
          <div className="space-y-8 order-1 lg:order-2">
            <div className="space-y-4">
              <span className="font-serif italic text-base text-amber-600 block">
                {lang === "EN" ? "Core Purpose" : "মূল উদ্দেশ্য"}
              </span>
              <h2 className="text-4xl font-serif font-bold text-[#0F172A]">
                {lang === "EN" ? "Our Mission & Vision" : "আমাদের লক্ষ্য ও উদ্দেশ্য"}
              </h2>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="h-11 w-11 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center font-serif font-bold text-lg shrink-0 shadow-sm">
                  1
                </div>
                <div>
                  <h3 className="font-serif font-bold text-[#0F172A] text-lg">
                    {lang === "EN" ? "Intellectual Mission" : "মেধা বিকাশ"}
                  </h3>
                  <p className="text-slate-500 text-xs leading-relaxed mt-1 font-light">
                    {lang === "EN"
                      ? "To deploy state-of-the-art interactive pedagogies that transition students from rote learning to active analytical exploration, problem-solving, and speaking excellence."
                      : "স্মৃতিস্ত করার পরিবর্তে শিক্ষার্থীদের বিশ্লেষণাত্মক অন্বেষণ, সমস্যা সমাধান এবং কথা বলার দক্ষতা অর্জনে সহায়তা করা।"}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="h-11 w-11 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center font-serif font-bold text-lg shrink-0 shadow-sm">
                  2
                </div>
                <div>
                  <h3 className="font-serif font-bold text-[#0F172A] text-lg">
                    {lang === "EN" ? "Global Vision" : "বৈশ্বিক দৃষ্টিভঙ্গি"}
                  </h3>
                  <p className="text-slate-500 text-xs leading-relaxed mt-1 font-light">
                    {lang === "EN"
                      ? "To mold young learners into curious global citizens who are intellectually ambitious, digitally proficient, and deeply rooted in moral and local heritage."
                      : "ছোট শিক্ষার্থীদের জিজ্ঞাসু বৈশ্বিক নাগরিক হিসাবে গড়ে তোলা যারা মানসিকভাবে উচ্চাভিলাষী, ডিজিটালভাবে দক্ষ এবং নৈতিক গুণাবলীতে সমৃদ্ধ।"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Teachers / Staff Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-16">
          <div className="space-y-3">
            <span className="font-serif italic text-base text-amber-600 block">
              {lang === "EN" ? "Elite Educators" : "অভিজ্ঞ শিক্ষক মণ্ডলী"}
            </span>
            <h2 className="text-4xl font-serif font-bold text-[#0F172A]">
              {lang === "EN" ? "Our Faculty Members" : "আমাদের শিক্ষক মণ্ডলী"}
            </h2>
          </div>
          <Link
            to="/teachers"
            className="bg-[#0F172A] hover:bg-transparent text-white hover:text-[#0F172A] px-6 py-2.5 rounded-full text-xs font-bold tracking-widest transition-all duration-300 border-2 border-[#0F172A] uppercase"
          >
            {lang === "EN" ? "View All Faculty" : "সব শিক্ষক দেখুন"}
          </Link>
        </div>

        {teachers.length === 0 ? (
          <p className="text-center text-slate-400">No teachers seeded yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {teachers.slice(0, 4).map((t, idx) => (
              <div
                key={t.id}
                className={`bg-white border border-slate-100/80 rounded-[2rem] p-6 shadow-xl hover:shadow-2xl transition-all duration-300 text-center transform ${
                  idx % 4 === 0 ? "-rotate-1" : idx % 4 === 1 ? "rotate-1" : idx % 4 === 2 ? "-rotate-2" : "rotate-2"
                } hover:rotate-0`}
              >
                {t.photoUrl && (
                  <img
                    src={t.photoUrl}
                    alt={t.name}
                    referrerPolicy="no-referrer"
                    className="h-32 w-32 rounded-full mx-auto object-cover border-4 border-white shadow-lg ring-4 ring-amber-50"
                  />
                )}
                <h3 className="font-serif font-bold text-[#0F172A] text-lg mt-5">
                  {t.name}
                </h3>
                <p className="text-amber-600 text-xs font-semibold mt-1 font-serif italic">{t.designation}</p>
                <p className="text-slate-500 text-xs mt-3 line-clamp-2 leading-relaxed font-light">
                  {t.bio}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 8. Photo Gallery */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="font-serif italic text-base text-amber-600 block">
            {lang === "EN" ? "Snapshots" : "গ্যালারি"}
          </span>
          <h2 className="text-4xl font-serif font-bold text-[#0F172A]">
            {lang === "EN" ? "School Life Gallery" : "স্কুল গ্যালারি"}
          </h2>
        </div>

        {gallery.length === 0 ? (
          <p className="text-center text-slate-400">No gallery images uploaded yet.</p>
        ) : (
          <div className="masonry-grid">
            {gallery.slice(0, 6).map((item) => (
              <div
                key={item.id}
                onClick={() => setLightboxImg(item.imageUrl)}
                className="relative group overflow-hidden rounded-3xl shadow-xl border border-slate-100 cursor-pointer aspect-video bg-slate-100 transform hover:scale-[1.02] transition duration-300"
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                  <div>
                    <span className="text-[10px] text-amber-400 font-mono font-bold uppercase tracking-widest bg-slate-950/60 px-3 py-1 rounded">
                      {item.album}
                    </span>
                    <h4 className="text-white text-sm font-serif font-bold mt-2.5">{item.title}</h4>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Lightbox Modal */}
        {lightboxImg && (
          <div
            className="fixed inset-0 bg-slate-950/95 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setLightboxImg(null)}
          >
            <button className="absolute top-6 right-6 text-white text-sm font-bold bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition">✕ Close</button>
            <img
              src={lightboxImg}
              alt="Lightbox"
              referrerPolicy="no-referrer"
              className="max-h-[85vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl border-4 border-white/10"
            />
          </div>
        )}
      </section>

      {/* 9. Testimonials Carousel */}
      {testimonials.length > 0 && (
        <section className="bg-[#0F172A] text-white py-24 relative overflow-hidden">
          <div className="absolute top-0 left-0 h-96 w-96 bg-amber-500/5 rounded-full blur-3xl" />
          <div className="max-w-4xl mx-auto px-4 text-center space-y-10">
            <div className="h-14 w-14 bg-amber-500 rounded-full flex items-center justify-center text-[#0F172A] mx-auto shadow-lg shadow-amber-500/15">
              <Heart size={24} className="fill-[#0F172A]" />
            </div>
            <span className="font-serif italic text-base text-amber-400 block">
              {lang === "EN" ? "Parent Reviews" : "অভিভাবকদের মতামত"}
            </span>

            <div className="relative min-h-[180px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTestimonial}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  <p className="text-lg sm:text-xl font-serif italic leading-relaxed text-slate-200 max-w-3xl mx-auto font-light">
                    "{testimonials[currentTestimonial]?.content}"
                  </p>
                  <div className="flex justify-center gap-1.5">
                    {[...Array(testimonials[currentTestimonial]?.rating || 5)].map((_, i) => (
                      <Star key={i} size={15} className="text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-white text-base">
                      {testimonials[currentTestimonial]?.name}
                    </h4>
                    <p className="text-amber-400 text-xs font-mono tracking-wider mt-1 uppercase">
                      {testimonials[currentTestimonial]?.role}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Testimonials Controls */}
            {testimonials.length > 1 && (
              <div className="flex justify-center gap-4 pt-6">
                <button
                  onClick={prevTestimonial}
                  className="p-3 bg-white/5 hover:bg-amber-400 text-white hover:text-[#0F172A] rounded-full transition-all duration-300"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={nextTestimonial}
                  className="p-3 bg-white/5 hover:bg-amber-400 text-white hover:text-[#0F172A] rounded-full transition-all duration-300"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

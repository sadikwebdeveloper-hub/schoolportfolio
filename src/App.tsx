import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import ContentPage from "./pages/ContentPage";
import ClubDetail from "./pages/ClubDetail";
import Authorities from "./pages/Authorities";
import Achievements from "./pages/Achievements";
import Exams from "./pages/Exams";
import RoutinePage from "./pages/Routine";
import ContactUs from "./pages/ContactUs";
import Admission from "./pages/Admission";
import NewsDetail from "./pages/NewsDetail";
import NewsArchive from "./pages/NewsArchive";
import Teachers from "./pages/Teachers";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import {
  SiteSetting, HeroSlide, Facility, Stat, NewsPost, TeacherStaff,
  Authority, Achievement, Club, GalleryItem, Testimonial, Routine, ExamPdf, AcademicBlock
} from "./types";

function AppContent() {
  const location = useLocation();

  // Route loading state for top progress bar
  const [routeLoading, setRouteLoading] = useState(false);

  useEffect(() => {
    setRouteLoading(true);
    const timer = setTimeout(() => {
      setRouteLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Admin Session States
  const [token, setToken] = useState<string | null>(localStorage.getItem("adminToken"));
  const [adminUser, setAdminUser] = useState<any>(null);

  // Global Language state
  const [lang, setLang] = useState<"EN" | "BN">("EN");

  // Dismissible top announcement banner state
  const [showBanner, setShowBanner] = useState<boolean>(() => {
    return localStorage.getItem("dismissedAdmissionsBanner") !== "true";
  });

  // Global Site Database States
  const [settings, setSettings] = useState<SiteSetting | null>(null);
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [stats, setStats] = useState<Stat[]>([]);
  const [news, setNews] = useState<NewsPost[]>([]);
  const [teachers, setTeachers] = useState<TeacherStaff[]>([]);
  const [authorities, setAuthorities] = useState<Authority[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [exams, setExams] = useState<ExamPdf[]>([]);
  const [academicBlocks, setAcademicBlocks] = useState<AcademicBlock[]>([]);

  const [loading, setLoading] = useState(true);

  // Parse admin user from token payload on load
  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setAdminUser(payload);
      } catch (err) {
        localStorage.removeItem("adminToken");
        setToken(null);
      }
    }
  }, [token]);

  // Fetch all database records
  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [
        resSettings,
        resSlides,
        resFacilities,
        resStats,
        resNews,
        resTeachers,
        resAuthorities,
        resAchievements,
        resClubs,
        resGallery,
        resTestimonials,
        resRoutines,
        resExams,
        resAcademic
      ] = await Promise.all([
        fetch("/api/settings"),
        fetch("/api/sliders"),
        fetch("/api/facilities"),
        fetch("/api/stats"),
        fetch("/api/news"),
        fetch("/api/teachers"),
        fetch("/api/authorities"),
        fetch("/api/achievements"),
        fetch("/api/clubs"),
        fetch("/api/gallery"),
        fetch("/api/testimonials"),
        fetch("/api/routines"),
        fetch("/api/exams"),
        fetch("/api/academic-blocks")
      ]);

      if (resSettings.ok) setSettings(await resSettings.json());
      if (resSlides.ok) setSlides(await resSlides.json());
      if (resFacilities.ok) setFacilities(await resFacilities.json());
      if (resStats.ok) setStats(await resStats.json());
      if (resNews.ok) setNews(await resNews.json());
      if (resTeachers.ok) setTeachers(await resTeachers.json());
      if (resAuthorities.ok) setAuthorities(await resAuthorities.json());
      if (resAchievements.ok) setAchievements(await resAchievements.json());
      if (resClubs.ok) setClubs(await resClubs.json());
      if (resGallery.ok) setGallery(await resGallery.json());
      if (resTestimonials.ok) setTestimonials(await resTestimonials.json());
      if (resRoutines.ok) setRoutines(await resRoutines.json());
      if (resExams.ok) setExams(await resExams.json());
      if (resAcademic.ok) setAcademicBlocks(await resAcademic.json());

    } catch (err) {
      console.error("Failed to load school database:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleLoginSuccess = (newToken: string, adminInfo: any) => {
    localStorage.setItem("adminToken", newToken);
    setToken(newToken);
    setAdminUser(adminInfo);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setToken(null);
    setAdminUser(null);
  };

  const isAdminRoute = location.pathname.startsWith("/admin");

  if (loading && !isAdminRoute) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <h2 className="font-display font-bold text-slate-800 text-sm">Sunrise Kindergarten & School</h2>
          <p className="text-xs text-slate-400">Loading campus database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white text-slate-800">
      {/* Route Transition Top Progress Bar */}
      {routeLoading && (
        <div className="fixed top-0 left-0 h-[3px] bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 z-[9999] top-progress-bar" />
      )}

      {/* Dynamic Iframe / Public Layout Wrapper */}
      {!isAdminRoute && (
        <>
          {/* Top Announcement Banner */}
          {showBanner && (
            <div className="bg-slate-900 text-white py-1.5 px-4 text-center text-xs font-semibold tracking-wide border-b border-yellow-500/20 relative flex items-center justify-center">
              <span className="flex-1 text-center pr-6">
                {lang === "EN" ? (
                  <span>✨ <strong>Admissions Open:</strong> Online registration for 2026-2027 is active!</span>
                ) : (
                  <span>✨ <strong>ভর্তি চলছে:</strong> ২০১৬-২০১৭ শিক্ষাবর্ষের অনলাইন আবেদন এখন উন্মুক্ত!</span>
                )}
              </span>
              <button
                onClick={() => {
                  setShowBanner(false);
                  localStorage.setItem("dismissedAdmissionsBanner", "true");
                }}
                className="absolute right-3 hover:text-yellow-500 transition cursor-pointer p-0.5 text-[11px] font-bold leading-none"
                title="Dismiss"
              >
                ✕
              </button>
            </div>
          )}

          <Header
            settings={settings}
            clubs={clubs}
            lang={lang}
            setLang={setLang}
          />
        </>
      )}

      {/* Main Switchable Route Panels */}
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <Home
                slides={slides}
                facilities={facilities}
                stats={stats}
                news={news}
                teachers={teachers}
                gallery={gallery}
                testimonials={testimonials}
                lang={lang}
              />
            }
          />

          <Route
            path="/about"
            element={<ContentPage blocks={academicBlocks} section="brief_history" lang={lang} />}
          />
          <Route
            path="/history"
            element={<ContentPage blocks={academicBlocks} section="brief_history" lang={lang} />}
          />
          <Route
            path="/features"
            element={<ContentPage blocks={academicBlocks} section="school_feature" lang={lang} />}
          />
          <Route
            path="/academic-framework"
            element={<ContentPage blocks={academicBlocks} section="academic_overview" lang={lang} />}
          />
          <Route
            path="/hostel"
            element={<ContentPage blocks={academicBlocks} section="hostel" lang={lang} />}
          />
          <Route
            path="/co-curricular-overview"
            element={<ContentPage blocks={academicBlocks} section="co_curricular" lang={lang} />}
          />

          <Route path="/authorities" element={<Authorities authorities={authorities} lang={lang} />} />
          <Route path="/achievements" element={<Achievements achievements={achievements} lang={lang} />} />
          <Route path="/clubs/:slug" element={<ClubDetail />} />
          <Route path="/examination" element={<Exams exams={exams} lang={lang} />} />
          <Route path="/routine" element={<RoutinePage routines={routines} lang={lang} />} />
          <Route path="/contact" element={<ContactUs settings={settings} lang={lang} />} />
          <Route path="/admission" element={<Admission lang={lang} />} />
          <Route path="/news" element={<NewsArchive news={news} lang={lang} />} />
          <Route path="/news/:slug" element={<NewsDetail />} />
          <Route path="/teachers" element={<Teachers teachers={teachers} lang={lang} />} />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              token ? (
                <AdminDashboard
                  token={token}
                  admin={adminUser}
                  onLogout={handleLogout}
                  onSettingsUpdate={fetchAllData}
                />
              ) : (
                <Navigate to="/admin/login" replace />
              )
            }
          />
          <Route
            path="/admin/login"
            element={
              token ? <Navigate to="/admin" replace /> : <AdminLogin onLoginSuccess={handleLoginSuccess} />
            }
          />

          {/* Fallback Catch-all Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!isAdminRoute && <Footer settings={settings} recentNews={news} lang={lang} />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

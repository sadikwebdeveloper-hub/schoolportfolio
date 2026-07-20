import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, Phone, Mail, Globe } from "lucide-react";
import { SiteSetting, Club } from "../types";

interface HeaderProps {
  settings: SiteSetting | null;
  clubs: Club[];
  lang: "EN" | "BN";
  setLang: (lang: "EN" | "BN") => void;
}

export default function Header({ settings, clubs, lang, setLang }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isSticky, setIsSticky] = useState(false);
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Close mobile menu on route change
    setIsOpen(false);
    setActiveDropdown(null);
  }, [location]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const toggleDropdown = (name: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const name = settings?.schoolName || "Sunrise Kindergarten & School";
  const email = settings?.email || "admissions@sunrisekindergarten.edu";
  const phone1 = settings?.phone1 || "+880 1711-123456";
  const phone2 = settings?.phone2 || "+880 1811-987654";

  return (
    <header className="w-full z-50 transition-all duration-300">
      {/* Top Utility Bar */}
      <div className="bg-[#0F172A] text-slate-300 text-[11px] uppercase tracking-wider font-semibold py-2 px-4 sm:px-6 md:px-8 flex justify-end sm:justify-between items-center border-b border-white/10">
        <div className="hidden sm:flex items-center gap-4 md:gap-6">
          <a href={`tel:${phone1}`} className="flex items-center gap-2 hover:text-amber-400 transition">
            <Phone size={12} className="text-amber-400" />
            <span>{phone1}</span>
          </a>
          {phone2 && (
            <a href={`tel:${phone2}`} className="flex items-center gap-2 hover:text-amber-400 transition hidden md:flex">
              <Phone size={12} className="text-amber-400" />
              <span>{phone2}</span>
            </a>
          )}
          <a href={`mailto:${email}`} className="flex items-center gap-2 hover:text-amber-400 transition">
            <Mail size={12} className="text-amber-400" />
            <span>{email}</span>
          </a>
        </div>
        <div className="flex items-center gap-6">
          {/* Language Toggle */}
          <button
            onClick={() => setLang(lang === "EN" ? "BN" : "EN")}
            className="flex items-center gap-1.5 text-slate-300 hover:text-amber-400 transition bg-slate-800/60 hover:bg-slate-800 px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer"
          >
            <Globe size={11} className="text-amber-400" />
            <span>{lang === "EN" ? "বাংলা" : "English"}</span>
          </button>
        </div>
      </div>

      {/* Main Sticky Navbar */}
      <nav
        ref={dropdownRef}
        className={`bg-white/95 backdrop-blur-md transition-all duration-300 border-b border-slate-100 ${
          isSticky ? "fixed top-0 left-0 w-full shadow-lg py-2.5" : "relative py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          {/* Logo / Title */}
          <Link id="nav-brand" to="/" className="flex items-center gap-3.5 group">
            {settings?.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt="Logo"
                referrerPolicy="no-referrer"
                className="h-12 w-12 object-contain rounded-xl border border-amber-400 shadow-md group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="h-12 w-12 bg-[#0F172A] rounded-xl flex items-center justify-center overflow-hidden shadow-md group-hover:scale-105 transition-transform">
                <div className="w-8 h-8 border border-amber-400 rotate-45 flex items-center justify-center">
                  <span className="-rotate-45 font-serif font-bold text-white text-xs">SK</span>
                </div>
              </div>
            )}
            <div>
              <span className="font-serif font-extrabold text-[#0F172A] tracking-tight text-base sm:text-lg md:text-xl block leading-none">
                {name.split(" ")[0]} <span className="text-amber-500">{name.split(" ").slice(1).join(" ")}</span>
              </span>
              <span className="text-[10px] tracking-[0.15em] font-bold text-slate-400 block mt-0.5 uppercase">
                {settings?.tagline || (lang === "EN" ? "KINDERGARTEN & SCHOOL" : "কিন্ডারগার্টেন ও স্কুল")}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1">
            {/* About Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-1 px-3 py-2 text-slate-600 hover:text-amber-600 text-sm font-bold tracking-tight transition cursor-pointer">
                <span>{lang === "EN" ? "About Us" : "আমাদের কথা"}</span>
                <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-200 text-slate-400" />
              </button>
              <div className="absolute left-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl border border-slate-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <Link to="/about" className="block px-4 py-2 text-sm text-slate-600 hover:bg-amber-50 hover:text-amber-600 font-medium">
                  {lang === "EN" ? "Brief History" : "সংক্ষিপ্ত ইতিহাস"}
                </Link>
                <Link to="/features" className="block px-4 py-2 text-sm text-slate-600 hover:bg-amber-50 hover:text-amber-600 font-medium">
                  {lang === "EN" ? "School Feature" : "আমাদের বৈশিষ্ট্য"}
                </Link>
              </div>
            </div>

            <Link to="/authorities" className="px-3 py-2 text-slate-600 hover:text-amber-600 text-sm font-bold tracking-tight transition">
              {lang === "EN" ? "Authorities" : "কর্তৃপক্ষ"}
            </Link>

            <Link to="/achievements" className="px-3 py-2 text-slate-600 hover:text-amber-600 text-sm font-bold tracking-tight transition">
              {lang === "EN" ? "Achievements" : "অর্জনসমূহ"}
            </Link>

            {/* Academic Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-1 px-3 py-2 text-slate-600 hover:text-amber-600 text-sm font-bold tracking-tight transition cursor-pointer">
                <span>{lang === "EN" ? "Academic" : "একাডেমিক"}</span>
                <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-200 text-slate-400" />
              </button>
              <div className="absolute left-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl border border-slate-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <Link to="/academic-framework" className="block px-4 py-2 text-sm text-slate-600 hover:bg-amber-50 hover:text-amber-600 font-medium">
                  {lang === "EN" ? "Overview" : "সারসংক্ষেপ"}
                </Link>
                <Link to="/hostel" className="block px-4 py-2 text-sm text-slate-600 hover:bg-amber-50 hover:text-amber-600 font-medium">
                  {lang === "EN" ? "Hostel & Boarding" : "ছাত্রাবাস"}
                </Link>
                <Link to="/co-curricular-overview" className="block px-4 py-2 text-sm text-slate-600 hover:bg-amber-50 hover:text-amber-600 font-medium">
                  {lang === "EN" ? "Co-Curricular" : "সহ-শিক্ষা কার্যক্রম"}
                </Link>
              </div>
            </div>

            <Link to="/examination" className="px-3 py-2 text-slate-600 hover:text-amber-600 text-sm font-bold tracking-tight transition">
              {lang === "EN" ? "Examination" : "পরীক্ষা"}
            </Link>

            <Link to="/routine" className="px-3 py-2 text-slate-600 hover:text-amber-600 text-sm font-bold tracking-tight transition">
              {lang === "EN" ? "Routine" : "রুটিন"}
            </Link>

            {/* Clubs Dropdown (dynamic) */}
            <div className="relative group">
              <button className="flex items-center gap-1 px-3 py-2 text-slate-600 hover:text-amber-600 text-sm font-bold tracking-tight transition cursor-pointer">
                <span>{lang === "EN" ? "Clubs" : "ক্লাবসমূহ"}</span>
                <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-200 text-slate-400" />
              </button>
              <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-xl border border-slate-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                {clubs.length === 0 ? (
                  <span className="block px-4 py-2 text-xs text-slate-400">No active clubs</span>
                ) : (
                  clubs.map((club) => (
                     <Link
                       key={club.id}
                       to={`/clubs/${club.slug}`}
                       className="block px-4 py-2 text-sm text-slate-600 hover:bg-amber-50 hover:text-amber-600 font-medium truncate"
                     >
                       {club.name}
                     </Link>
                  ))
                )}
              </div>
            </div>

            <Link to="/contact" className="px-3 py-2 text-slate-600 hover:text-amber-600 text-sm font-bold tracking-tight transition">
              {lang === "EN" ? "Contact Us" : "যোগাযোগ"}
            </Link>

            {/* Admission CTA Button */}
            <Link
              to="/admission"
              className="ml-4 bg-[#0F172A] text-white hover:bg-transparent hover:text-[#0F172A] px-6 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-300 border-2 border-[#0F172A] shadow-md hover:shadow-lg inline-flex items-center justify-center"
            >
              {lang === "EN" ? "Apply Now" : "ভর্তি আবেদন"}
            </Link>
          </div>

          {/* Mobile hamburger menu button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-700 hover:text-[#0F172A] p-2 focus:outline-none rounded"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Nav Drawer */}
        {isOpen && (
          <div className="lg:hidden bg-white border-t border-slate-100 px-4 py-3 space-y-2 max-h-[80vh] overflow-y-auto">
            {/* About Accordion */}
            <div>
              <button
                onClick={(e) => toggleDropdown("about", e)}
                className="w-full flex justify-between items-center py-2 text-slate-700 text-sm font-medium border-b border-slate-50"
              >
                <span>{lang === "EN" ? "About Us" : "আমাদের কথা"}</span>
                <ChevronDown size={16} className={`transform transition-transform ${activeDropdown === "about" ? "rotate-180" : ""}`} />
              </button>
              {activeDropdown === "about" && (
                <div className="bg-slate-50 pl-4 py-1 space-y-1 mt-1 rounded">
                  <Link to="/about" className="block py-2 text-sm text-slate-600 hover:text-slate-900">
                    {lang === "EN" ? "Brief History" : "সংক্ষিপ্ত ইতিহাস"}
                  </Link>
                  <Link to="/features" className="block py-2 text-sm text-slate-600 hover:text-slate-900">
                    {lang === "EN" ? "School Feature" : "আমাদের বৈশিষ্ট্য"}
                  </Link>
                </div>
              )}
            </div>

            <Link to="/authorities" className="block py-2 text-slate-700 text-sm font-medium border-b border-slate-50">
              {lang === "EN" ? "Authorities" : "কর্তৃপক্ষ"}
            </Link>

            <Link to="/achievements" className="block py-2 text-slate-700 text-sm font-medium border-b border-slate-50">
              {lang === "EN" ? "Achievements" : "অর্জনসমূহ"}
            </Link>

            {/* Academic Accordion */}
            <div>
              <button
                onClick={(e) => toggleDropdown("academic", e)}
                className="w-full flex justify-between items-center py-2 text-slate-700 text-sm font-medium border-b border-slate-50"
              >
                <span>{lang === "EN" ? "Academic" : "একাডেমিক"}</span>
                <ChevronDown size={16} className={`transform transition-transform ${activeDropdown === "academic" ? "rotate-180" : ""}`} />
              </button>
              {activeDropdown === "academic" && (
                <div className="bg-slate-50 pl-4 py-1 space-y-1 mt-1 rounded">
                  <Link to="/academic-framework" className="block py-2 text-sm text-slate-600 hover:text-slate-900">
                    {lang === "EN" ? "Overview" : "সারসংক্ষেপ"}
                  </Link>
                  <Link to="/hostel" className="block py-2 text-sm text-slate-600 hover:text-slate-900">
                    {lang === "EN" ? "Hostel & Boarding" : "ছাত্রাবাস"}
                  </Link>
                  <Link to="/co-curricular-overview" className="block py-2 text-sm text-slate-600 hover:text-slate-900">
                    {lang === "EN" ? "Co-Curricular" : "সহ-শিক্ষা কার্যক্রম"}
                  </Link>
                </div>
              )}
            </div>

            <Link to="/examination" className="block py-2 text-slate-700 text-sm font-medium border-b border-slate-50">
              {lang === "EN" ? "Examination" : "পরীক্ষা"}
            </Link>

            <Link to="/routine" className="block py-2 text-slate-700 text-sm font-medium border-b border-slate-50">
              {lang === "EN" ? "Routine" : "রুটিন"}
            </Link>

            {/* Clubs Accordion */}
            <div>
              <button
                onClick={(e) => toggleDropdown("clubs", e)}
                className="w-full flex justify-between items-center py-2 text-slate-700 text-sm font-medium border-b border-slate-50"
              >
                <span>{lang === "EN" ? "Clubs" : "ক্লাবসমূহ"}</span>
                <ChevronDown size={16} className={`transform transition-transform ${activeDropdown === "clubs" ? "rotate-180" : ""}`} />
              </button>
              {activeDropdown === "clubs" && (
                <div className="bg-slate-50 pl-4 py-1 space-y-1 mt-1 rounded max-h-40 overflow-y-auto">
                  {clubs.length === 0 ? (
                    <span className="block py-2 text-xs text-slate-400">No active clubs</span>
                  ) : (
                    clubs.map((club) => (
                      <Link key={club.id} to={`/clubs/${club.slug}`} className="block py-2 text-sm text-slate-600 hover:text-slate-900 truncate">
                        {club.name}
                      </Link>
                    ))
                  )}
                </div>
              )}
            </div>

            <Link to="/contact" className="block py-2 text-slate-700 text-sm font-medium border-b border-slate-50">
              {lang === "EN" ? "Contact Us" : "যোগাযোগ"}
            </Link>

            <Link
              to="/admission"
              className="block w-full text-center bg-slate-900 text-white hover:bg-yellow-500 hover:text-slate-900 py-3 rounded-lg text-sm font-bold transition mt-4"
            >
              {lang === "EN" ? "Apply for Admission" : "ভর্তি আবেদন"}
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}

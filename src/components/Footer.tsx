import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Twitter, Youtube, Instagram, Phone, Mail, MapPin } from "lucide-react";
import { SiteSetting, NewsPost } from "../types";

interface FooterProps {
  settings: SiteSetting | null;
  recentNews: NewsPost[];
  lang: "EN" | "BN";
}

export default function Footer({ settings, recentNews, lang }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const name = settings?.schoolName || "Sunrise Kindergarten & School";
  const email = settings?.email || "admissions@sunrisekindergarten.edu";
  const phone1 = settings?.phone1 || "+880 1711-123456";
  const address = settings?.address || "Road 12, Sector 4, Uttara, Dhaka, Bangladesh";

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
        {/* School Profile Column */}
        <div className="space-y-4">
          <Link to="/" className="flex items-center gap-3">
            {settings?.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt="Logo"
                referrerPolicy="no-referrer"
                className="h-10 w-10 object-contain rounded bg-white p-0.5 border border-amber-400"
              />
            ) : (
              <div className="h-10 w-10 bg-white text-slate-900 flex items-center justify-center font-serif font-bold text-lg rounded shadow">
                S
              </div>
            )}
            <span className="font-serif font-bold text-white text-base tracking-tight leading-tight block">
              {name.split(" ")[0]} <span className="text-amber-400">{name.split(" ").slice(1).join(" ")}</span>
            </span>
          </Link>
          <p className="text-xs text-slate-400 leading-relaxed pt-2">
            {lang === "EN"
              ? "We are dedicated to providing a superior, interactive, and moral English-Version curriculum that empowers children to discover their maximum intellectual potential."
              : "আমরা একটি উন্নত, ইন্টারেক্টিভ এবং নৈতিক ইংরেজি-সংস্করণ পাঠ্যক্রম প্রদানের জন্য নিবেদিত যা শিশুদের তাদের সর্বোচ্চ বুদ্ধিবৃত্তিক সম্ভাবনা আবিষ্কার করতে সহায়তা করে।"}
          </p>
          {/* Social Icons */}
          <div className="flex gap-3 pt-3">
            <a href={settings?.facebookUrl || "https://facebook.com"} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-800 rounded-full hover:bg-amber-400 hover:text-slate-950 transition text-slate-400">
              <Facebook size={16} />
            </a>
            <a href={settings?.twitterUrl || "https://twitter.com"} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-800 rounded-full hover:bg-amber-400 hover:text-slate-950 transition text-slate-400">
              <Twitter size={16} />
            </a>
            <a href={settings?.youtubeUrl || "https://youtube.com"} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-800 rounded-full hover:bg-amber-400 hover:text-slate-950 transition text-slate-400">
              <Youtube size={16} />
            </a>
            <a href={settings?.instagramUrl || "https://instagram.com"} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-800 rounded-full hover:bg-amber-400 hover:text-slate-950 transition text-slate-400">
              <Instagram size={16} />
            </a>
          </div>
        </div>

        {/* Useful Links Column */}
        <div>
          <h4 className="font-serif font-semibold text-white text-sm tracking-wider uppercase mb-6 border-l-4 border-amber-500 pl-3">
            {lang === "EN" ? "Quick Links" : "গুরুত্বপূর্ণ লিংক"}
          </h4>
          <ul className="space-y-3 text-xs">
            <li>
              <Link to="/about" className="hover:text-amber-400 transition hover:underline">
                {lang === "EN" ? "Brief History" : "সংক্ষিপ্ত ইতিহাস"}
              </Link>
            </li>
            <li>
              <Link to="/features" className="hover:text-amber-400 transition hover:underline">
                {lang === "EN" ? "Our Distinct Features" : "আমাদের বৈশিষ্ট্য"}
              </Link>
            </li>
            <li>
              <Link to="/authorities" className="hover:text-amber-400 transition hover:underline">
                {lang === "EN" ? "Governing Body & Principal" : "পরিচালনা পর্ষদ ও অধ্যক্ষ"}
              </Link>
            </li>
            <li>
              <Link to="/academic-framework" className="hover:text-amber-400 transition hover:underline">
                {lang === "EN" ? "Academic Framework" : "একাডেমিক কাঠামো"}
              </Link>
            </li>
            <li>
              <Link to="/examination" className="hover:text-amber-400 transition hover:underline">
                {lang === "EN" ? "Exam Schedules & Portals" : "পরীক্ষার সময়সূচী"}
              </Link>
            </li>
            <li>
              <Link to="/routine" className="hover:text-amber-400 transition hover:underline">
                {lang === "EN" ? "Class Routine PDF" : "ক্লাস রুটিন"}
              </Link>
            </li>
          </ul>
        </div>

        {/* Recent News Column */}
        <div>
          <h4 className="font-serif font-semibold text-white text-sm tracking-wider uppercase mb-6 border-l-4 border-amber-500 pl-3">
            {lang === "EN" ? "Recent News" : "সাম্প্রতিক সংবাদ"}
          </h4>
          <div className="space-y-4">
            {recentNews.length === 0 ? (
              <p className="text-xs text-slate-400">No news posted yet.</p>
            ) : (
              recentNews.slice(0, 2).map((post) => (
                <div key={post.id} className="space-y-1">
                  <Link to={`/news/${post.slug}`} className="text-xs text-slate-300 hover:text-amber-400 hover:underline font-medium block line-clamp-2">
                    {post.title}
                  </Link>
                  <span className="text-[10px] text-slate-500 font-mono block">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Contact info Column */}
        <div>
          <h4 className="font-serif font-semibold text-white text-sm tracking-wider uppercase mb-6 border-l-4 border-amber-500 pl-3">
            {lang === "EN" ? "Contact Office" : "যোগাযোগের ঠিকানা"}
          </h4>
          <ul className="space-y-4 text-xs">
            <li className="flex items-start gap-3">
              <MapPin size={16} className="text-amber-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{address}</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone size={16} className="text-amber-400 shrink-0" />
              <span>{phone1}</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail size={16} className="text-amber-400 shrink-0" />
              <a href={`mailto:${email}`} className="hover:text-amber-400 transition underline truncate">
                {email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800 pt-8 mt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
        <p>© {currentYear} {name}. All rights reserved.</p>
        <p>Powered by English Version Academic Grid</p>
      </div>
    </footer>
  );
}

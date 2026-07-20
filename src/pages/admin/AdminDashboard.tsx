import React, { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard, Settings, Users, Sliders as SliderIcon, Newspaper, GraduationCap,
  Users2, BookOpen, FileSpreadsheet, Heart, Building2, Image as ImageIcon, LogOut,
  Plus, Edit2, Trash2, Check, X, Download, ShieldAlert, AlertCircle, FileText, Award
} from "lucide-react";
import { SiteSetting, Club, AdminUser, AdmissionApplication } from "../../types";
import { DynamicIcon } from "../../components/Icons";

interface AdminDashboardProps {
  token: string;
  admin: { id: number; name: string; email: string; role: string } | null;
  onLogout: () => void;
  onSettingsUpdate: () => void;
}

export default function AdminDashboard({ token, admin, onLogout, onSettingsUpdate }: AdminDashboardProps) {
  // Tabs: dashboard | settings | admins | admissions | sliders | facilities | stats | news | teachers | authorities | achievements | clubs | routines | testimonials | gallery
  const [activeTab, setActiveTab] = useState("dashboard");

  // Global shared stats and list data
  const [dbStats, setDbStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // General lists for CRUDs
  const [sliders, setSliders] = useState<any[]>([]);
  const [facilities, setFacilities] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [authorities, setAuthorities] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [routines, setRoutines] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [academicBlocks, setAcademicBlocks] = useState<any[]>([]);
  const [adminsList, setAdminsList] = useState<AdminUser[]>([]);
  const [admissions, setAdmissions] = useState<AdmissionApplication[]>([]);

  // Selected Club Sub-workspace State
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);

  // Settings State
  const [settingsForm, setSettingsForm] = useState<any>({});
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);

  // General form controls & triggers
  const [editorMode, setEditorMode] = useState<"add" | "edit" | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formFields, setFormFields] = useState<any>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  // Sub-members for Clubs
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("");
  const [memberPhoto, setMemberPhoto] = useState<File | null>(null);
  const [clubGalleryFile, setClubGalleryFile] = useState<File | null>(null);

  // Status controls
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Search/Filters for Admissions
  const [admissionFilter, setAdmissionFilter] = useState("All");
  const [admissionSearch, setAdmissionSearch] = useState("");
  const [adminNotesText, setAdminNotesText] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load Admin Stats & Workspace Lists
  const fetchDashboardStats = async () => {
    try {
      setLoadingStats(true);
      const res = await fetch("/api/dashboard/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setDbStats(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        setSettingsForm(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadTabList = async (tabName: string) => {
    setActionError(null);
    setActionSuccess(null);
    setEditorMode(null);
    setEditingItem(null);
    setImageFile(null);
    setPdfFile(null);

    const apiMap: { [key: string]: string } = {
      sliders: "/api/sliders",
      facilities: "/api/facilities",
      stats: "/api/stats",
      news: "/api/news",
      teachers: "/api/teachers",
      authorities: "/api/authorities",
      achievements: "/api/achievements",
      clubs: "/api/clubs",
      gallery: "/api/gallery",
      testimonials: "/api/testimonials",
      routines: "/api/routines",
      exams: "/api/exams",
      academic: "/api/academic-blocks",
      admins: "/api/admins",
      admissions: "/api/admissions",
    };

    const endpoint = apiMap[tabName];
    if (!endpoint) return;

    try {
      const headers: any = {};
      if (["admins", "admissions", "academic"].includes(tabName)) {
        headers.Authorization = `Bearer ${token}`;
      }
      const res = await fetch(endpoint, { headers });
      if (res.ok) {
        const data = await res.json();
        if (tabName === "sliders") setSliders(data);
        else if (tabName === "facilities") setFacilities(data);
        else if (tabName === "stats") setStats(data);
        else if (tabName === "news") setNews(data);
        else if (tabName === "teachers") setTeachers(data);
        else if (tabName === "authorities") setAuthorities(data);
        else if (tabName === "achievements") setAchievements(data);
        else if (tabName === "clubs") setClubs(data);
        else if (tabName === "gallery") setGallery(data);
        else if (tabName === "testimonials") setTestimonials(data);
        else if (tabName === "routines") setRoutines(data);
        else if (tabName === "exams") setExams(data);
        else if (tabName === "academic") setAcademicBlocks(data);
        else if (tabName === "admins") setAdminsList(data);
        else if (tabName === "admissions") setAdmissions(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    fetchSettings();
  }, [token]);

  useEffect(() => {
    if (activeTab === "dashboard") {
      fetchDashboardStats();
    } else {
      loadTabList(activeTab);
    }
  }, [activeTab]);

  // Settings Save Handle
  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setActionError(null);
      setActionSuccess(null);

      const payload = new FormData();
      Object.keys(settingsForm).forEach((key) => {
        if (settingsForm[key] !== null && settingsForm[key] !== undefined) {
          payload.append(key, settingsForm[key]);
        }
      });

      if (logoFile) payload.append("logo", logoFile);
      if (faviconFile) payload.append("favicon", faviconFile);

      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: payload,
      });

      if (res.ok) {
        const data = await res.json();
        setSettingsForm(data);
        setActionSuccess("Site Settings and SMTP saved successfully!");
        setLogoFile(null);
        setFaviconFile(null);
        onSettingsUpdate();
      } else {
        const errData = await res.json();
        setActionError(errData.error || "Failed to save settings.");
      }
    } catch (err) {
      setActionError("Server connection error.");
    } finally {
      setSubmitting(false);
    }
  };

  // Content Operations (Add/Edit/Delete)
  const handleInitiateAdd = () => {
    setEditorMode("add");
    setEditingItem(null);
    setFormFields({});
    setImageFile(null);
    setPdfFile(null);
    setActionError(null);
    setActionSuccess(null);
  };

  const handleInitiateEdit = (item: any) => {
    setEditorMode("edit");
    setEditingItem(item);
    setFormFields({ ...item });
    setImageFile(null);
    setPdfFile(null);
    setActionError(null);
    setActionSuccess(null);
  };

  const handleItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setActionError(null);
      setActionSuccess(null);

      let url = "";
      let method = "POST";

      const mapping: { [key: string]: string } = {
        sliders: "/api/sliders",
        facilities: "/api/facilities",
        stats: "/api/stats",
        news: "/api/news",
        teachers: "/api/teachers",
        authorities: "/api/authorities",
        achievements: "/api/achievements",
        clubs: "/api/clubs",
        gallery: "/api/gallery",
        testimonials: "/api/testimonials",
        routines: "/api/routines",
        exams: "/api/exams",
        academic: "/api/academic-blocks",
        admins: "/api/admins",
      };

      url = mapping[activeTab];
      if (editorMode === "edit") {
        url += activeTab === "academic" ? `/${editingItem.section}` : `/${editingItem.id}`;
        method = "PUT";
      }

      let body: any;
      const headers: any = { Authorization: `Bearer ${token}` };

      // Check if file upload is needed
      const multipartTabs = ["sliders", "news", "teachers", "authorities", "achievements", "clubs", "gallery", "routines", "exams", "academic", "stats"];
      if (multipartTabs.includes(activeTab)) {
        const payload = new FormData();
        Object.keys(formFields).forEach((key) => {
          if (formFields[key] !== null && formFields[key] !== undefined) {
            payload.append(key, formFields[key]);
          }
        });
        if (imageFile) payload.append(activeTab === "teachers" || activeTab === "authorities" ? "photo" : activeTab === "clubs" ? "cover" : "image", imageFile);
        if (pdfFile) payload.append("pdf", pdfFile);
        body = payload;
      } else {
        headers["Content-Type"] = "application/json";
        body = JSON.stringify(formFields);
      }

      const res = await fetch(url, { method, headers, body });
      const data = await res.json();

      if (res.ok) {
        setActionSuccess(`Item successfully ${editorMode === "add" ? "added" : "updated"}!`);
        setEditorMode(null);
        setEditingItem(null);
        loadTabList(activeTab);
      } else {
        setActionError(data.error || "Failed to process entry.");
      }
    } catch (err) {
      setActionError("Server network failure.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleItemDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to permanently delete this item? This deletes associated assets from Cloudinary too.")) return;
    try {
      setActionError(null);
      setActionSuccess(null);
      const res = await fetch(`/api/${activeTab === "exams" ? "exams" : activeTab === "routines" ? "routines" : activeTab}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setActionSuccess("Item deleted successfully.");
        loadTabList(activeTab);
      } else {
        const data = await res.json();
        setActionError(data.error || "Failed to delete item.");
      }
    } catch (err) {
      setActionError("Network error deleting item.");
    }
  };

  // Admissions Controls
  const handleAdmissionStatus = async (id: number, status: string) => {
    try {
      setActionError(null);
      setActionSuccess(null);
      setSubmitting(true);
      const res = await fetch(`/api/admissions/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, adminNotes: adminNotesText }),
      });
      if (res.ok) {
        setActionSuccess(`Application SUN-${id} updated to ${status} and decision email dispatched.`);
        setAdminNotesText("");
        loadTabList("admissions");
      } else {
        const data = await res.json();
        setActionError(data.error || "Failed to update status.");
      }
    } catch (err) {
      setActionError("Admissions gateway error.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportCSV = () => {
    window.open(`/api/admissions/export?token=${token}`, "_blank");
  };

  // Club Members / Gallery Controls
  const handleClubWorkSelect = async (club: Club) => {
    try {
      const res = await fetch(`/api/clubs/${club.id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedClub(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddClubMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClub || !newMemberName || !newMemberRole) return;
    try {
      setSubmitting(true);
      const payload = new FormData();
      payload.append("name", newMemberName);
      payload.append("role", newMemberRole);
      if (memberPhoto) payload.append("photo", memberPhoto);

      const res = await fetch(`/api/clubs/${selectedClub.id}/members`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: payload,
      });

      if (res.ok) {
        setNewMemberName("");
        setNewMemberRole("");
        setMemberPhoto(null);
        handleClubWorkSelect(selectedClub);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClubMember = async (memberId: number) => {
    if (!selectedClub) return;
    try {
      const res = await fetch(`/api/clubs/${selectedClub.id}/members/${memberId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        handleClubWorkSelect(selectedClub);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddClubImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClub || !clubGalleryFile) return;
    try {
      setSubmitting(true);
      const payload = new FormData();
      payload.append("image", clubGalleryFile);

      const res = await fetch(`/api/clubs/${selectedClub.id}/gallery`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: payload,
      });

      if (res.ok) {
        setClubGalleryFile(null);
        handleClubWorkSelect(selectedClub);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClubImage = async (imgId: number) => {
    if (!selectedClub) return;
    try {
      const res = await fetch(`/api/clubs/${selectedClub.id}/gallery/${imgId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        handleClubWorkSelect(selectedClub);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filter Admissions list
  const filteredAdmissions = admissions.filter((app) => {
    const matchesStatus = admissionFilter === "All" || app.status === admissionFilter;
    const matchesSearch =
      app.studentName.toLowerCase().includes(admissionSearch.toLowerCase()) ||
      app.guardianName.toLowerCase().includes(admissionSearch.toLowerCase()) ||
      app.guardianEmail.toLowerCase().includes(admissionSearch.toLowerCase()) ||
      `SUN-${app.id}`.toLowerCase().includes(admissionSearch.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-800 font-sans">
      {/* 1. Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 text-slate-400 p-6 space-y-8 flex flex-col justify-between shrink-0 hidden md:flex">
        <div className="space-y-8">
          <div>
            <h2 className="text-white font-display font-extrabold text-base tracking-tight leading-tight">
              Sunrise School
            </h2>
            <p className="text-[10px] text-yellow-400 font-mono font-bold tracking-wider mt-1">ADMINISTRATOR CORE</p>
          </div>

          <nav className="space-y-1.5 text-xs font-semibold">
            <button
              onClick={() => { setActiveTab("dashboard"); setSelectedClub(null); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition ${
                activeTab === "dashboard" ? "bg-yellow-500 text-slate-950 shadow-sm" : "hover:bg-slate-800 hover:text-white"
              }`}
            >
              <LayoutDashboard size={16} />
              <span>Dashboard Core</span>
            </button>

            <button
              onClick={() => { setActiveTab("admissions"); setSelectedClub(null); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition ${
                activeTab === "admissions" ? "bg-yellow-500 text-slate-950 shadow-sm" : "hover:bg-slate-800 hover:text-white"
              }`}
            >
              <GraduationCap size={16} />
              <span>Admissions Grid</span>
            </button>

            <button
              onClick={() => { setActiveTab("settings"); setSelectedClub(null); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition ${
                activeTab === "settings" ? "bg-yellow-500 text-slate-950 shadow-sm" : "hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Settings size={16} />
              <span>Site & SMTP Settings</span>
            </button>

            {admin?.role === "super_admin" && (
              <button
                onClick={() => { setActiveTab("admins"); setSelectedClub(null); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition ${
                  activeTab === "admins" ? "bg-yellow-500 text-slate-950 shadow-sm" : "hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Users2 size={16} />
                <span>Manage Admins</span>
              </button>
            )}

            <div className="pt-4 pb-2 border-t border-slate-800 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
              Content Modules
            </div>

            <button
              onClick={() => { setActiveTab("sliders"); setSelectedClub(null); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition ${
                activeTab === "sliders" ? "bg-yellow-500 text-slate-950 shadow-sm" : "hover:bg-slate-800 hover:text-white"
              }`}
            >
              <SliderIcon size={16} />
              <span>Hero Sliders</span>
            </button>

            <button
              onClick={() => { setActiveTab("facilities"); setSelectedClub(null); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition ${
                activeTab === "facilities" ? "bg-yellow-500 text-slate-950 shadow-sm" : "hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Building2 size={16} />
              <span>Campus Facilities</span>
            </button>

            <button
              onClick={() => { setActiveTab("stats"); setSelectedClub(null); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition ${
                activeTab === "stats" ? "bg-yellow-500 text-slate-950 shadow-sm" : "hover:bg-slate-800 hover:text-white"
              }`}
            >
              <LayoutDashboard size={16} />
              <span>Counters Stats</span>
            </button>

            <button
              onClick={() => { setActiveTab("news"); setSelectedClub(null); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition ${
                activeTab === "news" ? "bg-yellow-500 text-slate-950 shadow-sm" : "hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Newspaper size={16} />
              <span>News & Blog Posts</span>
            </button>

            <button
              onClick={() => { setActiveTab("teachers"); setSelectedClub(null); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition ${
                activeTab === "teachers" ? "bg-yellow-500 text-slate-950 shadow-sm" : "hover:bg-slate-800 hover:text-white"
              }`}
            >
              <GraduationCap size={16} />
              <span>Teachers & Staff</span>
            </button>

            <button
              onClick={() => { setActiveTab("authorities"); setSelectedClub(null); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition ${
                activeTab === "authorities" ? "bg-yellow-500 text-slate-950 shadow-sm" : "hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Users size={16} />
              <span>School Leaders</span>
            </button>

            <button
              onClick={() => { setActiveTab("achievements"); setSelectedClub(null); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition ${
                activeTab === "achievements" ? "bg-yellow-500 text-slate-950 shadow-sm" : "hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Award size={16} />
              <span>Achievements</span>
            </button>

            <button
              onClick={() => { setActiveTab("academic"); setSelectedClub(null); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition ${
                activeTab === "academic" ? "bg-yellow-500 text-slate-950 shadow-sm" : "hover:bg-slate-800 hover:text-white"
              }`}
            >
              <BookOpen size={16} />
              <span>Academic Blocks</span>
            </button>

            <button
              onClick={() => { setActiveTab("clubs"); setSelectedClub(null); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition ${
                activeTab === "clubs" ? "bg-yellow-500 text-slate-950 shadow-sm" : "hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Users2 size={16} />
              <span>Clubs CRUD</span>
            </button>

            <button
              onClick={() => { setActiveTab("routines"); setSelectedClub(null); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition ${
                activeTab === "routines" || activeTab === "exams" ? "bg-yellow-500 text-slate-950 shadow-sm" : "hover:bg-slate-800 hover:text-white"
              }`}
            >
              <FileSpreadsheet size={16} />
              <span>Routines & Exam PDFs</span>
            </button>

            <button
              onClick={() => { setActiveTab("testimonials"); setSelectedClub(null); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition ${
                activeTab === "testimonials" ? "bg-yellow-500 text-slate-950 shadow-sm" : "hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Heart size={16} />
              <span>Testimonials</span>
            </button>

            <button
              onClick={() => { setActiveTab("gallery"); setSelectedClub(null); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition ${
                activeTab === "gallery" ? "bg-yellow-500 text-slate-950 shadow-sm" : "hover:bg-slate-800 hover:text-white"
              }`}
            >
              <ImageIcon size={16} />
              <span>Gallery Uploads</span>
            </button>
          </nav>
        </div>

        {/* Admin profile detail & Logout */}
        <div className="pt-6 border-t border-slate-800 space-y-4">
          <div className="text-xs">
            <span className="text-white block font-semibold truncate">{admin?.name}</span>
            <span className="text-[10px] text-yellow-400 font-mono font-bold block uppercase">{admin?.role}</span>
          </div>
          <button
            onClick={onLogout}
            className="w-full text-left flex items-center gap-2 text-slate-400 hover:text-white text-xs font-bold transition"
          >
            <LogOut size={14} />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>

      {/* 2. Main Content Frame */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Header of Admin Frame */}
        <header className="bg-white border-b border-slate-100 py-4 px-6 sm:px-8 flex items-center justify-between shadow-sm">
          <div>
            <h1 className="font-display font-extrabold text-slate-800 text-lg capitalize tracking-tight">
              {activeTab} Management Workspace
            </h1>
            <p className="text-xs text-slate-400">Authenticated: {admin?.name} ({admin?.role})</p>
          </div>
          <button
            onClick={onLogout}
            className="md:hidden p-2 text-slate-500 hover:text-slate-950 transition"
          >
            <LogOut size={20} />
          </button>
        </header>

        {/* Main Workspace Scroll Area */}
        <div className="p-6 sm:p-8 flex-1 overflow-y-auto max-w-6xl w-full mx-auto space-y-8">
          {actionError && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-xs font-bold flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{actionError}</span>
            </div>
          )}

          {actionSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs font-bold flex items-center gap-2">
              <Check size={16} className="shrink-0" />
              <span>{actionSuccess}</span>
            </div>
          )}

          {/* ==============================================
              TAB CONTENT A: DASHBOARD CORE STATS
              ============================================== */}
          {activeTab === "dashboard" && (
            <div className="space-y-8">
              {loadingStats ? (
                <div className="text-center py-20 text-slate-400 text-xs">Loading analytics data...</div>
              ) : (
                <>
                  {/* Grid Stat Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Admissions</span>
                      <h3 className="text-2xl font-extrabold tracking-tight text-slate-950 mt-1">{dbStats?.counts?.admissions || 0}</h3>
                      <span className="text-[10px] font-mono font-bold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded mt-2 inline-block">
                        {dbStats?.pendingAdmissions || 0} Pending Review
                      </span>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Teachers</span>
                      <h3 className="text-2xl font-extrabold tracking-tight text-slate-950 mt-1">{dbStats?.counts?.teachers || 0}</h3>
                      <span className="text-[10px] text-slate-400 block mt-2">Active Faculty List</span>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Extracurricular Clubs</span>
                      <h3 className="text-2xl font-extrabold tracking-tight text-slate-950 mt-1">{dbStats?.counts?.clubs || 0}</h3>
                      <span className="text-[10px] text-slate-400 block mt-2">Live Dynamic Pages</span>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">News & Blogs</span>
                      <h3 className="text-2xl font-extrabold tracking-tight text-slate-950 mt-1">{dbStats?.counts?.news || 0}</h3>
                      <span className="text-[10px] text-slate-400 block mt-2">Syllabus Routine PDF count: {(dbStats?.counts?.routines || 0) + (dbStats?.counts?.exams || 0)}</span>
                    </div>
                  </div>

                  {/* Recent Admissions Table */}
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
                    <h3 className="font-display font-bold text-slate-800 text-sm sm:text-base">Recent Student Admissions</h3>
                    {(!dbStats?.recentAdmissions || dbStats.recentAdmissions.length === 0) ? (
                      <p className="text-xs text-slate-400 py-4">No recent admissions applications.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left divide-y divide-slate-100">
                          <thead>
                            <tr className="text-slate-400 font-bold">
                              <th className="py-3 px-4">Ref ID</th>
                              <th className="py-3 px-4">Student Name</th>
                              <th className="py-3 px-4">Class</th>
                              <th className="py-3 px-4">Guardian Details</th>
                              <th className="py-3 px-4">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50 font-medium">
                            {dbStats.recentAdmissions.map((app: any) => (
                              <tr key={app.id}>
                                <td className="py-3 px-4 font-mono font-bold text-slate-500">SUN-{app.id}</td>
                                <td className="py-3 px-4 text-slate-900">{app.studentName}</td>
                                <td className="py-3 px-4 text-slate-500">Grade: {app.classApplyingFor}</td>
                                <td className="py-3 px-4 text-slate-500">{app.guardianName} ({app.guardianPhone})</td>
                                <td className="py-3 px-4">
                                  <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] uppercase ${
                                    app.status === "Accepted" ? "bg-emerald-50 text-emerald-600" :
                                    app.status === "Rejected" ? "bg-red-50 text-red-600" :
                                    "bg-yellow-50 text-yellow-600"
                                  }`}>
                                    {app.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ==============================================
              TAB CONTENT B: ADMISSIONS WORKSPACE LISTING
              ============================================== */}
          {activeTab === "admissions" && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex flex-wrap items-center gap-3">
                  {/* Search bar */}
                  <input
                    type="text"
                    value={admissionSearch}
                    onChange={(e) => setAdmissionSearch(e.target.value)}
                    placeholder="Search by student/reference..."
                    className="text-xs border border-slate-200 bg-slate-50 focus:bg-white rounded-xl px-4 py-2 outline-none transition w-64"
                  />
                  {/* Status Filters */}
                  {["All", "Pending", "Accepted", "Rejected"].map((st) => (
                    <button
                      key={st}
                      onClick={() => setAdmissionFilter(st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        admissionFilter === st ? "bg-slate-950 text-white" : "text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleExportCSV}
                  className="bg-slate-900 text-white font-semibold text-xs px-4 py-2 rounded-xl hover:bg-yellow-500 hover:text-slate-950 transition flex items-center gap-1.5 shadow-sm"
                >
                  <Download size={14} />
                  <span>Export CSV Sheet</span>
                </button>
              </div>

              {/* Applications Listing */}
              <div className="space-y-4">
                {filteredAdmissions.length === 0 ? (
                  <p className="text-center py-20 text-slate-400 text-xs bg-white rounded-3xl border border-slate-100">No applications matched the filter parameters.</p>
                ) : (
                  filteredAdmissions.map((app) => (
                    <div key={app.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
                      <div className="flex flex-wrap justify-between items-start gap-4 border-b border-slate-50 pb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-slate-400">SUN-{app.id}</span>
                            <span className={`px-2 py-0.5 rounded font-mono font-bold text-[9px] uppercase ${
                              app.status === "Accepted" ? "bg-emerald-50 text-emerald-600" :
                              app.status === "Rejected" ? "bg-red-50 text-red-600" :
                              "bg-yellow-50 text-yellow-600"
                            }`}>
                              {app.status}
                            </span>
                          </div>
                          <h3 className="font-display font-extrabold text-slate-950 text-base mt-1">{app.studentName}</h3>
                          <p className="text-xs text-slate-400 mt-0.5">Applied on: {new Date(app.createdAt).toLocaleString()}</p>
                        </div>

                        {app.status === "Pending" && (
                          <div className="flex gap-2">
                            <button
                              disabled={submitting}
                              onClick={() => handleAdmissionStatus(app.id, "Accepted")}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
                            >
                              Approve / Accept
                            </button>
                            <button
                              disabled={submitting}
                              onClick={() => handleAdmissionStatus(app.id, "Rejected")}
                              className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
                            >
                              Decline / Reject
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Detail Particulars */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-xs">
                        <div>
                          <span className="text-slate-400 block font-bold uppercase text-[9px]">Student DOB</span>
                          <span className="text-slate-800 font-semibold mt-1 block">{app.dob}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-bold uppercase text-[9px]">Class Seeking</span>
                          <span className="text-slate-800 font-semibold mt-1 block">Grade: {app.classApplyingFor}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-bold uppercase text-[9px]">Legal Document</span>
                          {app.documentUrl ? (
                            <a href={app.documentUrl} target="_blank" rel="noopener noreferrer" className="text-yellow-600 font-bold underline mt-1 block">
                              View Uploaded File
                            </a>
                          ) : (
                            <span className="text-slate-400 mt-1 block">No attachment uploaded</span>
                          )}
                        </div>
                        <div>
                          <span className="text-slate-400 block font-bold uppercase text-[9px]">Guardian Name</span>
                          <span className="text-slate-800 font-semibold mt-1 block">{app.guardianName}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-bold uppercase text-[9px]">Guardian Contact</span>
                          <span className="text-slate-800 font-semibold mt-1 block">{app.guardianPhone} / {app.guardianEmail}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-bold uppercase text-[9px]">Residential Address</span>
                          <span className="text-slate-800 font-semibold mt-1 block">{app.address}</span>
                        </div>
                      </div>

                      {/* Decision Log Notes */}
                      {app.status !== "Pending" && (
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Decision Record</span>
                          <p className="text-slate-700 mt-1">
                            Approved/Declined by: <strong>{app.decidedBy || "System"}</strong> on{" "}
                            <strong>{app.decidedAt ? new Date(app.decidedAt).toLocaleString() : "N/A"}</strong>
                          </p>
                          {app.adminNotes && (
                            <p className="text-slate-600 italic mt-2">"Notes: {app.adminNotes}"</p>
                          )}
                        </div>
                      )}

                      {/* Notes input for pending */}
                      {app.status === "Pending" && (
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-600 block">Decision Note / Reason (Dispatched in email if rejecting) *</label>
                          <textarea
                            value={adminNotesText}
                            onChange={(e) => setAdminNotesText(e.target.value)}
                            placeholder="Add internal remarks, missing parameters, or steps before approving/declining..."
                            className="w-full text-xs border border-slate-200 bg-slate-50 focus:bg-white rounded-xl p-3 outline-none transition resize-none"
                            rows={2}
                          />
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ==============================================
              TAB CONTENT C: SITE SETTINGS & SMTP CONFIG
              ============================================== */}
          {activeTab === "settings" && (
            <form onSubmit={handleSettingsSubmit} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 sm:p-12 space-y-10">
              {/* Part 1: Branding and School Details */}
              <div className="space-y-6">
                <h3 className="font-display font-bold text-slate-800 text-sm sm:text-base border-b border-slate-50 pb-2">
                  Branding & Contact Info
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 block">School Name *</label>
                    <input
                      type="text"
                      required
                      value={settingsForm.schoolName || ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, schoolName: e.target.value })}
                      className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white rounded-xl px-4 py-3 outline-none transition"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 block">Tagline / Slogan *</label>
                    <input
                      type="text"
                      required
                      value={settingsForm.tagline || ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                      className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white rounded-xl px-4 py-3 outline-none transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 block">Hotline Phone 1 *</label>
                    <input
                      type="text"
                      required
                      value={settingsForm.phone1 || ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, phone1: e.target.value })}
                      className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white rounded-xl px-4 py-3 outline-none transition"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 block">Hotline Phone 2</label>
                    <input
                      type="text"
                      value={settingsForm.phone2 || ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, phone2: e.target.value })}
                      className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white rounded-xl px-4 py-3 outline-none transition"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 block">Administrative Email Address *</label>
                    <input
                      type="email"
                      required
                      value={settingsForm.email || ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                      className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white rounded-xl px-4 py-3 outline-none transition"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 block">Physical Location Address *</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.address || ""}
                    onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                    className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white rounded-xl px-4 py-3 outline-none transition"
                  />
                </div>

                {/* Media assets */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <span className="text-xs font-bold text-slate-600 block">School Official Logo</span>
                    {settingsForm.logoUrl && (
                      <img src={settingsForm.logoUrl} alt="logo" referrerPolicy="no-referrer" className="h-16 w-16 object-contain rounded bg-white p-1 border" />
                    )}
                    <input
                      type="file"
                      onChange={(e) => { if (e.target.files?.[0]) setLogoFile(e.target.files[0]); }}
                      className="text-xs w-full block mt-2"
                      accept=".png,.jpg,.jpeg"
                    />
                  </div>

                  <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <span className="text-xs font-bold text-slate-600 block">Favicon</span>
                    {settingsForm.faviconUrl && (
                      <img src={settingsForm.faviconUrl} alt="favicon" referrerPolicy="no-referrer" className="h-8 w-8 object-contain rounded bg-white p-1 border" />
                    )}
                    <input
                      type="file"
                      onChange={(e) => { if (e.target.files?.[0]) setFaviconFile(e.target.files[0]); }}
                      className="text-xs w-full block mt-2"
                      accept=".ico,.png"
                    />
                  </div>
                </div>
              </div>

              {/* Part 2: Social Media handles */}
              <div className="space-y-6">
                <h3 className="font-display font-bold text-slate-800 text-sm sm:text-base border-b border-slate-50 pb-2">
                  Social Channels
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 block">Facebook Page URL</label>
                    <input
                      type="text"
                      value={settingsForm.facebookUrl || ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, facebookUrl: e.target.value })}
                      className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white rounded-xl px-4 py-3 outline-none transition"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 block">Twitter / X handle URL</label>
                    <input
                      type="text"
                      value={settingsForm.twitterUrl || ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, twitterUrl: e.target.value })}
                      className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white rounded-xl px-4 py-3 outline-none transition"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 block">YouTube Channel URL</label>
                    <input
                      type="text"
                      value={settingsForm.youtubeUrl || ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, youtubeUrl: e.target.value })}
                      className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white rounded-xl px-4 py-3 outline-none transition"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 block">Instagram Link URL</label>
                    <input
                      type="text"
                      value={settingsForm.instagramUrl || ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, instagramUrl: e.target.value })}
                      className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white rounded-xl px-4 py-3 outline-none transition"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 block">WhatsApp Click-to-Chat Link</label>
                    <input
                      type="text"
                      value={settingsForm.whatsappUrl || ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, whatsappUrl: e.target.value })}
                      className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white rounded-xl px-4 py-3 outline-none transition"
                    />
                  </div>
                </div>
              </div>

              {/* Part 3: SMTP Credentials (form editable) */}
              <div className="space-y-6">
                <h3 className="font-display font-bold text-slate-800 text-sm sm:text-base border-b border-slate-50 pb-2">
                  Transactional SMTP Mail Credentials
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 block">SMTP Relay Host *</label>
                    <input
                      type="text"
                      required
                      value={settingsForm.smtpHost || ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, smtpHost: e.target.value })}
                      className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white rounded-xl px-4 py-3 outline-none transition"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 block">SMTP Port *</label>
                    <input
                      type="number"
                      required
                      value={settingsForm.smtpPort || ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, smtpPort: e.target.value })}
                      className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white rounded-xl px-4 py-3 outline-none transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 block">SMTP Username *</label>
                    <input
                      type="text"
                      required
                      value={settingsForm.smtpUser || ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, smtpUser: e.target.value })}
                      className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white rounded-xl px-4 py-3 outline-none transition"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 block">SMTP Password *</label>
                    <input
                      type="password"
                      required
                      value={settingsForm.smtpPassword || ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, smtpPassword: e.target.value })}
                      placeholder="••••••••••••••"
                      className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white rounded-xl px-4 py-3 outline-none transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 block">SMTP Outgoing Sender Name *</label>
                    <input
                      type="text"
                      required
                      value={settingsForm.smtpFromName || ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, smtpFromName: e.target.value })}
                      className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white rounded-xl px-4 py-3 outline-none transition"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 block">SMTP Outgoing Sender Email Address *</label>
                    <input
                      type="email"
                      required
                      value={settingsForm.smtpFromEmail || ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, smtpFromEmail: e.target.value })}
                      className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white rounded-xl px-4 py-3 outline-none transition"
                    />
                  </div>
                </div>
              </div>

              {/* Submit settings button */}
              <div className="pt-4 border-t border-slate-50 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-slate-900 text-white font-bold text-xs px-8 py-3.5 rounded-xl hover:bg-yellow-500 hover:text-slate-950 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {submitting && <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />}
                  <span>Save Administrative Settings</span>
                </button>
              </div>
            </form>
          )}

          {/* ==============================================
              TAB CONTENT D: MANAGE ADMINS (SUPER_ADMIN ONLY)
              ============================================== */}
          {activeTab === "admins" && admin?.role === "super_admin" && (
            <div className="space-y-6">
              {/* Header add triggers */}
              <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800">Global Admin Staff Listing</h3>
                {!editorMode && (
                  <button
                    onClick={handleInitiateAdd}
                    className="bg-slate-900 text-white font-bold text-xs px-4 py-2 rounded-xl hover:bg-yellow-500 hover:text-slate-950 transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Create Admin Account</span>
                  </button>
                )}
              </div>

              {/* CRUD Editor Form */}
              {editorMode && (
                <form onSubmit={handleItemSubmit} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-6">
                  <h3 className="font-display font-bold text-slate-800 text-sm capitalize">
                    {editorMode} System Administrator Profile
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600 block">Name *</label>
                      <input
                        type="text"
                        required
                        value={formFields.name || ""}
                        onChange={(e) => setFormFields({ ...formFields, name: e.target.value })}
                        className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white rounded-xl px-4 py-3 outline-none transition"
                      />
                    </div>
                    {editorMode === "add" && (
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600 block">Email Address (Login ID) *</label>
                        <input
                          type="email"
                          required
                          value={formFields.email || ""}
                          onChange={(e) => setFormFields({ ...formFields, email: e.target.value })}
                          className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white rounded-xl px-4 py-3 outline-none transition"
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600 block">Role Assignment *</label>
                      <select
                        value={formFields.role || "admin"}
                        onChange={(e) => setFormFields({ ...formFields, role: e.target.value })}
                        className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white rounded-xl px-4 py-3 outline-none transition"
                      >
                        <option value="admin">Regular Admin</option>
                        <option value="super_admin">Super Admin</option>
                      </select>
                    </div>

                    {editorMode === "edit" && (
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600 block">Status *</label>
                        <select
                          value={formFields.isDeactivated === true ? "Deactivated" : "Active"}
                          onChange={(e) => setFormFields({ ...formFields, isDeactivated: e.target.value === "Deactivated" })}
                          className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white rounded-xl px-4 py-3 outline-none transition"
                        >
                          <option value="Active">Active / Operational</option>
                          <option value="Deactivated">Deactivated</option>
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
                    <button
                      type="button"
                      onClick={() => setEditorMode(null)}
                      className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="bg-slate-900 text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-yellow-500 hover:text-slate-950 transition flex items-center gap-1 cursor-pointer"
                    >
                      {submitting && <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />}
                      <span>{editorMode === "add" ? "Create Account" : "Apply Changes"}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Admins Table */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left divide-y divide-slate-100">
                    <thead>
                      <tr className="text-slate-400 font-bold">
                        <th className="py-3.5 px-6">Name</th>
                        <th className="py-3.5 px-6">Email Address</th>
                        <th className="py-3.5 px-6">Role</th>
                        <th className="py-3.5 px-6">Status</th>
                        <th className="py-3.5 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 font-medium">
                      {adminsList.map((usr) => (
                        <tr key={usr.id}>
                          <td className="py-4 px-6 text-slate-900 font-semibold">{usr.name}</td>
                          <td className="py-4 px-6 text-slate-500">{usr.email}</td>
                          <td className="py-4 px-6 text-slate-500 capitalize">{usr.role.replace("_", " ")}</td>
                          <td className="py-4 px-6">
                            <span className={`px-2 py-0.5 rounded font-mono font-bold text-[9px] uppercase ${
                              usr.isDeactivated ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
                            }`}>
                              {usr.isDeactivated ? "Deactivated" : "Active"}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right space-x-2">
                            <button
                              onClick={() => handleInitiateEdit(usr)}
                              className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-slate-950 rounded transition"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleItemDelete(usr.id)}
                              className="p-1.5 hover:bg-slate-100 text-red-500 hover:text-red-700 rounded transition"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==============================================
              TAB CONTENT E: GENERIC LIST WORKSPACE (CRUD FOR ALL OTHERS)
              ============================================== */}
          {activeTab !== "dashboard" && activeTab !== "admissions" && activeTab !== "settings" && activeTab !== "admins" && (
            <div className="space-y-6">
              {/* Header add triggers */}
              <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 capitalize">{activeTab} Entry List</h3>
                {!editorMode && (
                  <button
                    onClick={handleInitiateAdd}
                    className="bg-slate-900 text-white font-bold text-xs px-4 py-2 rounded-xl hover:bg-yellow-500 hover:text-slate-950 transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Add New Item</span>
                  </button>
                )}
              </div>

              {/* CRUD Form */}
              {editorMode && (
                <form onSubmit={handleItemSubmit} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-6">
                  <h3 className="font-display font-bold text-slate-800 text-sm capitalize">
                    {editorMode} {activeTab} profile
                  </h3>

                  {/* Dynamic field generation depending on tab context */}

                  {/* 1. Sliders Fields */}
                  {activeTab === "sliders" && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-600 block">Title *</label>
                          <input
                            type="text"
                            required
                            value={formFields.title || ""}
                            onChange={(e) => setFormFields({ ...formFields, title: e.target.value })}
                            className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white rounded-xl px-4 py-3 outline-none transition"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-600 block">Caption *</label>
                          <input
                            type="text"
                            required
                            value={formFields.caption || ""}
                            onChange={(e) => setFormFields({ ...formFields, caption: e.target.value })}
                            className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white rounded-xl px-4 py-3 outline-none transition"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-600 block">CTA Button Text</label>
                          <input
                            type="text"
                            value={formFields.buttonText || ""}
                            onChange={(e) => setFormFields({ ...formFields, buttonText: e.target.value })}
                            className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white rounded-xl px-4 py-3 outline-none transition"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-600 block">CTA Button Link</label>
                          <input
                            type="text"
                            value={formFields.buttonUrl || ""}
                            onChange={(e) => setFormFields({ ...formFields, buttonUrl: e.target.value })}
                            className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white rounded-xl px-4 py-3 outline-none transition"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-600 block">Order *</label>
                          <input
                            type="number"
                            required
                            value={formFields.order || 0}
                            onChange={(e) => setFormFields({ ...formFields, order: parseInt(e.target.value, 10) })}
                            className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white rounded-xl px-4 py-3 outline-none transition"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600 block">Background Slide Image File *</label>
                        <input
                          type="file"
                          required={editorMode === "add"}
                          onChange={(e) => { if (e.target.files?.[0]) setImageFile(e.target.files[0]); }}
                          accept="image/*"
                          className="text-xs w-full block mt-2"
                        />
                      </div>
                    </div>
                  )}

                  {/* 2. Facilities Fields */}
                  {activeTab === "facilities" && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-600 block">Title *</label>
                          <input
                            type="text"
                            required
                            value={formFields.title || ""}
                            onChange={(e) => setFormFields({ ...formFields, title: e.target.value })}
                            className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white rounded-xl px-4 py-3 outline-none transition"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-600 block">Icon Keyword (e.g. Tv, Bus, Trees, School) *</label>
                          <input
                            type="text"
                            required
                            value={formFields.icon || "School"}
                            onChange={(e) => setFormFields({ ...formFields, icon: e.target.value })}
                            className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white rounded-xl px-4 py-3 outline-none transition"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-600 block">Page Link</label>
                          <input
                            type="text"
                            value={formFields.link || ""}
                            onChange={(e) => setFormFields({ ...formFields, link: e.target.value })}
                            className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white rounded-xl px-4 py-3 outline-none transition"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-600 block">Order *</label>
                          <input
                            type="number"
                            required
                            value={formFields.order || 0}
                            onChange={(e) => setFormFields({ ...formFields, order: parseInt(e.target.value, 10) })}
                            className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white rounded-xl px-4 py-3 outline-none transition"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600 block">Detailed Description *</label>
                        <textarea
                          required
                          value={formFields.description || ""}
                          onChange={(e) => setFormFields({ ...formFields, description: e.target.value })}
                          rows={3}
                          className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white rounded-xl p-3 outline-none transition resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* 3. Stats Fields */}
                  {activeTab === "stats" && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-600 block">Label * (e.g. Active Students)</label>
                          <input
                            type="text"
                            required
                            value={formFields.label || ""}
                            onChange={(e) => setFormFields({ ...formFields, label: e.target.value })}
                            className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white rounded-xl px-4 py-3 outline-none transition"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-600 block">Number/Value * (e.g. 650, 38, 100)</label>
                          <input
                            type="text"
                            required
                            value={formFields.value || ""}
                            onChange={(e) => setFormFields({ ...formFields, value: e.target.value })}
                            className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white rounded-xl px-4 py-3 outline-none transition"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-600 block">Suffix (optional, e.g. +, %)</label>
                          <input
                            type="text"
                            value={formFields.suffix || ""}
                            onChange={(e) => setFormFields({ ...formFields, suffix: e.target.value })}
                            className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white rounded-xl px-4 py-3 outline-none transition"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-600 block">Display Icon (e.g. Award, Users, Library)</label>
                          <input
                            type="text"
                            value={formFields.icon || ""}
                            onChange={(e) => setFormFields({ ...formFields, icon: e.target.value })}
                            className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white rounded-xl px-4 py-3 outline-none transition"
                            placeholder="Award"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-600 block">Display Order *</label>
                          <input
                            type="number"
                            required
                            value={formFields.order !== undefined ? formFields.order : 0}
                            onChange={(e) => setFormFields({ ...formFields, order: parseInt(e.target.value, 10) || 0 })}
                            className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white rounded-xl px-4 py-3 outline-none transition"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600 block">Custom Icon Image File (optional, overrides text icon)</label>
                        <input
                          type="file"
                          onChange={(e) => { if (e.target.files?.[0]) setImageFile(e.target.files[0]); }}
                          accept="image/*"
                          className="text-xs w-full block mt-2"
                        />
                        {formFields.imageUrl && (
                          <div className="mt-2 flex items-center gap-3">
                            <img src={formFields.imageUrl} alt="Current icon" className="h-10 w-10 object-contain rounded bg-slate-100 p-1" referrerPolicy="no-referrer" />
                            <span className="text-xs text-slate-500">Current uploaded icon</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 4. News Fields */}
                  {activeTab === "news" && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600 block">News Post Title *</label>
                        <input
                          type="text"
                          required
                          value={formFields.title || ""}
                          onChange={(e) => setFormFields({ ...formFields, title: e.target.value })}
                          className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white rounded-xl px-4 py-3 outline-none transition"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600 block">Article Content *</label>
                        <textarea
                          required
                          value={formFields.content || ""}
                          onChange={(e) => setFormFields({ ...formFields, content: e.target.value })}
                          rows={6}
                          className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white rounded-xl p-3 outline-none transition resize-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600 block">Post Cover Image</label>
                        <input
                          type="file"
                          onChange={(e) => { if (e.target.files?.[0]) setImageFile(e.target.files[0]); }}
                          accept="image/*"
                          className="text-xs w-full block mt-2"
                        />
                      </div>
                    </div>
                  )}

                  {/* 5. Teachers Fields */}
                  {activeTab === "teachers" && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-600 block">Name *</label>
                          <input
                            type="text"
                            required
                            value={formFields.name || ""}
                            onChange={(e) => setFormFields({ ...formFields, name: e.target.value })}
                            className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white rounded-xl px-4 py-3 outline-none transition"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-600 block">Designation *</label>
                          <input
                            type="text"
                            required
                            value={formFields.designation || ""}
                            onChange={(e) => setFormFields({ ...formFields, designation: e.target.value })}
                            className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white rounded-xl px-4 py-3 outline-none transition"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-600 block">Email Address</label>
                          <input
                            type="email"
                            value={formFields.email || ""}
                            onChange={(e) => setFormFields({ ...formFields, email: e.target.value })}
                            className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white rounded-xl px-4 py-3 outline-none transition"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-600 block">Order *</label>
                          <input
                            type="number"
                            required
                            value={formFields.order || 0}
                            onChange={(e) => setFormFields({ ...formFields, order: parseInt(e.target.value, 10) })}
                            className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white rounded-xl px-4 py-3 outline-none transition"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-600 block">Facebook Link</label>
                          <input
                            type="text"
                            value={formFields.facebook || ""}
                            onChange={(e) => setFormFields({ ...formFields, facebook: e.target.value })}
                            className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white rounded-xl px-4 py-3 outline-none transition"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-600 block">Twitter Link</label>
                          <input
                            type="text"
                            value={formFields.twitter || ""}
                            onChange={(e) => setFormFields({ ...formFields, twitter: e.target.value })}
                            className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white rounded-xl px-4 py-3 outline-none transition"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-600 block">LinkedIn Link</label>
                          <input
                            type="text"
                            value={formFields.linkedin || ""}
                            onChange={(e) => setFormFields({ ...formFields, linkedin: e.target.value })}
                            className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white rounded-xl px-4 py-3 outline-none transition"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600 block">Biography / Message</label>
                        <textarea
                          value={formFields.bio || ""}
                          onChange={(e) => setFormFields({ ...formFields, bio: e.target.value })}
                          rows={3}
                          className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white rounded-xl p-3 outline-none transition resize-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600 block">Profile Portrait *</label>
                        <input
                          type="file"
                          required={editorMode === "add"}
                          onChange={(e) => { if (e.target.files?.[0]) setImageFile(e.target.files[0]); }}
                          accept="image/*"
                          className="text-xs w-full block mt-2"
                        />
                      </div>
                    </div>
                  )}

                  {/* 6. Authorities Fields */}
                  {activeTab === "authorities" && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-600 block">Name *</label>
                          <input
                            type="text"
                            required
                            value={formFields.name || ""}
                            onChange={(e) => setFormFields({ ...formFields, name: e.target.value })}
                            className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white rounded-xl px-4 py-3 outline-none transition"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-600 block">Designation *</label>
                          <input
                            type="text"
                            required
                            value={formFields.designation || ""}
                            onChange={(e) => setFormFields({ ...formFields, designation: e.target.value })}
                            className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white rounded-xl px-4 py-3 outline-none transition"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-600 block">Authority Type *</label>
                          <select
                            value={formFields.type || "principal"}
                            onChange={(e) => setFormFields({ ...formFields, type: e.target.value })}
                            className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white rounded-xl px-4 py-3 outline-none transition"
                          >
                            <option value="principal">Principal</option>
                            <option value="chair">Chairman of Governing Body</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-600 block">Order *</label>
                          <input
                            type="number"
                            required
                            value={formFields.order || 0}
                            onChange={(e) => setFormFields({ ...formFields, order: parseInt(e.target.value, 10) })}
                            className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white rounded-xl px-4 py-3 outline-none transition"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600 block">Official Message Text *</label>
                        <textarea
                          required
                          value={formFields.message || ""}
                          onChange={(e) => setFormFields({ ...formFields, message: e.target.value })}
                          rows={4}
                          className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white rounded-xl p-3 outline-none transition resize-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600 block">Official Portrait *</label>
                        <input
                          type="file"
                          required={editorMode === "add"}
                          onChange={(e) => { if (e.target.files?.[0]) setImageFile(e.target.files[0]); }}
                          accept="image/*"
                          className="text-xs w-full block mt-2"
                        />
                      </div>
                    </div>
                  )}

                  {/* 7. Achievements Fields */}
                  {activeTab === "achievements" && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-600 block">Achievement Title *</label>
                          <input
                            type="text"
                            required
                            value={formFields.title || ""}
                            onChange={(e) => setFormFields({ ...formFields, title: e.target.value })}
                            className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white rounded-xl px-4 py-3 outline-none transition"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-600 block">Achievement Date *</label>
                          <input
                            type="text"
                            required
                            value={formFields.date || ""}
                            placeholder="e.g. June 2026"
                            onChange={(e) => setFormFields({ ...formFields, date: e.target.value })}
                            className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white rounded-xl px-4 py-3 outline-none transition"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600 block">Description *</label>
                        <textarea
                          required
                          value={formFields.description || ""}
                          onChange={(e) => setFormFields({ ...formFields, description: e.target.value })}
                          rows={3}
                          className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white rounded-xl p-3 outline-none transition resize-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600 block">Trophy / Award Photograph *</label>
                        <input
                          type="file"
                          required={editorMode === "add"}
                          onChange={(e) => { if (e.target.files?.[0]) setImageFile(e.target.files[0]); }}
                          accept="image/*"
                          className="text-xs w-full block mt-2"
                        />
                      </div>
                    </div>
                  )}

                  {/* 8. Clubs Fields */}
                  {activeTab === "clubs" && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-600 block">Club Name *</label>
                          <input
                            type="text"
                            required
                            value={formFields.name || ""}
                            onChange={(e) => setFormFields({ ...formFields, name: e.target.value })}
                            className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white rounded-xl px-4 py-3 outline-none transition"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-600 block">Dynamic Slug (auto-populated if empty)</label>
                          <input
                            type="text"
                            value={formFields.slug || ""}
                            placeholder="e.g. robotics-club"
                            onChange={(e) => setFormFields({ ...formFields, slug: e.target.value })}
                            className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white rounded-xl px-4 py-3 outline-none transition"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600 block">Description *</label>
                        <textarea
                          required
                          value={formFields.description || ""}
                          onChange={(e) => setFormFields({ ...formFields, description: e.target.value })}
                          rows={4}
                          className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white rounded-xl p-3 outline-none transition resize-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600 block">Club Cover Image Banner *</label>
                        <input
                          type="file"
                          required={editorMode === "add"}
                          onChange={(e) => { if (e.target.files?.[0]) setImageFile(e.target.files[0]); }}
                          accept="image/*"
                          className="text-xs w-full block mt-2"
                        />
                      </div>
                    </div>
                  )}

                  {/* 9. Academic Blocks Fields */}
                  {activeTab === "academic" && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-600 block">Block Title *</label>
                          <input
                            type="text"
                            required
                            value={formFields.title || ""}
                            onChange={(e) => setFormFields({ ...formFields, title: e.target.value })}
                            className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white rounded-xl px-4 py-3 outline-none transition"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-600 block">Content Section Keyword *</label>
                          <select
                            value={formFields.section || "brief_history"}
                            disabled={editorMode === "edit"}
                            onChange={(e) => setFormFields({ ...formFields, section: e.target.value })}
                            className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white rounded-xl px-4 py-3 outline-none transition"
                          >
                            <option value="brief_history">Brief History</option>
                            <option value="school_feature">School Feature</option>
                            <option value="academic_overview">Academic Overview</option>
                            <option value="hostel">Hostel & Boarding</option>
                            <option value="co_curricular">Co-Curricular activities</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600 block">Content *</label>
                        <textarea
                          required
                          value={formFields.content || ""}
                          onChange={(e) => setFormFields({ ...formFields, content: e.target.value })}
                          rows={8}
                          className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white rounded-xl p-3 outline-none transition resize-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600 block">Illustrative Block Image</label>
                        <input
                          type="file"
                          onChange={(e) => { if (e.target.files?.[0]) setImageFile(e.target.files[0]); }}
                          accept="image/*"
                          className="text-xs w-full block mt-2"
                        />
                      </div>
                    </div>
                  )}

                  {/* 10. Routines & Exams PDF Fields */}
                  {(activeTab === "routines" || activeTab === "exams") && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-600 block">Document Title *</label>
                          <input
                            type="text"
                            required
                            value={formFields.title || ""}
                            onChange={(e) => setFormFields({ ...formFields, title: e.target.value })}
                            className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white rounded-xl px-4 py-3 outline-none transition"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-600 block">Class Level *</label>
                          <select
                            value={formFields.classLevel || "All"}
                            onChange={(e) => setFormFields({ ...formFields, classLevel: e.target.value })}
                            className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white rounded-xl px-4 py-3 outline-none transition"
                          >
                            <option value="All">All Classes / General</option>
                            <option value="Play">Play</option>
                            <option value="Nursery">Nursery</option>
                            <option value="KG">KG</option>
                            <option value="Class 1">Class 1</option>
                            <option value="Class 2">Class 2</option>
                            <option value="Class 3">Class 3</option>
                            <option value="Class 4">Class 4</option>
                            <option value="Class 5">Class 5</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600 block">Brief Description</label>
                        <input
                          type="text"
                          value={formFields.description || ""}
                          onChange={(e) => setFormFields({ ...formFields, description: e.target.value })}
                          placeholder="e.g. Annual Syllabus 2026 v2"
                          className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white rounded-xl px-4 py-3 outline-none transition"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600 block">Select PDF Document File *</label>
                        <input
                          type="file"
                          required={editorMode === "add"}
                          onChange={(e) => { if (e.target.files?.[0]) setPdfFile(e.target.files[0]); }}
                          accept=".pdf"
                          className="text-xs w-full block mt-2"
                        />
                      </div>
                    </div>
                  )}

                  {/* 11. Testimonials Fields */}
                  {activeTab === "testimonials" && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="space-y-2 sm:col-span-2">
                          <label className="text-xs font-bold text-slate-600 block">Parent Name & Child details *</label>
                          <input
                            type="text"
                            required
                            value={formFields.name || ""}
                            placeholder="e.g. Mahmudul Hasan (Parent of Safwan, Class 2)"
                            onChange={(e) => setFormFields({ ...formFields, name: e.target.value })}
                            className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white rounded-xl px-4 py-3 outline-none transition"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-600 block">Parent Profession *</label>
                          <input
                            type="text"
                            required
                            value={formFields.role || ""}
                            placeholder="e.g. Software Architect"
                            onChange={(e) => setFormFields({ ...formFields, role: e.target.value })}
                            className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white rounded-xl px-4 py-3 outline-none transition"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-600 block">Rating (1 to 5 Stars) *</label>
                          <input
                            type="number"
                            required
                            min={1}
                            max={5}
                            value={formFields.rating || 5}
                            onChange={(e) => setFormFields({ ...formFields, rating: parseInt(e.target.value, 10) })}
                            className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white rounded-xl px-4 py-3 outline-none transition"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600 block">Detailed Testimonial Content *</label>
                        <textarea
                          required
                          value={formFields.content || ""}
                          onChange={(e) => setFormFields({ ...formFields, content: e.target.value })}
                          rows={3}
                          className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white rounded-xl p-3 outline-none transition resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* 12. Gallery Fields */}
                  {activeTab === "gallery" && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-600 block">Caption / Title *</label>
                          <input
                            type="text"
                            required
                            value={formFields.title || ""}
                            onChange={(e) => setFormFields({ ...formFields, title: e.target.value })}
                            className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white rounded-xl px-4 py-3 outline-none transition"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-600 block">Album Category *</label>
                          <select
                            value={formFields.album || "General"}
                            onChange={(e) => setFormFields({ ...formFields, album: e.target.value })}
                            className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white rounded-xl px-4 py-3 outline-none transition"
                          >
                            <option value="General">General</option>
                            <option value="Campus">Campus</option>
                            <option value="Sports">Sports</option>
                            <option value="Events">Events</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600 block">Photograph Upload *</label>
                        <input
                          type="file"
                          required={editorMode === "add"}
                          onChange={(e) => { if (e.target.files?.[0]) setImageFile(e.target.files[0]); }}
                          accept="image/*"
                          className="text-xs w-full block mt-2"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
                    <button
                      type="button"
                      onClick={() => setEditorMode(null)}
                      className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="bg-slate-900 text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-yellow-500 hover:text-slate-950 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      {submitting && <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />}
                      <span>{editorMode === "add" ? "Create Record" : "Apply Changes"}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Data Lists Table depending on tab */}
              {!editorMode && !selectedClub && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-6 space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                    <h3 className="font-display font-semibold text-slate-800 text-xs uppercase tracking-wider">
                      Currently registered items ({
                        activeTab === "sliders" ? sliders.length :
                        activeTab === "facilities" ? facilities.length :
                        activeTab === "stats" ? stats.length :
                        activeTab === "news" ? news.length :
                        activeTab === "teachers" ? teachers.length :
                        activeTab === "authorities" ? authorities.length :
                        activeTab === "achievements" ? achievements.length :
                        activeTab === "clubs" ? clubs.length :
                        activeTab === "gallery" ? gallery.length :
                        activeTab === "testimonials" ? testimonials.length :
                        activeTab === "routines" ? routines.length :
                        activeTab === "exams" ? exams.length :
                        activeTab === "academic" ? academicBlocks.length : 0
                      })
                    </h3>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left divide-y divide-slate-100">
                      <thead>
                        <tr className="text-slate-400 font-bold">
                          <th className="py-3 px-4">Identification Details</th>
                          <th className="py-3 px-4">Properties</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 font-medium">
                        {/* Render Sliders */}
                        {activeTab === "sliders" && sliders.map((slide) => (
                          <tr key={slide.id}>
                            <td className="py-3 px-4 text-slate-900 font-semibold flex items-center gap-3">
                              {slide.imageUrl && <img src={slide.imageUrl} alt="slide" referrerPolicy="no-referrer" className="h-10 w-16 object-cover rounded" />}
                              <span>{slide.title || "No Title"}</span>
                            </td>
                            <td className="py-3 px-4 text-slate-500">Order: {slide.order} | {slide.caption}</td>
                            <td className="py-3 px-4 text-right space-x-2">
                              <button onClick={() => handleInitiateEdit(slide)} className="p-1.5 text-slate-500 hover:text-slate-950 hover:bg-slate-50 rounded"><Edit2 size={13} /></button>
                              <button onClick={() => handleItemDelete(slide.id)} className="p-1.5 text-red-500 hover:text-red-700 hover:bg-slate-50 rounded"><Trash2 size={13} /></button>
                            </td>
                          </tr>
                        ))}

                        {/* Render Facilities */}
                        {activeTab === "facilities" && facilities.map((fac) => (
                          <tr key={fac.id}>
                            <td className="py-3 px-4 text-slate-900 font-semibold">{fac.title}</td>
                            <td className="py-3 px-4 text-slate-500">Icon: {fac.icon} | Order: {fac.order}</td>
                            <td className="py-3 px-4 text-right space-x-2">
                              <button onClick={() => handleInitiateEdit(fac)} className="p-1.5 text-slate-500 hover:text-slate-950 hover:bg-slate-50 rounded"><Edit2 size={13} /></button>
                              <button onClick={() => handleItemDelete(fac.id)} className="p-1.5 text-red-500 hover:text-red-700 hover:bg-slate-50 rounded"><Trash2 size={13} /></button>
                            </td>
                          </tr>
                        ))}

                        {/* Render Stats */}
                        {activeTab === "stats" && stats.map((st) => (
                          <tr key={st.id}>
                            <td className="py-3 px-4 text-slate-900 font-semibold flex items-center gap-3">
                              <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200">
                                {st.imageUrl ? (
                                  <img src={st.imageUrl} alt={st.label} referrerPolicy="no-referrer" className="h-8 w-8 object-contain" />
                                ) : (
                                  <DynamicIcon name={st.icon || "Award"} className="text-amber-500" size={20} />
                                )}
                              </div>
                              <span>{st.label}</span>
                            </td>
                            <td className="py-3 px-4 text-slate-500">
                              <span className="font-mono text-sm bg-slate-100 px-2.5 py-1 rounded-md text-amber-600 font-bold">
                                {st.value}{st.suffix || ""}
                              </span>
                              <span className="text-xs ml-3 text-slate-400">Order: {st.order || 0}</span>
                            </td>
                            <td className="py-3 px-4 text-right space-x-2">
                              <button onClick={() => handleInitiateEdit(st)} className="p-1.5 text-slate-500 hover:text-slate-950 hover:bg-slate-50 rounded cursor-pointer" title="Edit"><Edit2 size={13} /></button>
                              <button onClick={() => handleItemDelete(st.id)} className="p-1.5 text-red-500 hover:text-red-700 hover:bg-slate-50 rounded cursor-pointer" title="Delete"><Trash2 size={13} /></button>
                            </td>
                          </tr>
                        ))}

                        {/* Render News */}
                        {activeTab === "news" && news.map((post) => (
                          <tr key={post.id}>
                            <td className="py-3 px-4 text-slate-900 font-semibold truncate max-w-xs">{post.title}</td>
                            <td className="py-3 px-4 text-slate-500 font-mono text-[10px]">Slug: {post.slug}</td>
                            <td className="py-3 px-4 text-right space-x-2">
                              <button onClick={() => handleInitiateEdit(post)} className="p-1.5 text-slate-500 hover:text-slate-950 hover:bg-slate-50 rounded"><Edit2 size={13} /></button>
                              <button onClick={() => handleItemDelete(post.id)} className="p-1.5 text-red-500 hover:text-red-700 hover:bg-slate-50 rounded"><Trash2 size={13} /></button>
                            </td>
                          </tr>
                        ))}

                        {/* Render Teachers */}
                        {activeTab === "teachers" && teachers.map((t) => (
                          <tr key={t.id}>
                            <td className="py-3 px-4 text-slate-900 font-semibold flex items-center gap-3">
                              {t.photoUrl && <img src={t.photoUrl} alt="teacher" referrerPolicy="no-referrer" className="h-10 w-10 object-cover rounded-full" />}
                              <span>{t.name}</span>
                            </td>
                            <td className="py-3 px-4 text-slate-500">{t.designation} | Order: {t.order}</td>
                            <td className="py-3 px-4 text-right space-x-2">
                              <button onClick={() => handleInitiateEdit(t)} className="p-1.5 text-slate-500 hover:text-slate-950 hover:bg-slate-50 rounded"><Edit2 size={13} /></button>
                              <button onClick={() => handleItemDelete(t.id)} className="p-1.5 text-red-500 hover:text-red-700 hover:bg-slate-50 rounded"><Trash2 size={13} /></button>
                            </td>
                          </tr>
                        ))}

                        {/* Render Authorities */}
                        {activeTab === "authorities" && authorities.map((auth) => (
                          <tr key={auth.id}>
                            <td className="py-3 px-4 text-slate-900 font-semibold flex items-center gap-3">
                              {auth.photoUrl && <img src={auth.photoUrl} alt="leader" referrerPolicy="no-referrer" className="h-10 w-10 object-cover rounded-full" />}
                              <span>{auth.name}</span>
                            </td>
                            <td className="py-3 px-4 text-slate-500">{auth.designation} | Type: {auth.type}</td>
                            <td className="py-3 px-4 text-right space-x-2">
                              <button onClick={() => handleInitiateEdit(auth)} className="p-1.5 text-slate-500 hover:text-slate-950 hover:bg-slate-50 rounded"><Edit2 size={13} /></button>
                              <button onClick={() => handleItemDelete(auth.id)} className="p-1.5 text-red-500 hover:text-red-700 hover:bg-slate-50 rounded"><Trash2 size={13} /></button>
                            </td>
                          </tr>
                        ))}

                        {/* Render Achievements */}
                        {activeTab === "achievements" && achievements.map((ach) => (
                          <tr key={ach.id}>
                            <td className="py-3 px-4 text-slate-900 font-semibold">{ach.title}</td>
                            <td className="py-3 px-4 text-slate-500">Date: {ach.date}</td>
                            <td className="py-3 px-4 text-right space-x-2">
                              <button onClick={() => handleInitiateEdit(ach)} className="p-1.5 text-slate-500 hover:text-slate-950 hover:bg-slate-50 rounded"><Edit2 size={13} /></button>
                              <button onClick={() => handleItemDelete(ach.id)} className="p-1.5 text-red-500 hover:text-red-700 hover:bg-slate-50 rounded"><Trash2 size={13} /></button>
                            </td>
                          </tr>
                        ))}

                        {/* Render Clubs */}
                        {activeTab === "clubs" && clubs.map((club) => (
                          <tr key={club.id}>
                            <td className="py-3 px-4 text-slate-900 font-semibold">{club.name}</td>
                            <td className="py-3 px-4 text-slate-500">
                              <button
                                onClick={() => handleClubWorkSelect(club)}
                                className="text-yellow-600 hover:underline font-bold text-[11px]"
                              >
                                Manage Members & Gallery
                              </button>
                            </td>
                            <td className="py-3 px-4 text-right space-x-2">
                              <button onClick={() => handleInitiateEdit(club)} className="p-1.5 text-slate-500 hover:text-slate-950 hover:bg-slate-50 rounded"><Edit2 size={13} /></button>
                              <button onClick={() => handleItemDelete(club.id)} className="p-1.5 text-red-500 hover:text-red-700 hover:bg-slate-50 rounded"><Trash2 size={13} /></button>
                            </td>
                          </tr>
                        ))}

                        {/* Render Academic Blocks */}
                        {activeTab === "academic" && academicBlocks.map((blk) => (
                          <tr key={blk.id}>
                            <td className="py-3 px-4 text-slate-900 font-semibold capitalize">{blk.section.replace("_", " ")} Block</td>
                            <td className="py-3 px-4 text-slate-500 truncate max-w-xs">{blk.title}</td>
                            <td className="py-3 px-4 text-right space-x-2">
                              <button onClick={() => handleInitiateEdit(blk)} className="p-1.5 text-slate-500 hover:text-slate-950 hover:bg-slate-50 rounded"><Edit2 size={13} /></button>
                            </td>
                          </tr>
                        ))}

                        {/* Render Routines */}
                        {activeTab === "routines" && routines.map((r) => (
                          <tr key={r.id}>
                            <td className="py-3 px-4 text-slate-900 font-semibold">{r.title}</td>
                            <td className="py-3 px-4 text-slate-500">Grade: {r.classLevel} | PDF Url: {r.pdfUrl ? "Uploaded" : "None"}</td>
                            <td className="py-3 px-4 text-right space-x-2">
                              <button onClick={() => handleItemDelete(r.id)} className="p-1.5 text-red-500 hover:text-red-700 hover:bg-slate-50 rounded"><Trash2 size={13} /></button>
                            </td>
                          </tr>
                        ))}

                        {/* Render Exam PDFs */}
                        {activeTab === "exams" && exams.map((ex) => (
                          <tr key={ex.id}>
                            <td className="py-3 px-4 text-slate-900 font-semibold">{ex.title}</td>
                            <td className="py-3 px-4 text-slate-500">Grade: {ex.classLevel} | PDF Url: {ex.pdfUrl ? "Uploaded" : "None"}</td>
                            <td className="py-3 px-4 text-right space-x-2">
                              <button onClick={() => handleItemDelete(ex.id)} className="p-1.5 text-red-500 hover:text-red-700 hover:bg-slate-50 rounded"><Trash2 size={13} /></button>
                            </td>
                          </tr>
                        ))}

                        {/* Render Testimonials */}
                        {activeTab === "testimonials" && testimonials.map((t) => (
                          <tr key={t.id}>
                            <td className="py-3 px-4 text-slate-900 font-semibold">{t.name}</td>
                            <td className="py-3 px-4 text-slate-500">Rating: {t.rating} Stars | {t.role}</td>
                            <td className="py-3 px-4 text-right space-x-2">
                              <button onClick={() => handleInitiateEdit(t)} className="p-1.5 text-slate-500 hover:text-slate-950 hover:bg-slate-50 rounded"><Edit2 size={13} /></button>
                              <button onClick={() => handleItemDelete(t.id)} className="p-1.5 text-red-500 hover:text-red-700 hover:bg-slate-50 rounded"><Trash2 size={13} /></button>
                            </td>
                          </tr>
                        ))}

                        {/* Render Gallery */}
                        {activeTab === "gallery" && gallery.map((item) => (
                          <tr key={item.id}>
                            <td className="py-3 px-4 text-slate-900 font-semibold flex items-center gap-3">
                              {item.imageUrl && <img src={item.imageUrl} alt="gallery" referrerPolicy="no-referrer" className="h-10 w-16 object-cover rounded" />}
                              <span>{item.title || "No Title"}</span>
                            </td>
                            <td className="py-3 px-4 text-slate-500">Album: {item.album}</td>
                            <td className="py-3 px-4 text-right space-x-2">
                              <button onClick={() => handleItemDelete(item.id)} className="p-1.5 text-red-500 hover:text-red-700 hover:bg-slate-50 rounded"><Trash2 size={13} /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Club Sub-workspace Workspace */}
              {selectedClub && (
                <div className="space-y-8">
                  {/* Close button */}
                  <div className="flex justify-between items-center bg-slate-900 text-white p-4 rounded-2xl shadow-sm">
                    <div>
                      <h3 className="text-sm font-bold">{selectedClub.name} Sub-Workspace</h3>
                      <p className="text-[10px] text-slate-400">Add Club Members and Activity Gallery Photographs</p>
                    </div>
                    <button
                      onClick={() => setSelectedClub(null)}
                      className="bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl hover:bg-yellow-500 hover:text-slate-950 transition cursor-pointer"
                    >
                      Close Workspace
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Club Members Column */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                      <h4 className="font-display font-bold text-sm">Add Club Moderator / Member</h4>

                      <form onSubmit={handleAddClubMember} className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500">Member Full Name *</label>
                          <input
                            type="text"
                            required
                            value={newMemberName}
                            onChange={(e) => setNewMemberName(e.target.value)}
                            placeholder="e.g. Dr. Rakibul Hasan"
                            className="w-full text-xs border border-slate-200 bg-slate-50 focus:bg-white rounded-lg px-3 py-2 outline-none transition"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500">Role Assign (e.g. Moderator) *</label>
                          <input
                            type="text"
                            required
                            value={newMemberRole}
                            onChange={(e) => setNewMemberRole(e.target.value)}
                            placeholder="e.g. Club Moderator"
                            className="w-full text-xs border border-slate-200 bg-slate-50 focus:bg-white rounded-lg px-3 py-2 outline-none transition"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500">Portrait Image</label>
                          <input
                            type="file"
                            onChange={(e) => { if (e.target.files?.[0]) setMemberPhoto(e.target.files[0]); }}
                            accept="image/*"
                            className="text-[10px] block"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={submitting}
                          className="bg-slate-950 text-white text-xs font-bold py-2 px-4 rounded-xl hover:bg-yellow-500 hover:text-slate-950 transition cursor-pointer"
                        >
                          Add Member Profile
                        </button>
                      </form>

                      {/* Members List */}
                      <div className="border-t border-slate-50 pt-4 space-y-3">
                        <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Current Members List</h5>
                        {(!selectedClub.members || selectedClub.members.length === 0) ? (
                          <p className="text-[10px] text-slate-400">No members listed yet.</p>
                        ) : (
                          <div className="space-y-2">
                            {selectedClub.members.map((m) => (
                              <div key={m.id} className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border">
                                <div className="flex items-center gap-3">
                                  {m.photoUrl && <img src={m.photoUrl} alt="member" referrerPolicy="no-referrer" className="h-8 w-8 rounded-full object-cover" />}
                                  <div>
                                    <span className="text-xs font-bold text-slate-800 block">{m.name}</span>
                                    <span className="text-[10px] text-yellow-600 font-medium block">{m.role}</span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleDeleteClubMember(m.id)}
                                  className="text-red-500 hover:text-red-700 p-1 hover:bg-slate-100 rounded"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Club Gallery Column */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                      <h4 className="font-display font-bold text-sm">Upload Club Project Photo</h4>

                      <form onSubmit={handleAddClubImage} className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500">Activity Image *</label>
                          <input
                            type="file"
                            required
                            onChange={(e) => { if (e.target.files?.[0]) setClubGalleryFile(e.target.files[0]); }}
                            accept="image/*"
                            className="text-[10px] block"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={submitting}
                          className="bg-slate-950 text-white text-xs font-bold py-2 px-4 rounded-xl hover:bg-yellow-500 hover:text-slate-950 transition cursor-pointer"
                        >
                          Upload Photograph
                        </button>
                      </form>

                      {/* Images Grid */}
                      <div className="border-t border-slate-50 pt-4 space-y-3">
                        <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Current Photo Album</h5>
                        {(!selectedClub.gallery || selectedClub.gallery.length === 0) ? (
                          <p className="text-[10px] text-slate-400">No images uploaded.</p>
                        ) : (
                          <div className="grid grid-cols-3 gap-2">
                            {selectedClub.gallery.map((img) => (
                              <div key={img.id} className="relative rounded-lg overflow-hidden h-16 border bg-slate-50 group">
                                <img src={img.imageUrl} alt="club item" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                                <button
                                  onClick={() => handleDeleteClubImage(img.id)}
                                  className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 opacity-0 group-hover:opacity-100 transition shadow-sm"
                                >
                                  <X size={10} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

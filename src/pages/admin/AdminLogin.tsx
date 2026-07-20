import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Lock, Mail, ArrowLeft, Key, CheckCircle, ShieldAlert } from "lucide-react";

interface AdminLoginProps {
  onLoginSuccess: (token: string, adminInfo: any) => void;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Mode: 'login' | 'forgot' | 'reset'
  const [mode, setMode] = useState<"login" | "forgot" | "reset">("login");
  const token = searchParams.get("token");

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      setMode("reset");
    } else {
      setMode("login");
    }
  }, [token]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill out both email and password.");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        onLoginSuccess(data.token, data.admin);
        navigate("/admin");
      } else {
        setError(data.error || "Invalid login credentials.");
      }
    } catch (err) {
      setError("Failed to connect to the authentication server.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please provide your registered admin email.");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(data.message || "Reset link dispatched.");
      } else {
        setError(data.error || "Failed to submit request.");
      }
    } catch (err) {
      setError("A server connection issue occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setError("Please enter and confirm your new password.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(data.message || "Password updated. You can now login.");
        setTimeout(() => {
          setMode("login");
          setSuccess(null);
          navigate("/admin");
        }, 3000);
      } else {
        setError(data.error || "Invalid or expired token.");
      }
    } catch (err) {
      setError("Server connection failure.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white border border-slate-100 rounded-3xl p-8 sm:p-10 shadow-sm space-y-8">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="h-12 w-12 bg-slate-900 text-yellow-400 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <Lock size={20} />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
            {mode === "login" && "Admin Portal Login"}
            {mode === "forgot" && "Reset Admin Password"}
            {mode === "reset" && "Create New Password"}
          </h2>
          <p className="text-slate-400 text-xs">
            {mode === "login" && "Secure gateway for administration controls"}
            {mode === "forgot" && "Enter your email to receive a recovery token"}
            {mode === "reset" && "Set a permanent secure password for your account"}
          </p>
        </div>

        {/* Messaging Feedback */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
            <ShieldAlert size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle size={16} className="shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* View A: LOGIN */}
        {mode === "login" && (
          <form onSubmit={handleLoginSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 block">Admin Email *</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@sunrise.edu"
                  className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-yellow-500 rounded-xl pl-11 pr-4 py-3 outline-none transition"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-600">Password *</label>
                <button
                  type="button"
                  onClick={() => setMode("forgot")}
                  className="text-xs text-yellow-600 hover:underline font-bold"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-yellow-500 rounded-xl pl-11 pr-4 py-3 outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-yellow-500 hover:text-slate-950 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>Login Securely</span>
              )}
            </button>
          </form>
        )}

        {/* View B: FORGOT PASSWORD */}
        {mode === "forgot" && (
          <form onSubmit={handleForgotSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 block">Registered Email *</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@sunrise.edu"
                  className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-yellow-500 rounded-xl pl-11 pr-4 py-3 outline-none transition"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-yellow-500 hover:text-slate-950 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Key size={16} />
                    <span>Send Reset Instructions</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setMode("login")}
                className="w-full bg-slate-50 text-slate-700 hover:bg-slate-100 font-bold py-3 rounded-xl transition flex items-center justify-center gap-1.5 text-xs cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>Return to Login</span>
              </button>
            </div>
          </form>
        )}

        {/* View C: RESET PASSWORD */}
        {mode === "reset" && (
          <form onSubmit={handleResetSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 block">New Secure Password *</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-yellow-500 rounded-xl pl-11 pr-4 py-3 outline-none transition"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 block">Confirm Password *</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-yellow-500 rounded-xl pl-11 pr-4 py-3 outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-yellow-500 hover:text-slate-950 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>Update Secure Password</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

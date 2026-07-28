"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      setSuccessMsg("Konto erfolgreich erstellt! Sie können sich jetzt anmelden.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Anmeldung fehlgeschlagen.");
      }

      const data = await response.json();
      
      // Store token (in a real app, use HttpOnly cookies or secure local storage)
      localStorage.setItem("token", data.access_token);
      
      // Route based on role
      if (data.role === "project_manager") {
        router.push("/dashboard/manager");
      } else if (data.role === "team_member") {
        router.push("/dashboard/team");
      } else {
        router.push("/dashboard/client");
      }

    } catch (err: any) {
      setError(err.message || "Ein unerwarteter Fehler ist aufgetreten.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface-bright text-text-primary h-screen w-full font-body-sm overflow-hidden flex">
      {/* Left Column: Form */}
      <div className="w-full lg:w-1/2 h-full bg-surface flex flex-col justify-center px-6 sm:px-12 lg:px-24 overflow-y-auto">
        <div className="max-w-[440px] w-full mx-auto py-12">
          {/* Branding */}
          <div className="mb-10 text-center lg:text-left">
            <div className="inline-flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-primary text-white flex items-center justify-center rounded-lg font-bold text-xl leading-none">
                F
              </div>
              <h1 className="text-hero-heading text-text-primary tracking-tight">
                Fusion-Baukasten
              </h1>
            </div>
            <p className="text-subheading text-on-surface-variant">
              KI-gestützte Partizipationsplanung
            </p>
          </div>

          {/* Success Message from Registration */}
          {successMsg && (
            <div className="mb-6 p-4 bg-green/10 text-green rounded-lg text-sm border border-green/20">
              {successMsg}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-lg text-sm border border-red/20">
              {error}
            </div>
          )}

          {/* SSO Buttons */}
          <div className="flex flex-col gap-3 mb-8">
            <button className="w-full flex items-center justify-center gap-3 px-4 py-[10px] bg-surface border border-line rounded-lg text-text-primary text-label-caps hover:bg-surface-container-low transition-colors shadow-sm">
              <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z" fill="#00a4ef" />
              </svg>
              Mit Microsoft anmelden
            </button>
            <button className="w-full flex items-center justify-center gap-3 px-4 py-[10px] bg-surface border border-line rounded-lg text-text-primary text-label-caps hover:bg-surface-container-low transition-colors shadow-sm">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                <path d="M1 1h22v22H1z" fill="none" />
              </svg>
              Mit Google anmelden
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-line"></div>
            <span className="text-body-sm text-on-surface-variant">
              oder mit E-Mail anmelden
            </span>
            <div className="flex-1 h-px bg-line"></div>
          </div>

          {/* Email Form */}
          <form className="flex flex-col gap-4 mb-8" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1.5">
              <label className="text-label-caps text-text-primary" htmlFor="email">
                E-Mail-Adresse
              </label>
              <input
                className="input-field"
                id="email"
                placeholder="max@kommune-musterstadt.de"
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  border: "1px solid var(--color-outline-variant)",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  background: "var(--color-surface)",
                  color: "var(--color-text-primary)",
                  width: "100%",
                }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-label-caps text-text-primary" htmlFor="password">
                  Passwort
                </label>
                <Link
                  className="text-body-sm text-primary hover:text-primary-container transition-colors"
                  href="/forgot-password"
                >
                  Passwort vergessen?
                </Link>
              </div>
              <input
                className="input-field"
                id="password"
                placeholder="••••••••"
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  border: "1px solid var(--color-outline-variant)",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  background: "var(--color-surface)",
                  color: "var(--color-text-primary)",
                  width: "100%",
                }}
              />
            </div>
            <button
              className="w-full py-3 bg-primary text-white rounded-lg text-label-caps hover:bg-primary-container transition-colors shadow-sm mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
              type="submit"
              disabled={loading}
            >
              {loading ? "Wird angemeldet..." : "Anmelden"}
            </button>
          </form>

          {/* Guest & Privacy */}
          <div className="flex flex-col gap-3 pt-4 border-t border-line">
            <button
              className="w-full py-3 bg-transparent border border-outline text-on-surface-variant rounded-lg text-label-caps hover:bg-surface-container-low transition-colors"
              type="button"
            >
              Als Gast fortfahren
            </button>
            <p className="text-body-sm text-on-surface-variant text-center max-w-[90%] mx-auto leading-relaxed">
              Start ohne Registrierung möglich. Ihr Projekt kann später gespeichert
              werden. <span className="font-bold">DSGVO-konform.</span>
            </p>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-body-sm text-on-surface-variant">
              Noch kein Konto?{" "}
              <Link href="/register" className="text-primary font-bold hover:underline">
                Jetzt registrieren
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Column: Visual/Marketing Preview */}
      <div className="hidden lg:flex w-1/2 h-full bg-surface-container-low relative overflow-hidden items-center justify-center p-12">
        {/* Abstract background pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle at 2px 2px, #000 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        ></div>
        {/* Large Gradient Blob */}
        <div
          className="absolute top-1/4 -right-1/4 w-[800px] h-[800px] rounded-full blur-[120px] opacity-20 mix-blend-multiply"
          style={{ background: "linear-gradient(135deg, #5c3be0, #4478e8)" }}
        ></div>
        <div className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-tertiary-fixed rounded-full blur-[100px] opacity-40 mix-blend-multiply"></div>

        {/* Glassmorphism Preview Card */}
        <div className="relative z-10 w-full max-w-[600px] aspect-[4/3] rounded-xl bg-surface/60 backdrop-blur-xl border border-surface-bright shadow-[0_14px_36px_rgba(45,55,95,0.08)] overflow-hidden flex flex-col">
          {/* Mock Header */}
          <div className="h-12 border-b border-line/50 flex items-center px-6 gap-3 bg-surface/40">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-line"></div>
              <div className="w-3 h-3 rounded-full bg-line"></div>
              <div className="w-3 h-3 rounded-full bg-line"></div>
            </div>
            <div className="flex-1"></div>
            <div className="h-6 w-32 bg-surface-container rounded-full"></div>
          </div>
          {/* Mock Content Area */}
          <div className="flex-1 p-6 flex flex-col gap-4">
            <div className="flex justify-between items-end mb-3">
              <div>
                <div className="h-4 w-24 bg-primary/20 rounded mb-2"></div>
                <div className="h-8 w-48 bg-text-primary/10 rounded"></div>
              </div>
              <div className="h-10 w-10 bg-surface-container-highest rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">
                  smart_toy
                </span>
              </div>
            </div>
            <div className="flex gap-4 h-[140px]">
              <div className="flex-1 bg-surface-bright border border-line/50 rounded-xl p-4 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-primary-container blur-2xl opacity-50"></div>
                <div className="h-3 w-1/2 bg-on-surface-variant/20 rounded mb-4"></div>
                <div className="flex gap-2 mb-2">
                  <div className="h-2 w-full bg-on-surface-variant/10 rounded"></div>
                  <div className="h-2 w-2/3 bg-on-surface-variant/10 rounded"></div>
                </div>
                <div className="h-2 w-4/5 bg-on-surface-variant/10 rounded mb-4"></div>
                <div className="mt-auto h-8 w-full bg-primary/5 rounded border border-primary/10 mt-6"></div>
              </div>
              <div className="flex-1 bg-surface-bright border border-line/50 rounded-xl p-4 shadow-sm">
                <div className="h-3 w-1/3 bg-on-surface-variant/20 rounded mb-4"></div>
                <div className="flex items-center justify-center h-20">
                  <div className="w-16 h-16 rounded-full border-4 border-surface-container-highest border-t-primary animate-[spin_3s_linear_infinite]"></div>
                </div>
              </div>
            </div>
            {/* Mock Map/Chart Area */}
            <div className="flex-1 bg-surface-container border border-line/50 rounded-xl relative overflow-hidden group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="A highly detailed, modern interface mock-up"
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAc5lmPfrRS8iRB_B0sZZnZ_Ww_k8Bu5-ExnDXNH9n09jt8AdW7dWk6725ZmTTtyBZDMHEoCIQhEWXNRQdt31b88f40By8bnq186a18O2OAf0xKTkHrEzZayko6m6GMfhA9K9zfKIZR9-w6tB60ne9tqSaYnooqLE_w5LmGVJiPy06Og4uE-44SDKhn9po2zFdSUsz9nUmevjEULhzs32aUT0Z8huPpH7Wz2giSwOjdb53LaeF_9ZVxBHWFdQ9bmQVCBiEY4B8oyMQ7"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center bg-surface/80 backdrop-blur-sm p-3 rounded-lg border border-surface-bright">
                <div className="h-3 w-32 bg-text-primary/40 rounded"></div>
                <div className="h-6 w-20 bg-primary text-white rounded text-[10px] font-bold flex items-center justify-center">
                  Generieren
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Marketing Text */}
        <div className="absolute bottom-12 left-12 right-12 text-center z-20 pointer-events-none">
          <h2 className="text-page-title text-text-primary mb-2 drop-shadow-sm">
            Planung neu gedacht.
          </h2>
          <p className="text-body-lg text-on-surface-variant max-w-md mx-auto drop-shadow-sm">
            Nutzen Sie die Kraft unserer KI-Agenten, um komplexe
            Partizipationsprozesse effizienter und inklusiver zu gestalten.
          </p>
        </div>
      </div>
    </div>
  );
}

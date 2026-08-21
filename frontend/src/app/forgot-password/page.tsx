"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = import("next/navigation").then(mod => mod.useRouter);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:8000/api/v1/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Anfrage fehlgeschlagen.");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Ein unerwarteter Fehler ist aufgetreten.");
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="bg-surface-bright min-h-screen flex items-center justify-center p-6 selection:bg-primary-fixed selection:text-on-primary-fixed relative overflow-hidden">
      {/* Atmospheric blobs */}
      <div className="absolute top-[-200px] right-[-200px] w-[600px] h-[600px] rounded-full blur-[120px] opacity-20 pointer-events-none" style={{ background: "linear-gradient(135deg, #5c3be0, #4478e8)" }} />
      <div className="absolute bottom-[-200px] left-[-200px] w-[500px] h-[500px] bg-tertiary-fixed rounded-full blur-[100px] opacity-30 pointer-events-none" />

      <div className="w-full max-w-[448px] relative z-10">
        {/* Main Card Canvas */}
        <div className="bg-surface/90 backdrop-blur-md rounded-2xl shadow-[0_14px_36px_rgba(45,55,95,0.12)] border border-white p-10 overflow-hidden relative">
          
          {/* Branding Area */}
          <div className="flex items-center gap-3 mb-12 relative z-10">
            <div
              className="w-8 h-8 flex items-center justify-center rounded-lg text-white font-[850] text-body-lg"
              style={{ background: "linear-gradient(135deg, #5c3be0 0%, #3f2bc4 100%)" }}
            >
              F
            </div>
            <span className="text-brand-section tracking-tight text-on-surface">
              Fusion-Baukasten
            </span>
          </div>

          {/* Content Area */}
          <div className="space-y-8 relative z-10">
            <div className="space-y-3">
              <h1 className="text-page-title text-on-background">Passwort vergessen</h1>
              <p className="text-body-lg text-on-surface-variant leading-relaxed">
                Geben Sie Ihre E-Mail-Adresse ein, um einen Link zum Zurücksetzen Ihres Passworts zu erhalten.
              </p>
            </div>

            {error && (
              <div className="p-4 bg-error-container text-on-error-container rounded-lg text-sm border border-red/20">
                {error}
              </div>
            )}

            {success ? (
              <div className="p-4 bg-green/10 text-green rounded-lg text-sm border border-green/20 flex flex-col items-center text-center gap-3">
                <span className="material-symbols-outlined text-[32px]">check_circle</span>
                <p>Link gesendet! Bitte prüfen Sie Ihr E-Mail-Postfach.</p>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label
                    className="block text-label-caps text-label-text tracking-wider uppercase"
                    htmlFor="email"
                  >
                    Dienstliche E-Mail-Adresse
                  </label>
                  <input
                    className="w-full px-[12px] py-3 rounded-lg border border-line bg-surface text-on-surface placeholder:text-outline font-body-lg transition-all"
                    id="email"
                    placeholder="z. B. name@organisation.de"
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ outline: "none" }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#4414c9";
                      e.target.style.boxShadow = "0 0 0 1px #4414c9";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "var(--color-line)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>
                <button
                  className="w-full h-12 rounded-lg flex items-center justify-center gap-2 text-on-primary text-subheading disabled:opacity-70 disabled:cursor-not-allowed"
                  type="submit"
                  disabled={loading}
                  style={{
                    background: "linear-gradient(90deg, #4414c9 0%, #5243d7 100%)",
                    transition: "transform 0.2s ease, opacity 0.2s ease",
                  }}
                  onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
                  onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                  {loading ? (
                    <>
                      <span className="animate-spin material-symbols-outlined text-[18px]">
                        progress_activity
                      </span>
                      SENDEN...
                    </>
                  ) : (
                    <>
                      LINK SENDEN
                      <span className="material-symbols-outlined text-[18px]">
                        arrow_forward
                      </span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Navigation Back */}
            <div className="pt-4 border-t border-line text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-primary text-body-lg hover:underline transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">
                  arrow_back
                </span>
                Zurück zur Anmeldung
              </Link>
            </div>
          </div>

          {/* Atmospheric Micro-interaction Layer */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-secondary/5 rounded-full blur-3xl pointer-events-none"></div>
        </div>

        {/* System Footer */}
        <div className="mt-8 text-center">
          <p className="text-caption-tiny text-outline">
            © 2024 Fusion-Baukasten Enterprise. Alle Rechte vorbehalten.
          </p>
        </div>
      </div>
    </div>
  );
}

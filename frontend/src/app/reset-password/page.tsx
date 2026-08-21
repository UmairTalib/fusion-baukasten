"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Die Passwörter stimmen nicht überein.");
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setError("Das Passwort muss mindestens 8 Zeichen lang sein und einen Großbuchstaben, einen Kleinbuchstaben, eine Zahl und ein Sonderzeichen enthalten.");
      return;
    }

    // In a real flow, if token is missing we'd block them. 
    // Here we let it attempt, or block it depending on strictness.
    if (!token) {
      setError("Kein gültiges Token gefunden (wird in der E-Mail übermittelt).");
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/v1/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, new_password: newPassword }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Zurücksetzen fehlgeschlagen.");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login?reset=true");
      }, 3000);

    } catch (err: any) {
      setError(err.message || "Ein unerwarteter Fehler ist aufgetreten.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {error && (
        <div className="p-4 bg-error-container text-on-error-container rounded-lg text-sm border border-red/20 relative z-10">
          {error}
        </div>
      )}

      {success ? (
        <div className="p-4 bg-green/10 text-green rounded-lg text-sm border border-green/20 flex flex-col items-center text-center gap-3 relative z-10">
          <span className="material-symbols-outlined text-[32px]">check_circle</span>
          <p>Passwort erfolgreich aktualisiert! Sie werden zur Anmeldung weitergeleitet...</p>
        </div>
      ) : (
        <form className="flex flex-col gap-6 relative z-10" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4">
            {/* Input 1 */}
            <div className="flex flex-col gap-2">
              <label
                className="text-label-caps text-label-text uppercase tracking-wider block"
                htmlFor="new_password"
              >
                Neues Passwort
              </label>
              <div className="relative">
                <input
                  className="w-full px-[12px] py-3 bg-surface border border-line rounded-lg font-body-lg text-on-surface placeholder:text-outline/50 transition-all"
                  id="new_password"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
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
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant hover:text-primary transition-colors flex items-center justify-center"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
              <p className="text-[11px] text-on-surface-variant leading-tight mt-1">
                Mindestens 8 Zeichen, ein Großbuchstabe, ein Kleinbuchstabe, eine Zahl und ein Sonderzeichen.
              </p>
            </div>

            {/* Input 2 */}
            <div className="flex flex-col gap-2">
              <label
                className="text-label-caps text-label-text uppercase tracking-wider block"
                htmlFor="confirm_password"
              >
                Passwort bestätigen
              </label>
              <div className="relative">
                <input
                  className="w-full px-[12px] py-3 bg-surface border border-line rounded-lg font-body-lg text-on-surface placeholder:text-outline/50 transition-all"
                  id="confirm_password"
                  placeholder="••••••••"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
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
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant hover:text-primary transition-colors flex items-center justify-center"
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showConfirmPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            className="w-full h-[48px] flex items-center justify-center gap-2 text-on-primary font-subheading rounded-lg shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
            type="submit"
            disabled={loading}
            style={{
              background: "linear-gradient(90deg, #4414c9 0%, #5243d7 100%)",
              transition: "all 0.2s ease",
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
            onMouseUp={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0px)")}
          >
            {loading ? (
              <span className="animate-spin material-symbols-outlined text-[20px]">
                progress_activity
              </span>
            ) : (
              <span className="material-symbols-outlined text-[20px]">check</span>
            )}
            <span>{loading ? "WIRD GESPEICHERT..." : "Passwort speichern"}</span>
          </button>
        </form>
      )}
    </>
  );
}

export default function ResetPasswordPage() {



  return (
    <div className="bg-surface-bright min-h-screen flex items-center justify-center p-6 selection:bg-primary-fixed selection:text-on-primary-fixed relative overflow-hidden">
      {/* Atmospheric blobs */}
      <div className="absolute top-[-200px] right-[-200px] w-[600px] h-[600px] rounded-full blur-[120px] opacity-20 pointer-events-none" style={{ background: "linear-gradient(135deg, #5c3be0, #4478e8)" }} />
      <div className="absolute bottom-[-200px] left-[-200px] w-[500px] h-[500px] bg-tertiary-fixed rounded-full blur-[100px] opacity-30 pointer-events-none" />

      <main className="w-full max-w-[448px] relative z-10">
        <div className="bg-surface/90 backdrop-blur-md rounded-2xl shadow-[0_14px_36px_rgba(45,55,95,0.12)] border border-white p-8 md:p-10 flex flex-col gap-8 relative overflow-hidden">
          
          {/* Branding Header */}
          <div className="flex items-center gap-3 relative z-10">
            <div
              className="w-8 h-8 flex items-center justify-center rounded-lg text-white font-[850] text-body-lg"
              style={{ background: "linear-gradient(135deg, #5c3be0 0%, #3f2bc4 100%)" }}
            >
              F
            </div>
            <span className="text-brand-section text-[18px] text-on-surface tracking-tight">
              Fusion-Baukasten
            </span>
          </div>

          {/* Content Section */}
          <div className="flex flex-col gap-2 relative z-10">
            <h1 className="text-subheading text-on-surface text-[24px]">Neues Passwort vergeben</h1>
            <p className="text-body-lg text-on-surface-variant">Bitte geben Sie Ihr neues Passwort ein.</p>
          </div>

          <Suspense fallback={<div className="flex justify-center p-8"><span className="animate-spin material-symbols-outlined text-[32px] text-primary">progress_activity</span></div>}>
            <ResetPasswordForm />
          </Suspense>

          {/* Footer Section */}
          <div className="pt-4 mt-2 border-t border-line flex justify-center relative z-10">
            <Link
              href="/login"
              className="text-body-sm text-primary font-semibold hover:underline flex items-center gap-1 transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Zurück zur Anmeldung
            </Link>
          </div>
        </div>

        {/* Decorative system footer */}
        <div className="mt-8 text-center">
          <p className="text-caption-tiny text-outline-variant uppercase tracking-widest">
            © 2024 Fusion Enterprise Workspace
          </p>
        </div>
      </main>
    </div>
  );
}

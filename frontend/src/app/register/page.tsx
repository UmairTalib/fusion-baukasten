"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function RegisterForm() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    organization: "",
    systemRole: "",
    password: "",
    confirmPassword: "",
    privacyConsent: false,
  });

  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [tokenLoading, setTokenLoading] = useState(!!token);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  
  useEffect(() => {
    if (token) {
      const verifyToken = async () => {
        setTokenLoading(true);
        try {
          const res = await fetch(`http://localhost:8000/api/v1/invitations/verify/${token}`);
          if (res.ok) {
            const data = await res.json();
            setFormData(prev => ({
              ...prev,
              email: data.email || "",
              organization: data.org_name || "",
              systemRole: data.role || "team_member"
            }));
            setIsValidToken(true);
          } else {
            setError("Der Einladungslink ist ungültig oder abgelaufen. Bitte fordern Sie eine neue Einladung an.");
          }
        } catch (e) {
          // Network error — still let user register, just without pre-fill
          console.error("Token verification failed:", e);
          setError("Verbindungsfehler beim Überprüfen der Einladung. Sie können sich trotzdem registrieren.");
        } finally {
          setTokenLoading(false);
        }
      };
      verifyToken();
    }
  }, [token]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [id]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [id]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError("Das Passwort muss mindestens 8 Zeichen lang sein und einen Großbuchstaben, einen Kleinbuchstaben, eine Zahl und ein Sonderzeichen enthalten.");
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError("Die Passwörter stimmen nicht überein.");
      return;
    }
    if (!formData.privacyConsent) {
      setError("Bitte akzeptieren Sie die Datenschutzbestimmungen.");
      return;
    }
    if (!formData.systemRole) {
      setError("Bitte wählen Sie eine Rolle aus.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/v1/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          first_name: formData.firstName,
          last_name: formData.lastName,
          organization: formData.organization,
          system_role: formData.systemRole,
          privacy_consent: formData.privacyConsent,
          invite_token: token || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Registrierung fehlgeschlagen.");
      }

      const data = await response.json();
      
      if (data.verification_required) {
        router.push("/verify-email-notice");
        return;
      }
      
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("role", data.role);
      document.cookie = `token=${data.access_token}; path=/; max-age=86400`;
      document.cookie = `role=${data.role}; path=/; max-age=86400`;
      
      const role = data.role;
      if (role === "project_manager") router.push("/dashboard/project-manager");
      else if (role === "team_member") router.push("/dashboard/team-member");
      else router.push("/dashboard/client");
      
    } catch (err: any) {
      setError(err.message || "Ein unerwarteter Fehler ist aufgetreten.");
    } finally {
      setLoading(false);
    }
  };



  // Helper: human-readable role label
  const roleLabel = (role: string) => {
    if (role === "project_manager") return "Projektmanager:in";
    if (role === "team_member") return "Teammitglied";
    if (role === "client") return "Kunde / Externe:r";
    return role;
  };

  // Show spinner while verifying token
  if (tokenLoading) {
    return (
      <div className="min-h-screen bg-surface-bright flex items-center justify-center">
        <div className="text-center">
          <span className="animate-spin material-symbols-outlined text-[48px] text-primary block mb-4">progress_activity</span>
          <p className="text-on-surface-variant">Einladung wird überprüft...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-bright flex items-center justify-center p-6 relative overflow-hidden selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Atmospheric blobs */}
      <div className="absolute top-[-200px] right-[-200px] w-[600px] h-[600px] rounded-full blur-[120px] opacity-20 pointer-events-none" style={{ background: "linear-gradient(135deg, #5c3be0, #4478e8)" }} />
      <div className="absolute bottom-[-200px] left-[-200px] w-[500px] h-[500px] bg-tertiary-fixed rounded-full blur-[100px] opacity-30 pointer-events-none" />

      <div className="relative z-10 w-full max-w-[520px] mx-auto">
        {/* Card */}
        <div className="bg-surface/90 backdrop-blur-md rounded-2xl border border-white shadow-[0_14px_36px_rgba(45,55,95,0.12)] p-8 md:p-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div
              className="w-10 h-10 text-white flex items-center justify-center rounded-lg font-bold text-xl leading-none"
              style={{ background: "linear-gradient(135deg, #5c3be0 0%, #3f2bc4 100%)" }}
            >
              F
            </div>
            <span className="text-brand-section text-text-primary tracking-tight">
              Fusion-Baukasten
            </span>
          </div>

          <h2 className="text-page-title text-text-primary mb-1">Konto erstellen</h2>
          <p className="text-body-lg text-on-surface-variant mb-6">
            {isValidToken ? "Vervollständigen Sie Ihr Profil, um loszulegen." : "Starten Sie Ihr intelligentes Projektmanagement."}
          </p>

          {/* Invitation confirmed banner */}
          {isValidToken && (
            <div className="mb-6 p-4 bg-green/10 border border-green/20 rounded-xl flex items-start gap-3">
              <span className="material-symbols-outlined text-green text-[20px] mt-0.5">verified</span>
              <div>
                <p className="text-green font-bold text-[13px]">Einladung bestätigt</p>
                <p className="text-green/80 text-[12px] mt-0.5">Ihre E-Mail-Adresse, Organisation und Rolle wurden automatisch eingetragen.</p>
              </div>
            </div>
          )}

          {/* Error (non-fatal) */}
          {error && (
            <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-lg text-sm border border-red/20">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Name row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-label-caps text-label-text uppercase" htmlFor="firstName">Vorname</label>
                <input className="input-field text-body-sm" id="firstName" placeholder="z. B. Max" type="text" value={formData.firstName} onChange={handleChange} required />
              </div>
              <div className="space-y-1.5">
                <label className="block text-label-caps text-label-text uppercase" htmlFor="lastName">Nachname</label>
                <input className="input-field text-body-sm" id="lastName" placeholder="z. B. Mustermann" type="text" value={formData.lastName} onChange={handleChange} required />
              </div>
            </div>

            {/* Email — always readonly when token is valid */}
            <div className="space-y-1.5">
              <label className="block text-label-caps text-label-text uppercase" htmlFor="email">
                Dienstliche E-Mail-Adresse
              </label>
              <div className="relative">
                <input
                  className={`input-field text-body-sm ${isValidToken ? 'bg-surface-container-low text-outline cursor-not-allowed pr-10' : ''}`}
                  id="email" placeholder="z. B. name@organisation.de" type="email"
                  value={formData.email} onChange={handleChange} required readOnly={isValidToken}
                />
                {isValidToken && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-green text-[18px]">lock</span>
                )}
              </div>
            </div>

            {/* Organization — readonly if from invite, editable otherwise */}
            <div className="space-y-1.5">
              <label className="block text-label-caps text-label-text uppercase" htmlFor="organization">
                Organisation / Kommune
              </label>
              <div className="relative">
                <input
                  className={`input-field text-body-sm ${isValidToken ? 'bg-surface-container-low text-outline cursor-not-allowed pr-10' : ''}`}
                  id="organization" placeholder="z. B. Stadt Siegen" type="text"
                  value={formData.organization} onChange={handleChange}
                  required readOnly={isValidToken}
                />
                {isValidToken && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-green text-[18px]">lock</span>
                )}
              </div>
            </div>

            {/* Role — pre-selected badge if from invite, dropdown otherwise */}
            <div className="space-y-1.5">
              <label className="block text-label-caps text-label-text uppercase" htmlFor="systemRole">
                Rolle
              </label>
              {isValidToken ? (
                <div className="flex items-center justify-between bg-surface-container-low cursor-not-allowed px-[14px] py-[11px] rounded-[10px] border-[1.5px] border-outline-variant">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
                    <span className="text-outline font-medium text-[14px]">{roleLabel(formData.systemRole)}</span>
                  </span>
                  <span className="material-symbols-outlined text-green text-[18px]">lock</span>
                </div>
              ) : (
                <div className="relative">
                  <select className="input-field text-body-sm appearance-none cursor-pointer pr-10 bg-white" id="systemRole" value={formData.systemRole} onChange={handleChange} required>
                    <option disabled value="">Bitte wählen...</option>
                    <option value="project_manager">Projektmanager:in</option>
                    <option value="team_member">Teammitglied</option>
                    <option value="client">Kunde / Externe:r</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-outline">
                    <span className="material-symbols-outlined text-[20px]">expand_more</span>
                  </div>
                </div>
              )}
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-label-caps text-label-text uppercase" htmlFor="password">Passwort</label>
                <div className="relative">
                  <input className="input-field text-body-sm pr-10" id="password" placeholder="••••••••" type={showPassword ? "text" : "password"} value={formData.password} onChange={handleChange} required minLength={8} />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant hover:text-primary transition-colors" type="button" onClick={() => setShowPassword(!showPassword)}>
                    <span className="material-symbols-outlined text-[20px]">{showPassword ? "visibility_off" : "visibility"}</span>
                  </button>
                </div>
                <p className="text-[11px] text-on-surface-variant leading-tight">Mindestens 8 Zeichen, Groß-/Kleinbuchstaben, Zahl & Sonderzeichen.</p>
              </div>
              <div className="space-y-1.5">
                <label className="block text-label-caps text-label-text uppercase" htmlFor="confirmPassword">Passwort wiederholen</label>
                <div className="relative">
                  <input className="input-field text-body-sm pr-10" id="confirmPassword" placeholder="••••••••" type={showConfirmPassword ? "text" : "password"} value={formData.confirmPassword} onChange={handleChange} required minLength={8} />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant hover:text-primary transition-colors" type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    <span className="material-symbols-outlined text-[20px]">{showConfirmPassword ? "visibility_off" : "visibility"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Privacy */}
            <div className="flex items-start mt-4">
              <input className="w-4 h-4 mt-0.5 text-primary bg-surface border-line rounded focus:ring-primary focus:ring-2 cursor-pointer" id="privacyConsent" type="checkbox" checked={formData.privacyConsent} onChange={handleChange} />
              <label className="ml-2 text-body-sm text-on-surface-variant cursor-pointer" htmlFor="privacyConsent">
                Ich akzeptiere die{" "}
                <a href="/privacy" className="text-primary hover:underline font-semibold">Datenschutzbestimmungen (DSGVO)</a>.
              </label>
            </div>

            <button
              className="w-full py-3 mt-4 text-white rounded-lg text-label-caps font-bold uppercase tracking-wide flex justify-center items-center gap-2 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(90deg, #4414c9 0%, #5243d7 100%)" }}
              type="submit" disabled={loading}
            >
              {loading ? "Wird erstellt..." : "Konto erstellen"}
              {!loading && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
            </button>
          </form>

          <div className="pt-6 border-t border-line text-center mt-6">
            <p className="text-body-sm text-on-surface-variant">
              Bereits ein Konto?{" "}
              <a href="/login" className="text-primary font-bold hover:underline">Hier anmelden</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Laden...</div>}>
      <RegisterForm />
    </Suspense>
  );
}

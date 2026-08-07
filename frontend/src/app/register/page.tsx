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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  
  useEffect(() => {
    if (token) {
      const verifyToken = async () => {
        try {
          const res = await fetch(`http://localhost:8000/api/v1/invitations/verify/${token}`);
          if (res.ok) {
            const data = await res.json();
            setFormData(prev => ({
              ...prev,
              email: data.email,
              organization: data.org_name || "",
              systemRole: data.role || "team_member"
            }));
            setIsValidToken(true);
          } else {
            setError("Der Einladungslink ist ungültig oder abgelaufen.");
          }
        } catch (e) {
          setError("Fehler beim Überprüfen der Einladung.");
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



  return (
    <div className="min-h-screen flex items-center justify-center antialiased selection:bg-primary-fixed selection:text-on-primary-fixed p-4 sm:p-8">
      <div className="w-full max-w-md mx-auto flex flex-col justify-center">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="brand-box">
              <span>F</span>
            </div>
            <span className="text-brand-section text-text-primary tracking-tight">
              Fusion-Baukasten
            </span>
          </div>
          <div>
            <h2 className="text-page-title text-text-primary mt-4">
              Konto erstellen
            </h2>
            <p className="text-body-lg text-on-surface-variant mt-3">
              Starten Sie Ihr intelligentes Projektmanagement.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-lg text-sm border border-red/20">
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label
                className="block text-label-caps text-label-text uppercase"
                htmlFor="firstName"
              >
                Vorname
              </label>
              <input
                className="input-field text-body-sm"
                id="firstName"
                placeholder="z. B. Max"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label
                className="block text-label-caps text-label-text uppercase"
                htmlFor="lastName"
              >
                Nachname
              </label>
              <input
                className="input-field text-body-sm"
                id="lastName"
                placeholder="z. B. Mustermann"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label
              className="block text-label-caps text-label-text uppercase"
              htmlFor="email"
            >
              Dienstliche E-Mail-Adresse
            </label>
            <input
              className={`input-field text-body-sm ${isValidToken ? 'bg-bg-subtle text-outline cursor-not-allowed' : ''}`}
              id="email"
              placeholder="z. B. name@organisation.de"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              readOnly={isValidToken}
            />
          </div>
          {!isValidToken && (
            <>
              <div className="space-y-1.5">
                <label
                  className="block text-label-caps text-label-text uppercase"
                  htmlFor="organization"
                >
                  Organisation / Kommune
                </label>
                <input
                  className="input-field text-body-sm"
                  id="organization"
                  placeholder="z. B. Stadt Siegen"
                  type="text"
                  value={formData.organization}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label
                  className="block text-label-caps text-label-text uppercase"
                  htmlFor="systemRole"
                >
                  Rolle auswählen
                </label>
                <div className="relative">
                  <select
                    className="input-field text-body-sm appearance-none cursor-pointer pr-10 bg-white"
                    id="systemRole"
                    value={formData.systemRole}
                    onChange={handleChange}
                    required
                  >
                    <option disabled value="">
                      Bitte wählen...
                    </option>
                    <option value="project_manager">Projektmanager:in</option>
                    <option value="team_member">Teammitglied</option>
                    <option value="client">Kunde / Externe:r</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-outline">
                    <span className="material-symbols-outlined text-[20px]">
                      expand_more
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label
                className="block text-label-caps text-label-text uppercase"
                htmlFor="password"
              >
                Passwort
              </label>
              <div className="relative">
                <input
                  className="input-field text-body-sm pr-10"
                  id="password"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={8}
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
              <p className="text-[11px] text-on-surface-variant leading-tight">
                Mindestens 8 Zeichen, ein Großbuchstabe, ein Kleinbuchstabe, eine Zahl und ein Sonderzeichen.
              </p>
            </div>
            <div className="space-y-1.5">
              <label
                className="block text-label-caps text-label-text uppercase"
                htmlFor="confirmPassword"
              >
                Passwort wiederholen
              </label>
              <div className="relative">
                <input
                  className="input-field text-body-sm pr-10"
                  id="confirmPassword"
                  placeholder="••••••••"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={8}
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
          <div className="flex items-start mt-6">
            <div className="flex items-center h-5">
              <input
                className="w-4 h-4 text-[#5c3be0] bg-surface border-line rounded focus:ring-[#5c3be0] focus:ring-2 cursor-pointer"
                id="privacyConsent"
                type="checkbox"
                checked={formData.privacyConsent}
                onChange={handleChange}
              />
            </div>
            <label
              className="ml-2 text-body-sm text-on-surface-variant cursor-pointer"
              htmlFor="privacyConsent"
            >
              Ich akzeptiere die{" "}
              <Link
                href="/privacy"
                className="text-[#5c3be0] hover:underline font-semibold"
              >
                Datenschutzbestimmungen (DSGVO)
              </Link>
              .
            </label>
          </div>
          <button
            className="btn-primary w-full py-3 mt-8 text-label-caps uppercase tracking-wide flex justify-center items-center gap-2 shadow-lg"
            type="submit"
            disabled={loading}
          >
            {loading ? "Wird erstellt..." : "Konto erstellen"}
            {!loading && (
              <span className="material-symbols-outlined text-[18px]">
                arrow_forward
              </span>
            )}
          </button>
        </form>
        <div className="pt-8 border-t border-line text-center mb-4 mt-8">
          <p className="text-body-sm text-on-surface-variant">
            Bereits ein Konto?{" "}
            <Link
              href="/login"
              className="text-[#5c3be0] font-semibold hover:underline"
            >
              Hier anmelden
            </Link>
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

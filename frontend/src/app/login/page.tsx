"use client";

import React, { useState, useEffect, Suspense } from "react";
import { createPortal } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // SSO Modal State
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState("client"); // default selected in dropdown
  const [modalFirstName, setModalFirstName] = useState("");
  const [modalLastName, setModalLastName] = useState("");
  const [modalOrganization, setModalOrganization] = useState("");
  const [ssoToken, setSsoToken] = useState(""); // to store backend JWT temporarily before assign

  useEffect(() => {
    setMounted(true);
  }, []);



  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      setSuccessMsg("Konto erfolgreich erstellt! Sie können sich jetzt anmelden.");
    }
  }, [searchParams]);

  // Handle SSO session changes
  useEffect(() => {
    const handleSSO = async () => {
      if (status === "authenticated" && session?.user?.email && !loading && !showRoleModal) {
        setLoading(true);
        try {
          const splitName = (session.user.name || "Gast").split(" ");
          const firstName = splitName[0];
          const lastName = splitName.slice(1).join(" ") || "";
          
          const response = await fetch("http://localhost:8000/api/v1/auth/sso", {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ 
              email: session.user.email,
              first_name: firstName,
              last_name: lastName,
              provider: (session as any).provider || "unknown",
              id_token: (session as any).id_token || ""
            }),
          });

          if (!response.ok) throw new Error("SSO Anmeldung fehlgeschlagen.");
          const data = await response.json();
          
          if (data.is_new_user) {
            // New user without role - DO NOT SET COOKIES YET
            setModalFirstName(firstName);
            setModalLastName(lastName);
            setShowRoleModal(true);
            return;
          }
          
          localStorage.setItem("role", data.role);
          document.cookie = `role=${data.role}; path=/; max-age=86400`;
          
          if (!data.role) {
            setShowRoleModal(true);
          } else {
            // Existing user with role
            routeByRole(data.role);
          }
        } catch (err: any) {
          setError(err.message || "Ein unerwarteter Fehler ist aufgetreten.");
        } finally {
          setLoading(false);
        }
      }
    };
    handleSSO();
  }, [status, session]);

  const routeByRole = (role: string) => {
    if (role === "project_manager") router.push("/dashboard/project-manager");
    else if (role === "team_member") router.push("/dashboard/team-member");
    else router.push("/dashboard/client");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/v1/auth/login", {
        method: "POST",
        credentials: "include",
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
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("role", data.role);
      document.cookie = `access_token=${data.access_token}; path=/; max-age=86400; samesite=lax`;
      document.cookie = `role=${data.role}; path=/; max-age=86400`;
      routeByRole(data.role);

    } catch (err: any) {
      setError(err.message || "Ein unerwarteter Fehler ist aufgetreten.");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleAssign = async () => {
    if (!modalOrganization.trim()) {
      setError("Bitte geben Sie eine Organisation ein.");
      return;
    }
    setLoading(true);
    try {
      const splitName = (session?.user?.name || "Gast").split(" ");
      const firstName = splitName[0];
      const lastName = splitName.slice(1).join(" ") || "";

      const response = await fetch("http://localhost:8000/api/v1/auth/assign-role", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${ssoToken}` // though endpoint looks up by email, good practice
        },
        body: JSON.stringify({ 
          email: session?.user?.email, 
          system_role: selectedRole,
          first_name: modalFirstName,
          last_name: modalLastName,
          organization: modalOrganization,
          id_token: (session as any).id_token || ""
        }),
      });

      if (!response.ok) throw new Error("Rolle konnte nicht zugewiesen werden.");
      const data = await response.json();
      
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("role", data.role);
      document.cookie = `access_token=${data.access_token}; path=/; max-age=86400; samesite=lax`;
      document.cookie = `role=${data.role}; path=/; max-age=86400`;
      setShowRoleModal(false);
      routeByRole(data.role);

    } catch(err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };



  return (
    <>
      {/* Role Selection Modal */}
      {showRoleModal && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-md">
          <div className="bg-surface p-8 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-outline-variant w-full max-w-md mx-4 z-[10000] relative">
            <h2 className="text-page-title mb-2 text-on-surface">Ein letzter Schritt!</h2>
            <p className="text-body-lg text-on-surface-variant mb-6">Bitte wählen Sie Ihre Rolle aus, um fortzufahren.</p>
            
            <label className="text-label-caps text-label-text block mb-2 uppercase tracking-wider">Organisation</label>
            <input 
              type="text"
              className="w-full px-[12px] py-3 bg-surface border border-line rounded-lg font-body-lg text-on-surface mb-4 outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-outline"
              placeholder="z.B. Kommune Musterstadt"
              value={modalOrganization}
              onChange={(e) => setModalOrganization(e.target.value)}
            />

            <label className="text-label-caps text-label-text block mb-2 uppercase tracking-wider">Ihre Funktion/Rolle</label>
            <select 
              className="w-full px-[12px] py-3 bg-surface border border-line rounded-lg font-body-lg text-on-surface mb-6 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="client">Kunde / Bürger</option>
              <option value="team_member">Team-Mitglied</option>
              <option value="project_manager">Projektmanager</option>
            </select>

            <button 
              onClick={handleRoleAssign}
              disabled={loading}
              style={{
                background: "linear-gradient(90deg, #4414c9 0%, #5243d7 100%)",
                transition: "transform 0.2s ease, opacity 0.2s ease",
              }}
              onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
              onMouseUp={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0px)")}
              className="w-full h-12 flex items-center justify-center gap-2 bg-primary text-white rounded-lg text-label-caps transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "WIRD GESPEICHERT..." : "SPEICHERN & FORTFAHREN"}
            </button>
          </div>
        </div>,
        document.body
      )}

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
        <button 
          onClick={() => signIn("azure-ad")}
          type="button"
          className="w-full flex items-center justify-center gap-3 px-4 py-[10px] bg-surface border border-line rounded-lg text-text-primary text-label-caps hover:bg-surface-container-low transition-colors shadow-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z" fill="#00a4ef" />
          </svg>
          Mit Microsoft anmelden
        </button>
        <button 
          onClick={() => signIn("google")}
          type="button"
          className="w-full flex items-center justify-center gap-3 px-4 py-[10px] bg-surface border border-line rounded-lg text-text-primary text-label-caps hover:bg-surface-container-low transition-colors shadow-sm"
        >
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
          <label className="text-label-caps text-text-primary uppercase tracking-wider" htmlFor="email">
            E-Mail-Adresse
          </label>
          <input
            className="w-full px-[12px] py-3 rounded-lg border border-line bg-surface text-on-surface placeholder:text-outline font-body-lg transition-all outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            id="email"
            placeholder="z. B. max@kommune-musterstadt.de"
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <label className="text-label-caps text-text-primary uppercase tracking-wider" htmlFor="password">
              Passwort
            </label>
            <Link
              className="text-body-sm text-primary hover:text-primary-container transition-colors"
              href="/forgot-password"
            >
              Passwort vergessen?
            </Link>
          </div>
          <div className="relative">
            <input
              className="w-full px-[12px] py-3 rounded-lg border border-line bg-surface text-on-surface placeholder:text-outline font-body-lg transition-all outline-none focus:border-primary focus:ring-1 focus:ring-primary pr-10"
              id="password"
              placeholder="••••••••"
              required
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
        </div>
        <button
          className="w-full py-3 bg-primary text-white rounded-lg text-label-caps hover:bg-primary-container transition-colors shadow-sm mt-2 disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-wider"
          type="submit"
          disabled={loading}
          style={{
            background: "linear-gradient(90deg, #4414c9 0%, #5243d7 100%)",
          }}
        >
          {loading ? "Wird angemeldet..." : "Anmelden"}
        </button>
      </form>
    </>
  );
}

export default function LoginPage() {
  const router = useRouter();

  const handleGuestLogin = () => {
    const guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    localStorage.setItem("guest_session_id", guestId);
    document.cookie = `guest_session_id=${guestId}; path=/; max-age=86400`; // 1 day
    
    router.push("/dashboard/client");
  };

  return (
    <div className="bg-surface-bright text-text-primary h-screen w-full font-body-sm overflow-hidden flex relative">
      {/* Left Column: Form */}
      <div className="w-full lg:w-1/2 h-full bg-surface flex flex-col justify-center px-6 sm:px-12 lg:px-24 overflow-y-auto py-12 lg:py-0 relative z-50 shadow-[0_0_40px_rgba(0,0,0,0.05)]">
        <div className="max-w-[440px] w-full mx-auto relative z-50">
          {/* Branding */}
          <div className="mb-10 text-center lg:text-left">
            <div className="inline-flex items-center gap-3 mb-3">
              <div 
                className="w-10 h-10 text-white flex items-center justify-center rounded-lg font-bold text-xl leading-none"
                style={{ background: "linear-gradient(135deg, #5c3be0 0%, #3f2bc4 100%)" }}
              >
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

          <Suspense fallback={<div className="flex justify-center p-8"><span className="animate-spin material-symbols-outlined text-[32px] text-primary">progress_activity</span></div>}>
            <LoginForm />
          </Suspense>

          {/* Privacy & Registration Footer */}
          <div className="flex flex-col gap-3 pt-4 border-t border-line">
            <p className="text-body-sm text-on-surface-variant text-center max-w-[90%] mx-auto leading-relaxed">
              <span className="font-bold">DSGVO-konform.</span>
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
              <img
                alt="Interface mockup"
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

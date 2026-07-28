"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:8000/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Anmeldung fehlgeschlagen");
      }

      const data = await res.json();
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user_role", data.role);
      localStorage.setItem("user", JSON.stringify(data.user));

      const roleRoutes: Record<string, string> = {
        project_manager: "/dashboard/manager",
        team_member: "/dashboard/team",
        client: "/dashboard/client",
      };
      router.push(roleRoutes[data.role] ?? "/dashboard/client");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ein Fehler ist aufgetreten");
    } finally {
      setLoading(false);
    }
  }

  function handleGuestLogin() {
    const sessionId = crypto.randomUUID();
    localStorage.setItem("guest_session_id", sessionId);
    localStorage.setItem("user_role", "client");
    localStorage.setItem("is_guest", "true");
    router.push("/dashboard/client");
  }

  function handleOAuth(provider: string) {
    alert(`${provider} Single-Sign-On (SSO) wird in Produktion über OAuth2/OIDC verbunden.`);
  }

  return (
    <div className="bg-[#faf8ff] text-[#0d1b37] min-h-screen w-full font-sans flex overflow-hidden">
      {/* ── Left Column: Form (Full width on Mobile, 50% on Desktop) ── */}
      <div className="w-full lg:w-1/2 h-screen bg-white flex flex-col justify-center px-6 sm:px-12 lg:px-24 overflow-y-auto">
        <div className="max-w-[440px] w-full mx-auto py-12">
          {/* Branding */}
          <div className="mb-10 text-center lg:text-left">
            <div className="inline-flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-[#5c3be0] text-white flex items-center justify-center rounded-lg font-bold text-xl leading-none shadow-md">
                F
              </div>
              <h1 className="text-3xl font-black text-[#0d1b37] tracking-tight">
                Fusion-Baukasten
              </h1>
            </div>
            <p className="text-base font-semibold text-[#484555]">
              KI-gestützte Partizipationsplanung
            </p>
          </div>

          {/* SSO Buttons */}
          <div className="flex flex-col gap-3 mb-8">
            <button
              type="button"
              onClick={() => handleOAuth("Microsoft")}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-[#e0e6f2] rounded-lg text-[#0d1b37] font-extrabold text-xs uppercase tracking-wider hover:bg-[#f2f3ff] transition-colors shadow-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z" fill="#00a4ef" />
              </svg>
              Mit Microsoft anmelden
            </button>

            <button
              type="button"
              onClick={() => handleOAuth("Google")}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-[#e0e6f2] rounded-lg text-[#0d1b37] font-extrabold text-xs uppercase tracking-wider hover:bg-[#f2f3ff] transition-colors shadow-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Mit Google anmelden
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-[#e0e6f2]"></div>
            <span className="text-xs font-semibold text-[#484555] uppercase tracking-wider">
              oder mit E-Mail anmelden
            </span>
            <div className="flex-1 h-px bg-[#e0e6f2]"></div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-4 mb-8">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-extrabold text-[#0d1b37] uppercase tracking-wider" htmlFor="email">
                E-Mail-Adresse
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="max@kommune-musterstadt.de"
                className="w-full px-4 py-3 border border-[#c9c4d8] rounded-lg bg-white text-[#0d1b37] placeholder:text-[#484555]/50 focus:outline-none focus:border-[#5c3be0] focus:ring-2 focus:ring-[#5c3be0]/20 transition-all text-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-extrabold text-[#0d1b37] uppercase tracking-wider" htmlFor="password">
                  Passwort
                </label>
                <a href="/forgot-password" className="text-xs font-semibold text-[#5c3be0] hover:text-[#3f2bc4] transition-colors">
                  Passwort vergessen?
                </a>
              </div>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-[#c9c4d8] rounded-lg bg-white text-[#0d1b37] placeholder:text-[#484555]/50 focus:outline-none focus:border-[#5c3be0] focus:ring-2 focus:ring-[#5c3be0]/20 transition-all text-sm"
              />
            </div>

            {error && (
              <div className="p-3 bg-[#ffdad6] text-[#93000a] rounded-lg text-xs font-medium border border-[#f05a5a]">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#5c3be0] text-white rounded-lg font-extrabold text-xs uppercase tracking-wider hover:bg-[#3f2bc4] transition-colors shadow-md mt-2 disabled:opacity-50"
            >
              {loading ? "Anmeldung läuft..." : "Anmelden"}
            </button>
          </form>

          {/* Guest & Privacy */}
          <div className="flex flex-col gap-3 pt-4 border-t border-[#e0e6f2]">
            <button
              type="button"
              onClick={handleGuestLogin}
              className="w-full py-3 bg-transparent border border-[#797587] text-[#484555] rounded-lg font-extrabold text-xs uppercase tracking-wider hover:bg-[#f2f3ff] transition-colors"
            >
              Als Gast fortfahren
            </button>
            <p className="text-xs text-[#484555] text-center max-w-[90%] mx-auto leading-relaxed">
              Start ohne Registrierung möglich. Ihr Projekt kann später gespeichert werden. <span className="font-bold text-[#0d1b37]">DSGVO-konform.</span>
            </p>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-[#484555]">
              Noch kein Konto?{" "}
              <a href="/register" className="text-[#5c3be0] font-bold hover:underline">
                Jetzt registrieren
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* ── Right Column: Visual Preview (Hidden on Mobile, Visible on Desktop) ── */}
      <div className="hidden lg:flex w-1/2 h-screen bg-[#f2f3ff] relative overflow-hidden items-center justify-center p-12">
        {/* Background glow effects */}
        <div className="absolute top-1/4 -right-1/4 w-[800px] h-[800px] bg-gradient-to-br from-[#5c3be0] to-[#4478e8] rounded-full blur-[120px] opacity-20 mix-blend-multiply"></div>
        <div className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-[#dae2ff] rounded-full blur-[100px] opacity-40 mix-blend-multiply"></div>

        {/* Glassmorphism Preview Card */}
        <div className="relative z-10 w-full max-w-[600px] aspect-[4/3] rounded-2xl bg-white/70 backdrop-blur-xl border border-white shadow-[0_14px_36px_rgba(45,55,95,0.08)] overflow-hidden flex flex-col">
          {/* Mock Header */}
          <div className="h-12 border-b border-[#e0e6f2]/50 flex items-center px-6 gap-3 bg-white/40">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-[#e0e6f2]"></div>
              <div className="w-3 h-3 rounded-full bg-[#e0e6f2]"></div>
              <div className="w-3 h-3 rounded-full bg-[#e0e6f2]"></div>
            </div>
            <div className="flex-1"></div>
            <div className="h-6 w-32 bg-[#eaedff] rounded-full"></div>
          </div>

          {/* Mock Content */}
          <div className="flex-1 p-6 flex flex-col gap-4">
            <div className="flex justify-between items-end mb-3">
              <div>
                <div className="h-4 w-24 bg-[#5c3be0]/20 rounded mb-2"></div>
                <div className="h-8 w-48 bg-[#0d1b37]/10 rounded"></div>
              </div>
              <div className="h-10 w-10 bg-[#d9e2ff] rounded-lg flex items-center justify-center text-[#5c3be0] font-bold">
                🤖
              </div>
            </div>

            <div className="flex gap-4 h-[140px]">
              <div className="flex-1 bg-[#faf8ff] border border-[#e0e6f2]/50 rounded-xl p-4 shadow-sm relative overflow-hidden">
                <div className="h-3 w-1/2 bg-[#484555]/20 rounded mb-4"></div>
                <div className="flex gap-2 mb-2">
                  <div className="h-2 w-full bg-[#484555]/10 rounded"></div>
                  <div className="h-2 w-2/3 bg-[#484555]/10 rounded"></div>
                </div>
                <div className="h-2 w-4/5 bg-[#484555]/10 rounded mb-4"></div>
                <div className="h-8 w-full bg-[#5c3be0]/5 rounded border border-[#5c3be0]/10 mt-4"></div>
              </div>

              <div className="flex-1 bg-[#faf8ff] border border-[#e0e6f2]/50 rounded-xl p-4 shadow-sm flex flex-col items-center justify-center">
                <div className="h-3 w-1/3 bg-[#484555]/20 rounded mb-4"></div>
                <div className="w-12 h-12 rounded-full border-4 border-[#d9e2ff] border-t-[#5c3be0] animate-spin"></div>
              </div>
            </div>

            <div className="flex-1 bg-[#eaedff] border border-[#e0e6f2]/50 rounded-xl p-4 flex flex-col justify-end">
              <div className="flex justify-between items-center bg-white/80 backdrop-blur-sm p-3 rounded-lg border border-white">
                <div className="h-3 w-32 bg-[#0d1b37]/40 rounded"></div>
                <div className="h-6 px-3 bg-[#5c3be0] text-white rounded text-[10px] font-bold flex items-center justify-center">
                  Generieren
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Marketing Text */}
        <div className="absolute bottom-10 left-12 right-12 text-center z-20 pointer-events-none">
          <h2 className="text-2xl font-black text-[#0d1b37] mb-1">
            Planung neu gedacht.
          </h2>
          <p className="text-sm font-normal text-[#484555] max-w-md mx-auto">
            Nutzen Sie die Kraft unserer KI-Agenten, um komplexe Partizipationsprozesse effizienter und inklusiver zu gestalten.
          </p>
        </div>
      </div>
    </div>
  );
}

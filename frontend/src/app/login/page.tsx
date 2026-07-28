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
    <div className="min-h-screen bg-bg-subtle flex items-center justify-center p-4 font-sans text-on-surface">
      <div className="w-full max-w-md bg-surface border border-border rounded-xl p-8 shadow-xl">
        {/* Branding */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-14 h-14 bg-primary-container rounded-xl flex items-center justify-center text-white font-extrabold text-2xl mb-3 shadow-md">
            F
          </div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">Fusion-Baukasten</h1>
          <p className="text-sm text-on-secondary-container mt-1">KI-gestützte Partizipationsplanung</p>
        </div>

        {/* SSO Options (Microsoft / Google) */}
        <div className="flex flex-col gap-3 mb-6">
          <button
            type="button"
            onClick={() => handleOAuth("Microsoft")}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-border rounded-lg text-sm font-semibold text-on-surface hover:bg-surface-container-low transition-colors shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 23 23">
              <path fill="#f35325" d="M1 1h10v10H1z" />
              <path fill="#81bc06" d="M12 1h10v10H12z" />
              <path fill="#05a6f0" d="M1 12h10v10H1z" />
              <path fill="#ffba08" d="M12 12h10v10H12z" />
            </svg>
            Mit Microsoft anmelden
          </button>

          <button
            type="button"
            onClick={() => handleOAuth("Google")}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-border rounded-lg text-sm font-semibold text-on-surface hover:bg-surface-container-low transition-colors shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            Mit Google anmelden
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <span className="relative px-3 bg-surface text-xs font-medium text-on-secondary-container uppercase tracking-wider">
            oder mit E-Mail anmelden
          </span>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-on-surface uppercase tracking-wider mb-1">
              E-Mail-Adresse
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="max@kommune-musterstadt.de"
              className="w-full px-4 py-2.5 bg-bg-subtle border border-border rounded-lg text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-on-surface uppercase tracking-wider">
                Passwort
              </label>
              <a href="/forgot-password" className="text-xs font-semibold text-primary-container hover:underline">
                Passwort vergessen?
              </a>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-bg-subtle border border-border rounded-lg text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all"
            />
          </div>

          {error && (
            <div className="p-3 bg-error-container text-on-error-container rounded-lg text-xs font-medium border border-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary-container text-white font-semibold rounded-lg text-sm hover:bg-primary transition-all shadow-md disabled:opacity-50"
          >
            {loading ? "Anmeldung läuft..." : "Anmelden"}
          </button>
        </form>

        {/* Guest Mode */}
        <div className="mt-6 pt-6 border-t border-border text-center">
          <button
            type="button"
            onClick={handleGuestLogin}
            className="w-full py-2.5 bg-transparent border border-border text-on-surface font-semibold rounded-lg text-sm hover:bg-surface-container-low transition-colors mb-2"
          >
            Als Gast fortfahren
          </button>
          <p className="text-xs text-on-secondary-container leading-relaxed">
            Start ohne Registrierung möglich. Ihr Projekt kann später dauerhaft gespeichert werden. DSGVO-konform.
          </p>
        </div>

        {/* Register Link */}
        <div className="mt-6 text-center text-xs font-medium text-on-secondary-container">
          Noch kein Konto?{" "}
          <a href="/register" className="text-primary-container font-semibold hover:underline">
            Jetzt registrieren
          </a>
        </div>
      </div>
    </div>
  );
}

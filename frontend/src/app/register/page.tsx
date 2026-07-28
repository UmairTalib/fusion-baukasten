"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [role, setRole] = useState("client");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [dsgvo, setDsgvo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (password !== passwordConfirm) {
      setError("Die Passwörter stimmen nicht überein");
      return;
    }
    if (!dsgvo) {
      setError("Bitte akzeptieren Sie die Datenschutzbestimmungen");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:8000/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          first_name: firstName,
          last_name: lastName,
          organization,
          system_role: role,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Registrierung fehlgeschlagen");
      }

      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ein Fehler ist aufgetreten");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-bg-subtle flex items-center justify-center p-4 font-sans text-on-surface">
        <div className="w-full max-w-md bg-surface border border-border rounded-xl p-8 shadow-xl text-center">
          <div className="w-14 h-14 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
            ✓
          </div>
          <h2 className="text-xl font-bold text-on-surface mb-2">Registrierung erfolgreich!</h2>
          <p className="text-sm text-on-secondary-container mb-6 leading-relaxed">
            Wir haben eine Bestätigungs-E-Mail an <strong>{email}</strong> gesendet. Bitte aktivieren Sie Ihr Konto, um fortzufahren.
          </p>
          <a
            href="/login"
            className="inline-block w-full py-3 bg-primary-container text-white font-semibold rounded-lg text-sm hover:bg-primary transition-all shadow-md"
          >
            Zum Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-subtle flex items-center justify-center p-4 font-sans text-on-surface">
      <div className="w-full max-w-lg bg-surface border border-border rounded-xl p-8 shadow-xl my-8">
        {/* Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-12 h-12 bg-primary-container rounded-xl flex items-center justify-center text-white font-extrabold text-xl mb-2 shadow-md">
            F
          </div>
          <h1 className="text-xl font-bold text-on-surface">Konto erstellen</h1>
          <p className="text-xs text-on-secondary-container mt-1">
            Fusion-Baukasten · KI-gestützte Partizipationsplanung
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Name Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-on-surface uppercase tracking-wider mb-1">
                Vorname
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Max"
                className="w-full px-3.5 py-2 bg-bg-subtle border border-border rounded-lg text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface uppercase tracking-wider mb-1">
                Nachname
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Mustermann"
                className="w-full px-3.5 py-2 bg-bg-subtle border border-border rounded-lg text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-on-surface uppercase tracking-wider mb-1">
              Dienstliche E-Mail-Adresse
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="max@kommune-musterstadt.de"
              className="w-full px-3.5 py-2 bg-bg-subtle border border-border rounded-lg text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all"
            />
          </div>

          {/* Organization */}
          <div>
            <label className="block text-xs font-semibold text-on-surface uppercase tracking-wider mb-1">
              Organisation / Kommune
            </label>
            <input
              type="text"
              required
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="z.B. Stadt Siegen"
              className="w-full px-3.5 py-2 bg-bg-subtle border border-border rounded-lg text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all"
            />
          </div>

          {/* Role selection (Business Logic Section 3) */}
          <div>
            <label className="block text-xs font-semibold text-on-surface uppercase tracking-wider mb-1">
              Hauptrolle im System
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3.5 py-2 bg-bg-subtle border border-border rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all"
            >
              <option value="client">Kunde / Externe:r (Projektfortschritt verfolgen)</option>
              <option value="project_manager">Projektmanager:in (Gesamtsteuerung & KPIs)</option>
              <option value="team_member">Teammitglied (Aufgabenbearbeitung)</option>
            </select>
          </div>

          {/* Password Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-on-surface uppercase tracking-wider mb-1">
                Passwort
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mind. 8 Zeichen"
                className="w-full px-3.5 py-2 bg-bg-subtle border border-border rounded-lg text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface uppercase tracking-wider mb-1">
                Wiederholen
              </label>
              <input
                type="password"
                required
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 bg-bg-subtle border border-border rounded-lg text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all"
              />
            </div>
          </div>

          {/* DSGVO Checkbox */}
          <div className="flex items-start gap-2 pt-1">
            <input
              type="checkbox"
              id="dsgvo-check"
              checked={dsgvo}
              onChange={(e) => setDsgvo(e.target.checked)}
              className="mt-0.5 rounded border-border text-primary-container focus:ring-primary-container"
            />
            <label htmlFor="dsgvo-check" className="text-xs text-on-secondary-container leading-tight">
              Ich akzeptiere die <a href="/privacy" className="underline text-primary-container">Datenschutzbestimmungen (DSGVO)</a> und bin mit der Verarbeitung meiner Daten einverstanden.
            </label>
          </div>

          {error && (
            <div className="p-3 bg-error-container text-on-error-container rounded-lg text-xs font-medium border border-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary-container text-white font-semibold rounded-lg text-sm hover:bg-primary transition-all shadow-md disabled:opacity-50 mt-2"
          >
            {loading ? "Konto wird erstellt..." : "Konto erstellen"}
          </button>
        </form>

        <div className="mt-6 text-center text-xs font-medium text-on-secondary-container">
          Bereits ein Konto?{" "}
          <a href="/login" className="text-primary-container font-semibold hover:underline">
            Hier anmelden
          </a>
        </div>
      </div>
    </div>
  );
}

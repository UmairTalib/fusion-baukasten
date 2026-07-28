"use client";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // Simulate backend request for password reset link
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  }

  return (
    <div className="min-h-screen bg-bg-subtle flex items-center justify-center p-4 font-sans text-on-surface">
      <div className="w-full max-w-md bg-surface border border-border rounded-xl p-8 shadow-xl">
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-12 h-12 bg-primary-container rounded-xl flex items-center justify-center text-white font-extrabold text-xl mb-2 shadow-md">
            F
          </div>
          <h1 className="text-xl font-bold text-on-surface">Passwort zurücksetzen</h1>
          <p className="text-xs text-on-secondary-container mt-1 max-w-xs leading-relaxed">
            Geben Sie Ihre E-Mail-Adresse ein. Wir senden Ihnen einen Link zum Zurücksetzen Ihres Passworts.
          </p>
        </div>

        {submitted ? (
          <div className="text-center py-4">
            <div className="p-3 bg-success/10 text-success rounded-lg text-xs font-medium border border-success/30 mb-6">
              Wenn ein Konto mit <strong>{email}</strong> existiert, wurde eine E-Mail mit weiteren Anweisungen versendet.
            </div>
            <a
              href="/login"
              className="inline-block w-full py-2.5 bg-primary-container text-white font-semibold rounded-lg text-sm hover:bg-primary transition-all shadow-md"
            >
              Zurück zum Login
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary-container text-white font-semibold rounded-lg text-sm hover:bg-primary transition-all shadow-md disabled:opacity-50"
            >
              {loading ? "Link wird gesendet..." : "Link anfordern"}
            </button>

            <div className="text-center pt-2">
              <a href="/login" className="text-xs font-semibold text-on-secondary-container hover:underline">
                Zurück zum Login
              </a>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

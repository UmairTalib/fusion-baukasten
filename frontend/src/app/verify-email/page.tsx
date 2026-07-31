"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("Kein Bestätigungstoken gefunden.");
      return;
    }

    const verifyEmail = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/v1/auth/verify-email?token=${token}`, {
          method: "POST",
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.detail || "Bestätigung fehlgeschlagen.");
        }

        setStatus("success");
      } catch (err: any) {
        setStatus("error");
        setErrorMessage(err.message || "Ein unerwarteter Fehler ist aufgetreten.");
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center antialiased selection:bg-primary-fixed selection:text-on-primary-fixed p-4 sm:p-8">
      <div className="w-full max-w-md mx-auto flex flex-col justify-center text-center">
        {status === "loading" && (
          <div className="mb-8 flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-6"></div>
            <h2 className="text-page-title text-text-primary mt-4">
              E-Mail wird bestätigt...
            </h2>
            <p className="text-body-lg text-on-surface-variant mt-3">
              Bitte haben Sie einen Moment Geduld.
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="mb-8 flex flex-col items-center">
            <div className="brand-box mb-6 bg-green-500 text-white">
              <span className="material-symbols-outlined text-[32px]">check_circle</span>
            </div>
            <h2 className="text-page-title text-text-primary mt-4">
              E-Mail erfolgreich bestätigt!
            </h2>
            <p className="text-body-lg text-on-surface-variant mt-3">
              Ihr Konto wurde aktiviert. Sie können sich nun anmelden.
            </p>
            <Link
              href="/login"
              className="btn-primary w-full py-3 mt-8 text-label-caps uppercase tracking-wide flex justify-center items-center gap-2 shadow-lg"
            >
              Zum Login
              <span className="material-symbols-outlined text-[18px]">
                arrow_forward
              </span>
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="mb-8 flex flex-col items-center">
            <div className="brand-box mb-6 bg-red-500 text-white">
              <span className="material-symbols-outlined text-[32px]">error</span>
            </div>
            <h2 className="text-page-title text-text-primary mt-4">
              Bestätigung fehlgeschlagen
            </h2>
            <p className="text-body-lg text-on-surface-variant mt-3">
              {errorMessage}
            </p>
            <Link
              href="/login"
              className="btn-primary w-full py-3 mt-8 text-label-caps uppercase tracking-wide flex justify-center items-center gap-2 shadow-lg"
            >
              Zurück zum Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Laden...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}

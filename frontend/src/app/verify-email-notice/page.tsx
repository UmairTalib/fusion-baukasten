"use client";

import React from "react";
import Link from "next/link";

export default function VerifyEmailNoticePage() {
  return (
    <div className="min-h-screen flex items-center justify-center antialiased selection:bg-primary-fixed selection:text-on-primary-fixed p-4 sm:p-8">
      <div className="w-full max-w-[448px] mx-auto flex flex-col justify-center text-center">
        <div className="mb-8 flex flex-col items-center">
          <div 
            className="mb-6 w-16 h-16 text-white flex items-center justify-center rounded-2xl font-bold text-3xl leading-none"
            style={{ background: "linear-gradient(135deg, #5c3be0 0%, #3f2bc4 100%)" }}
          >
            <span className="material-symbols-outlined text-[32px]">mail</span>
          </div>
          <h2 className="text-page-title text-text-primary mt-4">
            E-Mail-Adresse bestätigen
          </h2>
          <p className="text-body-lg text-on-surface-variant mt-3">
            Wir haben Ihnen einen Bestätigungslink an Ihre E-Mail-Adresse gesendet. Bitte prüfen Sie Ihren Posteingang (und ggf. den Spam-Ordner) und klicken Sie auf den Link, um Ihr Konto zu aktivieren.
          </p>
        </div>

        <Link
          href="/login"
          className="w-full py-3 mt-8 bg-primary text-white rounded-lg text-label-caps hover:bg-primary-container transition-colors shadow-lg uppercase tracking-wide flex justify-center items-center gap-2"
          style={{ background: "linear-gradient(90deg, #4414c9 0%, #5243d7 100%)" }}
        >
          Zum Login
          <span className="material-symbols-outlined text-[18px]">
            arrow_forward
          </span>
        </Link>
      </div>
    </div>
  );
}

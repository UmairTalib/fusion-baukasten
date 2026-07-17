"use client";

import { Target, Users, Calendar, ArrowRight, Save, LayoutTemplate } from "lucide-react";
import { useState } from "react";

export function Workspace() {
  const [ziel, setZiel] = useState("");
  
  return (
    <main className="ml-[608px] min-h-screen p-8 lg:p-12">
      {/* Workspace Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-fusion-purple mb-2">
            <LayoutTemplate className="w-4 h-4" />
            <span>Block A: Grundlagen</span>
          </div>
          <h1 className="text-3xl font-extrabold text-fusion-text tracking-tight">
            Zielsetzung & Rahmenbedingen
          </h1>
          <p className="text-fusion-muted mt-2 max-w-2xl">
            Definieren Sie hier die Grundpfeiler Ihres Projekts. Der KI-Assistent links hilft Ihnen dabei, 
            diese Felder interaktiv auszufüllen.
          </p>
        </div>
        
        <div className="flex gap-3">
          <button className="outline-btn flex items-center gap-2 text-sm bg-white shadow-sm">
            <Save className="w-4 h-4" /> Entwurf speichern
          </button>
          <button className="primary-btn flex items-center gap-2 text-sm">
            Weiter zu Block B <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Workspace Grid */}
      <div className="grid xl:grid-cols-2 gap-6">
        
        {/* Card 1: Projektziel */}
        <div className="glass-panel p-6">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-fusion-line">
            <div className="p-2 bg-fusion-purple/10 text-fusion-purple rounded-lg">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold">1. Projektziel</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-fusion-text mb-2">
                Was ist das übergeordnete Ziel?
              </label>
              <textarea 
                className="w-full min-h-[120px] p-4 rounded-xl border border-fusion-line bg-fusion-bg focus:bg-white focus:ring-4 focus:ring-fusion-purple/10 focus:border-fusion-purple/50 transition-all resize-none text-sm leading-relaxed"
                placeholder="z.B. Die Neugestaltung des Marktplatzes unter Einbeziehung der Anwohner..."
                value={ziel}
                onChange={(e) => setZiel(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Card 2: Zielgruppe */}
        <div className="glass-panel p-6">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-fusion-line">
            <div className="p-2 bg-fusion-blue/10 text-fusion-blue rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold">2. Zielgruppen</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-fusion-text mb-2">
                Wer soll beteiligt werden?
              </label>
              <div className="grid grid-cols-2 gap-3">
                {["Anwohner", "Gewerbetreibende", "Jugendliche", "Senioren", "Vereine", "Touristen"].map((grp) => (
                  <label key={grp} className="flex items-center gap-3 p-3 rounded-lg border border-fusion-line hover:border-fusion-blue/30 cursor-pointer transition-colors bg-white">
                    <input type="checkbox" className="w-4 h-4 text-fusion-blue rounded border-fusion-line focus:ring-fusion-blue" />
                    <span className="text-sm font-medium">{grp}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Zeitrahmen */}
        <div className="glass-panel p-6 xl:col-span-2">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-fusion-line">
            <div className="p-2 bg-fusion-amber/10 text-fusion-amber rounded-lg">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold">3. Zeitrahmen & Ressourcen</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-fusion-text mb-2">Startdatum</label>
              <input type="date" className="w-full p-3 rounded-xl border border-fusion-line bg-fusion-bg focus:bg-white focus:ring-4 focus:ring-fusion-amber/10 focus:border-fusion-amber/50 transition-all text-sm" />
            </div>
            <div>
              <label className="block text-sm font-bold text-fusion-text mb-2">Enddatum (Geplant)</label>
              <input type="date" className="w-full p-3 rounded-xl border border-fusion-line bg-fusion-bg focus:bg-white focus:ring-4 focus:ring-fusion-amber/10 focus:border-fusion-amber/50 transition-all text-sm" />
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}

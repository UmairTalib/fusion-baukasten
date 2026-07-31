"use client";

import React from "react";

export default function ActiveProjectsTable() {
  return (
    <div className="bg-surface rounded-lg shadow-sm border border-line p-[18px] transition-transform duration-300 hover:-translate-y-1 w-full" style={{ boxShadow: "0 14px 36px rgba(45, 55, 95, 0.08)" }}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[18px] font-bold text-on-surface">Aktive Projekte</h3>
        <button className="text-primary hover:text-primary-fixed-variant text-[13px] font-medium transition-colors">
          Alle ansehen
        </button>
      </div>
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse min-w-[500px]">
          <thead>
            <tr className="border-b border-line text-on-surface-variant text-[11px] font-extrabold uppercase tracking-wider">
              <th className="pb-3">Projektname</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Fortschritt</th>
              <th className="pb-3">Nächster Schritt</th>
            </tr>
          </thead>
          <tbody className="text-[13px]">
            {/* Row 1 */}
            <tr className="border-b border-line hover:bg-surface-container-low transition-colors">
              <td className="py-4 font-medium text-on-surface">Nachhaltigkeits-Workshop</td>
              <td className="py-4">
                <span className="inline-flex px-2 py-1 bg-surface-container-highest text-primary font-medium rounded text-[11px]">
                  Aktiv
                </span>
              </td>
              <td className="py-4">
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-surface-container h-2 rounded-full overflow-hidden">
                    <div className="bg-primary h-full rounded-full" style={{ width: "75%" }}></div>
                  </div>
                  <span className="text-on-surface-variant">75%</span>
                </div>
              </td>
              <td className="py-4 text-on-surface-variant">Materialien prüfen</td>
            </tr>
            {/* Row 2 */}
            <tr className="border-b border-line hover:bg-surface-container-low transition-colors">
              <td className="py-4 font-medium text-on-surface">Produktlaunch</td>
              <td className="py-4">
                <span className="inline-flex px-2 py-1 bg-surface-container-highest text-primary font-medium rounded text-[11px]">
                  Aktiv
                </span>
              </td>
              <td className="py-4">
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-surface-container h-2 rounded-full overflow-hidden">
                    <div className="bg-[#f0a12a] h-full rounded-full" style={{ width: "40%" }}></div>
                  </div>
                  <span className="text-on-surface-variant">40%</span>
                </div>
              </td>
              <td className="py-4 text-on-surface-variant">Marketing-Plan abstimmen</td>
            </tr>
            {/* Row 3 */}
            <tr className="hover:bg-surface-container-low transition-colors">
              <td className="py-4 font-medium text-on-surface">Kundenfeedback</td>
              <td className="py-4">
                <span className="inline-flex px-2 py-1 bg-surface-container text-on-surface-variant font-medium rounded text-[11px]">
                  Entwurf
                </span>
              </td>
              <td className="py-4">
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-surface-container h-2 rounded-full overflow-hidden">
                    <div className="bg-[#28a86f] h-full rounded-full" style={{ width: "90%" }}></div>
                  </div>
                  <span className="text-on-surface-variant">90%</span>
                </div>
              </td>
              <td className="py-4 text-on-surface-variant">Report generieren</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

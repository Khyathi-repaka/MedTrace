"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function TreatmentsPage() {
  const [treatments, setTreatments] = useState<any[]>([]);
  useEffect(() => { api.treatments().then(setTreatments); }, []);

  return (
    <main className="max-w-5xl mx-auto p-6 md:p-10 fade-up">
      <h1 className="font-display text-3xl mb-1">Treatments</h1>
      <p className="text-ink-muted text-sm mb-8">Medications and treatments recorded from your documents.</p>

      <div className="card !p-0 overflow-hidden">
        {treatments.length === 0 ? (
          <div className="p-10 text-center text-sm text-ink-muted">No treatments recorded yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-border">
                <th className="eyebrow font-normal py-3 px-5">Medication</th>
                <th className="eyebrow font-normal py-3 px-3">Dosage</th>
                <th className="eyebrow font-normal py-3 px-3">Frequency</th>
                <th className="eyebrow font-normal py-3 px-3">Start</th>
                <th className="eyebrow font-normal py-3 px-5">Status</th>
              </tr>
            </thead>
            <tbody>
              {treatments.map((t) => (
                <tr key={t.id} className="border-b border-border last:border-0 hover:bg-bg/60">
                  <td className="py-3 px-5 font-medium">{t.medication || t.treatment_name}</td>
                  <td className="px-3 data-value text-ink-muted">{t.dosage || "—"}</td>
                  <td className="px-3 text-ink-muted">{t.frequency || "—"}</td>
                  <td className="px-3 data-value text-ink-muted">{t.start_date || "—"}</td>
                  <td className="px-5">
                    <span className={`pill ${t.status === "active" ? "bg-status-okSoft text-status-ok" : "bg-bg text-ink-muted"}`}>{t.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}

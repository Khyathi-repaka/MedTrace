"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const TYPE_COLOR: Record<string, string> = {
  diagnosis: "bg-status-danger",
  lab_result: "bg-accent",
  medication: "bg-status-warn",
  treatment: "bg-status-ok",
  finding: "bg-ink-faint",
};

export default function TimelinePage() {
  const [events, setEvents] = useState<any[]>([]);
  useEffect(() => { api.timeline().then(setEvents); }, []);

  return (
    <main className="max-w-3xl mx-auto p-6 md:p-10 fade-up">
      <h1 className="font-display text-3xl mb-1">Timeline</h1>
      <p className="text-ink-muted text-sm mb-8">Every diagnosis, lab result, and medication, in order.</p>

      {events.length === 0 ? (
        <p className="text-sm text-ink-muted card text-center py-10">No timeline events yet — upload and process a document to begin.</p>
      ) : (
        <div className="relative pl-8">
          <div className="absolute left-[7px] top-1 bottom-1 w-4 trace-vertical" aria-hidden="true" />
          <div className="space-y-6">
            {events.map((e) => (
              <div key={e.id} className="relative">
                <div className={`absolute -left-[26px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-bg ${TYPE_COLOR[e.event_type] || "bg-ink-faint"}`} />
                <div className="eyebrow data-value normal-case tracking-normal">{e.event_date} · {e.event_type.replace("_", " ")}</div>
                <div className="font-medium text-[15px] mt-0.5">{e.title}</div>
                {e.description && <div className="text-sm text-ink-muted mt-0.5">{e.description}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}

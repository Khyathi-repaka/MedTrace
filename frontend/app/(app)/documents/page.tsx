"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { Upload, FileText, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { playSuccess, playError } from "@/lib/sound";

const TYPES = [
  { value: "report", label: "Report" },
  { value: "prescription", label: "Prescription" },
  { value: "consultation", label: "Consultation" },
  { value: "discharge_summary", label: "Discharge summary" },
  { value: "scan", label: "Scan report" },
];

const STAGES = [
  "Uploading",
  "Reading document",
  "Extracting information",
  "Updating health history",
  "Indexing for search",
];

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState("report");
  const [stage, setStage] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  function refresh() {
    api.listDocuments().then(setDocuments);
  }
  useEffect(refresh, []);

  async function onUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setError(null);
    setStage(0);
    const form = new FormData();
    form.append("file", file);
    form.append("document_type", docType);
    try {
      setStage(1);
      const doc = await api.uploadDocument(form);
      setStage(2);
      await api.processDocument(doc.id);
      setStage(4);
      playSuccess();
      setTimeout(() => setStage(null), 700);
      setFile(null);
      refresh();
    } catch (err: any) {
      setError(err.message);
      setStage(null);
      playError();
    }
  }

  return (
    <main className="max-w-5xl mx-auto p-6 md:p-10 fade-up">
      <h1 className="font-display text-3xl mb-1">Documents</h1>
      <p className="text-ink-muted text-sm mb-8">Upload a report, prescription, or scan — MedTrace AI reads it and updates your history automatically.</p>

      <form onSubmit={onUpload} className="card mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <label className="flex-1 flex items-center gap-3 border border-dashed border-border rounded-lg px-4 py-3 cursor-pointer hover:border-accent/50 transition-colors">
            <Upload size={16} className="text-ink-faint shrink-0" />
            <span className="text-sm text-ink-muted truncate">
              {file ? file.name : "Choose a PDF, JPG, or PNG"}
            </span>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </label>
          <select className="input md:w-48" value={docType} onChange={(e) => setDocType(e.target.value)}>
            {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <button className="btn-primary whitespace-nowrap" disabled={!file || stage !== null}>
            Upload & process
          </button>
        </div>

        {stage !== null && (
          <div className="mt-4 flex items-center gap-2 text-xs text-ink-muted">
            <Loader2 size={13} className="animate-spin text-accent" />
            {STAGES[Math.min(stage, STAGES.length - 1)]}…
          </div>
        )}
        {error && <p className="text-sm text-status-danger mt-3">{error}</p>}
      </form>

      <div className="card !p-0 overflow-hidden">
        {documents.length === 0 ? (
          <div className="p-10 text-center text-sm text-ink-muted">No documents uploaded yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-border">
                <th className="eyebrow font-normal py-3 px-5">Name</th>
                <th className="eyebrow font-normal py-3 px-3">Type</th>
                <th className="eyebrow font-normal py-3 px-3">Hospital</th>
                <th className="eyebrow font-normal py-3 px-5">Status</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((d, i) => (
                <motion.tr
                  key={d.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.3) }}
                  className="border-b border-border last:border-0 hover:bg-bg/60"
                >
                  <td className="py-3 px-5 flex items-center gap-2">
                    <FileText size={14} className="text-ink-faint shrink-0" />
                    {d.name}
                  </td>
                  <td className="px-3 text-ink-muted capitalize">{d.document_type.replace("_", " ")}</td>
                  <td className="px-3 text-ink-muted">{d.hospital || "—"}</td>
                  <td className="px-5"><StatusPill status={d.processing_status} /></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}

function StatusPill({ status }: { status: string }) {
  if (status === "PROCESSED")
    return <span className="pill bg-status-okSoft text-status-ok inline-flex items-center gap-1"><CheckCircle2 size={11} /> Processed</span>;
  if (status === "FAILED")
    return <span className="pill bg-status-dangerSoft text-status-danger inline-flex items-center gap-1"><XCircle size={11} /> Failed</span>;
  return <span className="pill bg-status-warnSoft text-status-warn">{status.toLowerCase()}</span>;
}

"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { FileText, ArrowUpRight, Sparkles, GitCommitVertical, MessageCircle } from "lucide-react";
import { playNav } from "@/lib/sound";

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [conditions, setConditions] = useState<any[]>([]);
  const [medications, setMedications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.me(), api.listDocuments(), api.conditions(), api.medications()])
      .then(([p, d, c, m]) => { setProfile(p); setDocuments(d); setConditions(c); setMedications(m); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-10 text-ink-muted text-sm">Reading your health story…</div>;
  }

  const activeConditions = conditions.filter((c) => c.status === "active");
  const activeMeds = medications.filter((m: any) => m.status === "active");
  const latestDoc = documents[0];
  const latestDate = latestDoc?.medical_date || latestDoc?.upload_date?.slice(0, 10);

  return (
    <main className="max-w-5xl mx-auto p-6 md:p-10">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="font-display text-3xl mb-1">Hello, {profile?.name?.split(" ")[0]}</h1>
        <p className="text-ink-muted text-sm mb-8">Here's where your health story stands today.</p>
      </motion.div>

      {/* Asymmetric composition: one large featured panel carrying the
          narrative + inline stats, paired with a stacked column of compact
          metadata cards — deliberately not a uniform 4-up grid. */}
      <div className="grid md:grid-cols-3 gap-4 mb-4">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="md:col-span-2"
        >
          {documents.length === 0 ? (
            <div className="card-feature text-center py-14">
              <div className="w-10 h-10 rounded-full bg-accent-soft flex items-center justify-center mx-auto mb-3">
                <FileText size={18} className="text-accent-strong" />
              </div>
              <p className="font-display text-lg mb-1">No medical records yet</p>
              <p className="text-sm text-ink-muted mb-5">Upload your first report to start building your health history.</p>
              <Link href="/documents" className="btn-primary inline-block">Upload a document</Link>
            </div>
          ) : (
            <div className="card-feature h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={14} className="text-gold" />
                  <span className="eyebrow">Health story</span>
                </div>
                <p className="text-xl leading-relaxed font-display">
                  Your records currently contain {conditions.length} tracked condition{conditions.length === 1 ? "" : "s"}
                  {activeMeds.length > 0 && <> and {activeMeds.length} active medication{activeMeds.length === 1 ? "" : "s"}</>},
                  drawn from {documents.length} uploaded document{documents.length === 1 ? "" : "s"}.
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap mt-6">
                <span className="pill bg-status-okSoft text-status-ok">{activeConditions.length} active condition{activeConditions.length === 1 ? "" : "s"}</span>
                <span className="pill bg-accent-soft text-accent-strong">{activeMeds.length} medication{activeMeds.length === 1 ? "" : "s"}</span>
                <span className="text-xs text-ink-faint data-value ml-1">updated {latestDate || "—"}</span>
              </div>
            </div>
          )}
        </motion.div>

        <div className="flex flex-col gap-3">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.12 }}
            className="card-compact"
          >
            <div className="text-2xl font-display">{documents.length}</div>
            <div className="eyebrow mt-1">Medical documents</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.18 }}
            className="card-panel"
          >
            <div className="text-lg data-value">{latestDate || "—"}</div>
            <div className="eyebrow mt-1">Latest record</div>
          </motion.div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mt-4">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="md:col-span-2"
        >
          <Link
            href="/assistant"
            onClick={playNav}
            className="card-feature flex items-center justify-between hover:border-accent/40 hover:-translate-y-0.5 transition-all group h-full"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-accent-soft flex items-center justify-center shrink-0">
                <MessageCircle size={16} className="text-accent-strong" />
              </div>
              <div>
                <div className="font-medium text-sm mb-0.5">Ask the AI assistant</div>
                <div className="text-xs text-ink-muted">Get grounded answers with sources from your own records.</div>
              </div>
            </div>
            <ArrowUpRight size={16} className="text-ink-faint group-hover:text-accent transition-colors shrink-0" />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.06 }}
        >
          <Link
            href="/timeline"
            onClick={playNav}
            className="card-compact flex items-center gap-3 hover:border-accent/40 transition-all group h-full"
          >
            <GitCommitVertical size={16} className="text-ink-faint group-hover:text-accent transition-colors shrink-0" />
            <div className="text-sm font-medium">View timeline</div>
          </Link>
        </motion.div>
      </div>
    </main>
  );
}

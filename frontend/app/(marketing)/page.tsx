"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import { FileText, MessageCircle, GitCommitVertical, Pill, Search, Sparkles, ShieldCheck } from "lucide-react";
import AmbientBackground from "@/components/marketing/AmbientBackground";
import { GradientButton } from "@/components/marketing/GradientButton";
import { GlassCard } from "@/components/marketing/GlassCard";

// Three.js needs the browser — dynamically imported so it never runs during
// `next build`'s server render pass, and doesn't block the initial paint.
const AIOrb = dynamic(() => import("@/components/marketing/AIOrb"), { ssr: false });

const STORY_STEPS = [
  { n: "01", title: "Capture", desc: "Medical reports, prescriptions, and scans — uploaded as-is." },
  { n: "02", title: "Understand", desc: "AI extracts diagnoses, labs, and medications into structured data." },
  { n: "03", title: "Connect", desc: "MedTrace builds one connected, chronological health timeline." },
  { n: "04", title: "Explain", desc: "Ask questions and get grounded answers, sourced from your own records." },
];

const FEATURES = [
  { icon: MessageCircle, title: "AI Medical Assistant", desc: "Ask questions about your health history and get answers grounded in your own uploaded records — with sources, every time.", big: true },
  { icon: FileText, title: "Document Intelligence", desc: "PDF and scan extraction, structured automatically." },
  { icon: GitCommitVertical, title: "Health Timeline", desc: "Every diagnosis, lab, and medication, in order." },
  { icon: Pill, title: "Treatment Tracking", desc: "Medications, dosage, and status, always current." },
  { icon: Search, title: "Medical Search", desc: "Semantic search across your entire history." },
];

export default function LandingPage() {
  return (
    <>
      <AmbientBackground />

      {/* Nav */}
      <header className="relative z-10 max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: "linear-gradient(135deg, #087EA4, #12B8A6)" }}>
            <span className="text-white font-grotesk text-sm font-bold">M</span>
          </div>
          <span className="font-grotesk font-semibold tracking-tight">MedTrace AI</span>
        </div>
        <Link href="/login" className="text-sm text-night-textMuted hover:text-night-text transition-colors">
          Sign in
        </Link>
      </header>

      {/* Hero */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-10 pb-28 grid md:grid-cols-2 gap-10 items-center">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-1.5 text-[11px] tracking-[0.14em] uppercase text-cyan/90 border border-night-border rounded-full px-3 py-1 mb-6">
            <Sparkles size={11} /> AI-powered health intelligence
          </div>
          <h1 className="font-grotesk font-semibold text-[2.75rem] leading-[1.08] md:text-6xl mb-5">
            Turn medical data into <span style={{ background: "linear-gradient(135deg, #67E8F9, #12B8A6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>understandable health intelligence.</span>
          </h1>
          <p className="text-night-textMuted text-base md:text-lg leading-relaxed max-w-lg mb-8">
            MedTrace AI organizes scattered medical records into one structured, searchable history — with an assistant that answers questions grounded in your own documents, never invented.
          </p>
          <div className="flex flex-wrap gap-3">
            <GradientButton href="/register">Explore MedTrace AI</GradientButton>
            <GradientButton href="#how-it-works" variant="secondary">See how it works</GradientButton>
          </div>
          <div className="flex items-center gap-2 mt-8 text-xs text-night-textMuted">
            <ShieldCheck size={13} className="text-teal" />
            For organizing medical records — not a replacement for professional medical advice.
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="h-[320px] md:h-[420px]"
        >
          <AIOrb />
        </motion.div>
      </section>

      {/* Storytelling */}
      <section id="how-it-works" className="relative z-10 max-w-6xl mx-auto px-6 py-24">
        <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="mb-12 text-center">
          <h2 className="font-grotesk font-semibold text-3xl md:text-4xl mb-3">From medical data to meaningful insights.</h2>
          <p className="text-night-textMuted max-w-xl mx-auto">Four steps, fully automated, grounded in what was actually in your documents.</p>
        </motion.div>

        <div className="relative grid md:grid-cols-4 gap-4">
          <div className="hidden md:block absolute top-8 left-[12%] right-[12%] h-px" style={{ background: "linear-gradient(90deg, transparent, #087EA4, #12B8A6, #A78BFA, transparent)" }} />
          {STORY_STEPS.map((s, i) => (
            <motion.div key={s.n} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45, delay: i * 0.1 }}>
              <GlassCard className="p-6 h-full relative">
                <div className="w-4 h-4 rounded-full mb-5 relative z-10" style={{ background: "linear-gradient(135deg, #67E8F9, #12B8A6)" }} />
                <div className="text-xs text-night-textMuted font-mono mb-1">{s.n}</div>
                <div className="font-grotesk font-semibold text-lg mb-2">{s.title}</div>
                <div className="text-sm text-night-textMuted leading-relaxed">{s.desc}</div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Feature showcase — asymmetric */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        <motion.h2 initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-grotesk font-semibold text-3xl mb-8">
          Built for the whole health story.
        </motion.h2>
        <div className="grid md:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className={f.big ? "md:col-span-2 md:row-span-2" : ""}
              >
                <GlassCard strong={f.big} className={`h-full ${f.big ? "p-8" : "p-6"}`}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ background: "linear-gradient(135deg, rgba(103,232,249,0.15), rgba(18,184,166,0.15))" }}>
                    <Icon size={18} className="text-cyan" />
                  </div>
                  <div className={`font-grotesk font-semibold mb-2 ${f.big ? "text-2xl" : "text-base"}`}>{f.title}</div>
                  <div className={`text-night-textMuted leading-relaxed ${f.big ? "text-sm max-w-sm" : "text-sm"}`}>{f.desc}</div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-24">
        <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <GlassCard strong className="p-12 md:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 -z-10" style={{ background: "radial-gradient(circle at 50% 30%, rgba(103,232,249,0.10), transparent 60%)" }} />
            <h2 className="font-grotesk font-semibold text-3xl md:text-4xl mb-4 max-w-xl mx-auto">
              Your health data already contains the story. MedTrace AI helps you understand it.
            </h2>
            <GradientButton href="/register" className="mt-4">Explore MedTrace AI</GradientButton>
          </GlassCard>
        </motion.div>
      </section>

      <footer className="relative z-10 max-w-6xl mx-auto px-6 py-8 text-xs text-night-textMuted border-t border-night-border">
        MedTrace AI helps organize and understand medical records. It does not provide medical diagnosis or replace professional medical advice.
      </footer>
    </>
  );
}

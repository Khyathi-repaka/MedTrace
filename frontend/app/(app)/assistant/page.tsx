"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { Send, Sparkles, Info } from "lucide-react";
import { playClick, playSuccess } from "@/lib/sound";

const SUGGESTIONS = [
  "What conditions have I been diagnosed with?",
  "What was my highest HbA1c?",
  "When did I start Metformin?",
  "What medications have I taken?",
];

export default function AssistantPage() {
  const [messages, setMessages] = useState<{ role: string; content: string; sources?: any[]; isError?: boolean }[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  async function send(text: string) {
    if (!text.trim()) return;
    playClick();
    setMessages((m) => [...m, { role: "user", content: text }]);
    setInput("");
    setLoading(true);
    try {
      const res = await api.chat(text, sessionId);
      setSessionId(res.session_id);
      setMessages((m) => [...m, { role: "assistant", content: res.answer, sources: res.sources }]);
      playSuccess();
    } catch (err: any) {
      const message = err?.message || "Something went wrong. Please try again.";
      setMessages((m) => [...m, { role: "assistant", content: message, isError: true }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-6 md:p-10 flex flex-col h-screen fade-up">
      <div className="shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-accent" />
          <h1 className="font-display text-3xl">History Assistant</h1>
        </div>
        <p className="text-ink-muted text-sm mt-1 mb-4">Ask about your uploaded records — every answer is grounded and sourced.</p>

        <div className="flex items-start gap-2 text-xs text-ink-faint bg-bg border border-border rounded-lg px-3 py-2.5 mb-5">
          <Info size={13} className="shrink-0 mt-0.5" />
          MedTrace AI helps organize and understand medical records. It does not provide medical
          diagnosis or replace professional medical advice.
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => send(s)}
                className="text-xs border border-border rounded-full px-3 py-1.5 text-ink-muted hover:border-accent hover:text-accent transition-colors">
                {s}
              </button>
            ))}
          </div>
        )}

        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
          >
            <div className="max-w-lg">
              <div className={`rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-accent text-white"
                  : m.isError
                  ? "bg-red-50 border border-red-200 text-red-700"
                  : "bg-surface border border-border"
              }`}>
                {m.content}
              </div>
              {m.sources && m.sources.length > 0 && (
                <div className="text-xs text-ink-faint mt-1.5 px-1 data-value">
                  {m.sources.map((s: any) => `${s.document_name} (${s.medical_date || "undated"})`).join(" · ")}
                </div>
              )}
            </div>
          </motion.div>
        ))}
        {loading && <div className="text-sm text-ink-faint">Thinking…</div>}
        <div ref={endRef} />
      </div>

      <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2 mt-4 shrink-0">
        <input className="input" placeholder="Ask about your records…" value={input} onChange={(e) => setInput(e.target.value)} />
        <button className="btn-primary !px-3.5" disabled={loading}><Send size={15} /></button>
      </form>
    </main>
  );
}
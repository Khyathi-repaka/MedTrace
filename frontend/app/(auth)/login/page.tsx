"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { api, setToken } from "@/lib/api";
import { playSuccess, playError } from "@/lib/sound";

export default function LoginPage() {
  const [email, setEmail] = useState("demo@medtrace.ai");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { access_token } = await api.login({ email, password });
      setToken(access_token);
      playSuccess();
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
      playError();
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="flex items-center gap-2 justify-center mb-1">
        <div className="w-8 h-8 rounded-md bg-accent flex items-center justify-center">
          <span className="text-white font-display text-base">M</span>
        </div>
        <span className="font-display text-xl">MedTrace AI</span>
      </div>
      <p className="text-center text-sm text-ink-muted mb-6 font-display italic">
        Every record. One health story.
      </p>

      <div className="card backdrop-blur-sm bg-surface/95">
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="eyebrow block mb-1.5">Email</label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="eyebrow block mb-1.5">Password</label>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <p className="text-sm text-status-danger">{error}</p>}
          <button className="btn-primary w-full mt-1" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <div className="trace-hairline mt-5 mb-3" style={{ opacity: 0.3 }} aria-hidden="true" />
        <p className="text-xs text-ink-faint text-center">
          Demo account — <span className="data-value">demo@medtrace.ai</span> / <span className="data-value">Demo@12345</span>
        </p>
      </div>
      <p className="text-sm text-center mt-4 text-ink-muted">
        No account? <Link href="/register" className="text-accent font-medium">Register</Link>
      </p>
    </motion.div>
  );
}

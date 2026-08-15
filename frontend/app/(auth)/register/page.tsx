"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { api, setToken } from "@/lib/api";
import { playSuccess, playError } from "@/lib/sound";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", gender: "", blood_group: "", allergies: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { access_token } = await api.register(form);
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
      <p className="text-center text-sm text-ink-muted mb-6">Create your health record</p>

      <div className="card backdrop-blur-sm bg-surface/95">
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="eyebrow block mb-1.5">Full name</label>
            <input className="input" required onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="eyebrow block mb-1.5">Email</label>
            <input className="input" type="email" required onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="eyebrow block mb-1.5">Password</label>
            <input className="input" type="password" required placeholder="Min 8 characters"
              onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="eyebrow block mb-1.5">Blood group</label>
              <input className="input" placeholder="O+" onChange={(e) => setForm({ ...form, blood_group: e.target.value })} />
            </div>
            <div>
              <label className="eyebrow block mb-1.5">Allergies</label>
              <input className="input" placeholder="None" onChange={(e) => setForm({ ...form, allergies: e.target.value })} />
            </div>
          </div>
          {error && <p className="text-sm text-status-danger">{error}</p>}
          <button className="btn-primary w-full mt-1" disabled={loading}>
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>
      </div>
      <p className="text-sm text-center mt-4 text-ink-muted">
        Already have an account? <Link href="/login" className="text-accent font-medium">Sign in</Link>
      </p>
    </motion.div>
  );
}

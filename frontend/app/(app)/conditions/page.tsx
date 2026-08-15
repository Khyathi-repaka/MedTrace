"use client";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { Activity, TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

function parseNumeric(result: string): number | null {
  const match = result.match(/-?\d+(\.\d+)?/);
  return match ? parseFloat(match[0]) : null;
}

export default function ConditionsPage() {
  const [conditions, setConditions] = useState<any[]>([]);
  const [labResults, setLabResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.conditions(), api.labResults()])
      .then(([c, l]) => { setConditions(c); setLabResults(l); })
      .finally(() => setLoading(false));
  }, []);

  // Group lab results by test name into chartable series — only tests with
  // 2+ dated, numeric readings actually get a trend line (a single point
  // isn't a trend, and non-numeric results like "Negative" can't be charted).
  const metricSeries = useMemo(() => {
    const groups = new Map<string, { date: string; value: number; unit: string; raw: string }[]>();
    for (const lab of labResults) {
      const value = parseNumeric(lab.result);
      if (value === null || !lab.test_date) continue;
      const key = lab.test_name;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push({ date: lab.test_date, value, unit: lab.unit || "", raw: lab.result });
    }
    return Array.from(groups.entries())
      .map(([name, points]) => ({ name, points: points.sort((a, b) => a.date.localeCompare(b.date)) }))
      .filter((g) => g.points.length >= 2);
  }, [labResults]);

  if (loading) {
    return <div className="p-10 text-ink-muted text-sm">Loading conditions…</div>;
  }

  return (
    <main className="max-w-5xl mx-auto p-6 md:p-10 fade-up">
      <h1 className="font-display text-3xl mb-1">Conditions</h1>
      <p className="text-ink-muted text-sm mb-8">Tracked diagnoses, with the most recent evidence for each.</p>

      {conditions.length === 0 ? (
        <p className="text-sm text-ink-muted card text-center py-10">No conditions tracked yet.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4 mb-10">
          {conditions.map((c) => (
            <div key={c.id} className="card">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <Activity size={15} className="text-accent" />
                  <h2 className="font-display text-lg">{c.name}</h2>
                </div>
                <span className={`pill ${c.status === "active" ? "bg-status-okSoft text-status-ok" : "bg-bg text-ink-muted"}`}>
                  {c.status}
                </span>
              </div>
              <dl className="text-sm space-y-1.5">
                <Row label="Diagnosed" value={c.first_diagnosed || "—"} />
                {c.latest_lab_result && <Row label="Latest" value={c.latest_lab_result} />}
                <Row label="Documents" value={String(c.document_count)} />
              </dl>
            </div>
          ))}
        </div>
      )}

      {metricSeries.length > 0 && (
        <div>
          <h2 className="font-display text-xl mb-1">Health metrics</h2>
          <p className="text-ink-muted text-sm mb-5">Values extracted from your lab reports, charted over time.</p>
          <div className="grid md:grid-cols-2 gap-4">
            {metricSeries.map((series, i) => (
              <MetricChart key={series.name} name={series.name} points={series.points} delay={i * 0.06} />
            ))}
          </div>
        </div>
      )}
    </main>
  );
}

function MetricChart({ name, points, delay }: { name: string; points: any[]; delay: number }) {
  const latest = points[points.length - 1];
  const previous = points[points.length - 2];
  const delta = previous ? latest.value - previous.value : 0;
  const trend = delta > 0.001 ? "up" : delta < -0.001 ? "down" : "flat";

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
      className="card-compact"
    >
      <div className="flex items-start justify-between mb-1">
        <div>
          <div className="text-sm font-medium">{name}</div>
          <div className="data-value text-xl mt-0.5">
            {latest.value}{latest.unit}
          </div>
        </div>
        <div className={`flex items-center gap-1 text-xs pill ${
          trend === "up" ? "bg-status-warnSoft text-status-warn" :
          trend === "down" ? "bg-healing-soft text-healing" : "bg-bg text-ink-muted"
        }`}>
          {trend === "up" && <TrendingUp size={11} />}
          {trend === "down" && <TrendingDown size={11} />}
          {trend === "flat" && <Minus size={11} />}
          {previous && Math.abs(delta).toFixed(1)}
        </div>
      </div>

      <div className="h-24 -ml-2 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={points} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#DCE6EE" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#8FA0AC" }} axisLine={false} tickLine={false} />
            <YAxis hide domain={["auto", "auto"]} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #DCE6EE" }}
              formatter={(value: number) => [`${value}${latest.unit}`, name]}
            />
            <Line type="monotone" dataKey="value" stroke="#1F5275" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="eyebrow mt-1">{points.length} readings · {points[0].date} → {latest.date}</div>
    </motion.div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="data-value">{value}</dd>
    </div>
  );
}

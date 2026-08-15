"use client";
import { useState } from "react";
import { api } from "@/lib/api";
import { Search as SearchIcon } from "lucide-react";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function onSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      setResults(await api.search(query));
      setSearched(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-6 md:p-10 fade-up">
      <h1 className="font-display text-3xl mb-1">Search your history</h1>
      <p className="text-ink-muted text-sm mb-6">Semantic search across everything you've uploaded — not just keyword matching.</p>

      <form onSubmit={onSearch} className="relative mb-6">
        <SearchIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
        <input className="input pl-10 pr-24 py-3" placeholder="What was my highest HbA1c?"
          value={query} onChange={(e) => setQuery(e.target.value)} />
        <button className="btn-primary absolute right-1.5 top-1.5 !py-1.5" disabled={loading}>
          {loading ? "…" : "Search"}
        </button>
      </form>

      <div className="space-y-3">
        {results.map((r, i) => (
          <div key={i} className="card">
            <div className="eyebrow data-value normal-case tracking-normal mb-1.5">
              {r.document_name} · {r.medical_date || "undated"}
            </div>
            <div className="text-sm leading-relaxed">{r.chunk_text}</div>
          </div>
        ))}
        {searched && results.length === 0 && !loading && (
          <p className="text-sm text-ink-muted text-center py-8">No matching records found.</p>
        )}
      </div>
    </main>
  );
}

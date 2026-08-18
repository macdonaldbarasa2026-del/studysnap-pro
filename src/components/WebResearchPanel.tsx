import React, { useEffect, useState } from 'react';
import { Globe2, Search, ExternalLink, Loader2 } from 'lucide-react';
import { auth } from '../lib/firebase';

type SearchSource = { title: string; uri: string };
type SearchResponse = { text?: string; sources?: SearchSource[] };

/**
 * Provider-neutral web research surface.
 *
 * We intentionally do not load browser-specific search-engine scripts here.
 * Those scripts can fail inside PWA/webview environments and can also create
 * layout/scrolling problems on mobile. Search is performed server-side using
 * the authenticated StudySnap AI gateway instead.
 */
export const WebResearchPanel: React.FC<{ query?: string }> = ({ query = '' }) => {
  const [result, setResult] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const runSearch = async (value: string) => {
    const q = value.trim();
    if (!q) return;
    const user = auth.currentUser;
    if (!user) {
      setError('Sign in to use web research.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/gemini/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ query: q }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || `Search failed (${response.status})`);
      setResult({ text: data.text || 'No research summary was returned.', sources: Array.isArray(data.sources) ? data.sources : [] });
    } catch (err: any) {
      setResult(null);
      setError(err?.message || 'Web research is temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!query.trim()) {
      setResult(null);
      setError('');
      return;
    }
    const timer = window.setTimeout(() => void runSearch(query), 500);
    return () => window.clearTimeout(timer);
  }, [query]);

  return (
    <section className="rounded-3xl border border-app-border bg-app-card p-4 sm:p-5 shadow-sm" aria-label="StudySnap web research">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-2xl bg-app-accent/10 text-app-accent flex items-center justify-center shrink-0">
          <Globe2 size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-black text-app-text">Web research</h2>
            <span className="text-[10px] font-black uppercase tracking-wider rounded-full px-2 py-1 bg-app-accent/10 text-app-accent">StudySnap</span>
          </div>
          <p className="text-sm text-app-text-muted mt-1">Search current information without loading a browser-specific search widget.</p>
        </div>
      </div>

      <form className="mt-4 flex gap-2" onSubmit={e => { e.preventDefault(); void runSearch(query); }}>
        <input
          aria-label="Web research query"
          value={query}
          readOnly
          className="min-w-0 flex-1 rounded-2xl border border-app-border bg-app-bg px-4 py-3 text-sm text-app-text outline-none"
          placeholder="Search the web…"
        />
        <button type="submit" className="ss-btn ss-btn-primary ss-btn-icon-label" disabled={loading || !query.trim()}>
          {loading ? <Loader2 size={17} className="animate-spin" /> : <Search size={17} />}
          <span className="hidden sm:inline">Search</span>
        </button>
      </form>

      {loading && <div className="mt-5 text-sm text-app-text-muted">Searching…</div>}
      {error && <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 dark:bg-red-950/20 p-4 text-sm text-red-700 dark:text-red-300">{error}</div>}
      {result?.text && !loading && (
        <div className="mt-5 rounded-2xl border border-app-border bg-app-bg/50 p-4 sm:p-5">
          <p className="text-sm leading-7 whitespace-pre-wrap text-app-text">{result.text}</p>
        </div>
      )}
      {!!result?.sources?.length && (
        <div className="mt-5 space-y-2">
          <h3 className="text-xs font-black uppercase tracking-wider text-app-text-muted">Sources</h3>
          {result.sources.map((source, index) => (
            <a key={`${source.uri}-${index}`} href={source.uri} target="_blank" rel="noopener noreferrer" className="flex min-w-0 items-center gap-3 rounded-2xl border border-app-border bg-app-card px-4 py-3 hover:border-app-accent/40">
              <ExternalLink size={16} className="shrink-0 text-app-accent" />
              <span className="min-w-0 truncate text-sm font-bold text-app-text">{source.title || source.uri}</span>
            </a>
          ))}
        </div>
      )}
    </section>
  );
};

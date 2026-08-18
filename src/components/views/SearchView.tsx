import React, { useState } from 'react';
import { ChevronLeft, Search, Sparkles, FileText, Globe2 } from 'lucide-react';
import { Note } from '../../types';
import { WebResearchPanel } from '../WebResearchPanel';

interface SearchViewProps {
  searchQuery: string;
  searchResults: Note[];
  setView: (view: any) => void;
  onBack?: () => void;
  setSearchQuery: (query: string) => void;
  handleSearch: (query: string) => void;
  handleResearch: (query: string) => void;
  setSelectedNote: (note: Note) => void;
}

export const SearchView: React.FC<SearchViewProps> = ({
  searchQuery, searchResults, setView, onBack, setSearchQuery, handleSearch, handleResearch, setSelectedNote,
}) => {
  const [tab, setTab] = useState<'web' | 'notes'>('web');

  return (
    <div className="min-h-[100dvh] bg-app-bg px-4 sm:px-6 lg:px-8 pt-[calc(1rem+var(--safe-top))] pb-[calc(6rem+var(--safe-bottom))]">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center gap-3 mb-5">
          <button onClick={onBack || (() => setView('home'))} className="w-11 h-11 rounded-2xl border border-app-border bg-app-card text-app-text flex items-center justify-center hover:bg-app-bg" aria-label="Back">
            <ChevronLeft size={22} />
          </button>
          <div className="min-w-0"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-app-text-muted">StudySnap Search</p><h1 className="text-xl sm:text-2xl font-black text-app-text truncate">Find what you need</h1></div>
        </header>

        <div className="rounded-3xl border border-app-border bg-app-card p-2 shadow-sm">
          <div className="flex items-center gap-2 px-3">
            <Search className="text-app-text-muted shrink-0" size={21} />
            <input
              autoFocus
              type="search"
              inputMode="search"
              placeholder={tab === 'web' ? 'Search the web…' : 'Search your notes…'}
              className="min-w-0 flex-1 bg-transparent py-3.5 text-base text-app-text outline-none placeholder:text-app-text-muted"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); if (tab === 'notes') handleSearch(e.target.value); }}
              onKeyDown={e => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  e.preventDefault();
                  if (tab === 'web') handleResearch(searchQuery.trim()); else handleSearch(searchQuery.trim());
                }
              }}
            />
            <button onClick={() => searchQuery.trim() && handleResearch(searchQuery.trim())} className="ss-btn ss-btn-primary hidden sm:flex" title="AI research">
              <Sparkles size={16} /> Research
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <button onClick={() => setTab('web')} className={`ss-btn ${tab === 'web' ? 'ss-btn-selected' : 'ss-btn-secondary'}`}><Globe2 size={15} className="inline mr-2" />Web</button>
          <button onClick={() => setTab('notes')} className={`ss-btn ${tab === 'notes' ? 'ss-btn-selected' : 'ss-btn-secondary'}`}><FileText size={15} className="inline mr-2" />My notes</button>
          <button onClick={() => searchQuery.trim() && handleResearch(searchQuery.trim())} className="ss-btn ss-btn-accent">AI research</button>
        </div>

        <section className="mt-5">
          {tab === 'web' ? (
            <WebResearchPanel query={searchQuery} />
          ) : (
            <div className="space-y-3">
              {searchResults.map(note => (
                <button key={note.id} onClick={() => { setSelectedNote(note); setView('note'); }} className="w-full p-4 rounded-2xl bg-app-card border border-app-border flex items-center gap-4 text-left hover:border-app-accent/40">
                  <div className="w-11 h-11 rounded-xl bg-app-bg flex items-center justify-center text-app-text-muted shrink-0"><FileText size={21} /></div>
                  <div className="min-w-0"><h3 className="font-bold text-app-text truncate">{note.title}</h3><p className="text-sm text-app-text-muted truncate mt-1">{note.content.substring(0, 100)}…</p></div>
                </button>
              ))}
              {searchQuery && searchResults.length === 0 && <div className="rounded-2xl border border-dashed border-app-border p-10 text-center text-app-text-muted">No matching notes.</div>}
              {!searchQuery && <div className="rounded-2xl border border-dashed border-app-border p-10 text-center text-app-text-muted">Search your saved notes by title or content.</div>}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

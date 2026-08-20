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
  const [tab, setTab] = useState<'web' | 'notes'>('notes');

  return (
    <div className="flex flex-col h-screen bg-app-bg">
      <div className="sticky top-0 z-40 bg-app-card pt-[var(--safe-top)]">
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex-1 flex items-center gap-2 bg-app-bg px-3 h-10 rounded-xl border border-app-border focus-within:border-app-accent">
            <Search className="text-app-text-muted shrink-0" size={18} />
            <input
              autoFocus
              type="search"
              inputMode="search"
              placeholder="Search..."
              className="flex-1 bg-transparent text-sm text-app-text outline-none"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); if (tab === 'notes') handleSearch(e.target.value); }}
              onKeyDown={e => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  e.preventDefault();
                  if (tab === 'web') handleResearch(searchQuery.trim()); else handleSearch(searchQuery.trim());
                }
              }}
            />
          </div>
          <button onClick={onBack || (() => setView('home'))} className="text-sm font-bold text-app-text px-2">
            Cancel
          </button>
        </div>

        <div className="flex border-b border-app-border px-4">
          <button 
            onClick={() => setTab('notes')} 
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${tab === 'notes' ? 'border-app-accent text-app-accent' : 'border-transparent text-app-text-muted'}`}
          >
            My Notes
          </button>
          <button 
            onClick={() => setTab('web')} 
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${tab === 'web' ? 'border-app-accent text-app-accent' : 'border-transparent text-app-text-muted'}`}
          >
            Web & AI
          </button>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto pb-[var(--safe-bottom)]">
        {tab === 'web' ? (
          <div className="p-4">
             <WebResearchPanel query={searchQuery} />
          </div>
        ) : (
          <div className="p-4 space-y-3">
             {searchResults.length > 0 ? (
               searchResults.map(note => (
                <button 
                  key={note.id} 
                  onClick={() => { setSelectedNote(note); setView('note'); }} 
                  className="w-full p-4 rounded-xl bg-app-card border border-app-border flex items-center gap-3 text-left active:bg-app-bg"
                >
                  <div className="w-10 h-10 rounded-full bg-app-bg flex items-center justify-center text-app-accent shrink-0">
                    <FileText size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-app-text truncate">{note.title}</h3>
                    <p className="text-xs text-app-text-muted truncate mt-0.5">{note.content.substring(0, 100)}</p>
                  </div>
                </button>
              ))
             ) : (
               <div className="flex flex-col items-center justify-center py-20 text-app-text-muted">
                 <div className="w-16 h-16 rounded-full border-2 border-app-border flex items-center justify-center mb-4">
                    <Search size={32} />
                 </div>
                 <p className="font-bold text-sm">No results found</p>
                 <p className="text-xs">Try searching for something else</p>
               </div>
             )}
          </div>
        )}
      </main>
    </div>
  );
};

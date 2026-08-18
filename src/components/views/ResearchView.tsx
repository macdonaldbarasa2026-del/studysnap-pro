import React from 'react';
import { safeExternalUrl } from '../../lib/safe_url';
import { ChevronLeft, ArrowRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ResearchViewProps {
  researchResult: { text: string; sources: { title: string; url: string }[] } | null;
  previousView: any;
  setView: (view: any) => void;
}

export const ResearchView: React.FC<ResearchViewProps> = ({ researchResult, previousView, setView }) => {
  return (
    <div className="pb-28">
      <div className="px-4 sm:px-6 py-3 bg-app-card sticky top-0 z-10 border-b border-app-border flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => setView(previousView)} className="p-2 -ml-2 text-app-text">
            <ChevronLeft size={28} />
          </button>
          <h1 className="text-xl font-bold text-app-text">Research Deep-Dive</h1>
        </div>
      </div>

      <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-5">
        {researchResult && (
          <>
            <section>
              <h2 className="text-xs font-bold text-app-text-muted uppercase tracking-widest mb-4">AI Research Synthesis</h2>
              <div className="p-4 sm:p-5 rounded-3xl bg-app-card border border-app-border text-app-text leading-relaxed markdown-body">
                <ReactMarkdown>{researchResult.text}</ReactMarkdown>
              </div>
            </section>

            <section>
              <h2 className="text-xs font-bold text-app-text-muted uppercase tracking-widest mb-4">Sources & Further Reading</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {researchResult.sources.map((source, idx) => {
                  const url = safeExternalUrl(source.url);
                  return url ? (
                  <a 
                    key={idx}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 rounded-2xl bg-app-card border border-app-border flex items-center justify-between hover:border-app-accent transition-colors"
                  >
                    <div className="flex-1 overflow-hidden">
                      <h3 className="font-bold text-app-text truncate">{source.title}</h3>
                      <p className="text-app-text-muted text-xs truncate">{source.url}</p>
                    </div>
                    <ArrowRight size={16} className="text-app-text-muted ml-4 flex-shrink-0" />
                  </a>
                  ) : null;
                })}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

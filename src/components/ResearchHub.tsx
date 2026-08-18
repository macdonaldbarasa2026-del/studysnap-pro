import React, { useState, useEffect } from 'react';
import { safeExternalUrl } from '../lib/safe_url';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Microscope, 
  Search, 
  Plus, 
  Users, 
  FileText, 
  Tag, 
  ArrowLeft,
  Share2,
  MessageSquare,
  ExternalLink,
  Filter,
  X,
  Send
} from 'lucide-react';
import { ResearchProject, UserProfile } from '../types';
import { performWebSearch } from '../services/gemini';
import { ToastType } from './Toast';
import { authedFetch } from '../lib/authedFetch';
import { TopicVideoShelf } from './TopicVideoShelf';

interface ResearchHubProps {
  userProfile: UserProfile;
  onBack: () => void;
  addToast: (message: string, type?: ToastType) => void;
}

export const ResearchHub: React.FC<ResearchHubProps> = ({ userProfile, onBack, addToast }) => {
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [webResults, setWebResults] = useState<{text: string; sources: {title: string; url: string}[]} | null>(null);
  const [isSearchingWeb, setIsSearchingWeb] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    summary: '',
    dataset_url: '',
    tags: [] as string[],
  });

  useEffect(() => {
    authedFetch('/api/research')
      .then(res => res.json())
      .then(setProjects);
  }, []);

  const handleCreate = async () => {
    const id = Math.random().toString(36).substr(2, 9);
    const payload = {
      id,
      ...newProject,
      author_id: userProfile.user_name,
      institution_id: userProfile.institution_id || 'global',
      collaborators: [],
      created_at: new Date().toISOString()
    };

    await authedFetch('/api/research', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    setProjects([payload, ...projects]);
    setIsCreating(false);
  };

  const runWebSearch = async () => {
    const query = searchQuery.trim();
    if (!query) return;
    setIsSearchingWeb(true);
    try {
      setWebResults(await performWebSearch(query));
    } catch (error) {
      addToast('Web research search failed. Please try again.', 'error');
    } finally {
      setIsSearchingWeb(false);
    }
  };

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const [activeProject, setActiveProject] = useState<ResearchProject | null>(null);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<any[]>([]);

  const handleJoin = async (projectId: string) => {
    const res = await authedFetch(`/api/research/${projectId}/join`, { method:'POST', headers:{'Content-Type':'application/json'} });
    if (!res.ok) { addToast('Could not join this research project.', 'error'); return; }
    setProjects(prev => prev.map(p => p.id === projectId && !p.collaborators.includes(userProfile.user_name) ? {...p, collaborators:[...p.collaborators, userProfile.user_name]} : p));
    addToast('You joined the research project.', 'success');
  };

  const openDiscussion = async (project: ResearchProject) => {
    setActiveProject(project);
    try { const res = await authedFetch(`/api/research/${project.id}/comments`); const data = await res.json(); setComments(res.ok ? data : []); } catch { setComments([]); }
  };

  const postComment = async () => {
    const text = comment.trim(); if (!text || !activeProject) return;
    const res = await authedFetch(`/api/research/${activeProject.id}/comments`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ text, author_id:userProfile.user_name }) });
    if (!res.ok) { addToast('Comment could not be posted.', 'error'); return; }
    const created = await res.json(); setComments(prev => [...prev, created]); setComment('');
  };

  return (
    <div className="p-6 pb-32 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 -ml-2 text-app-text">
            <ArrowLeft size={28} />
          </button>
          <h1 className="text-3xl font-black text-app-text">Research Hub</h1>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="px-6 py-3 rounded-2xl bg-emerald-600 text-white font-bold flex items-center gap-2 shadow-lg shadow-emerald-100"
        >
          <Plus size={20} />
          Publish Summary
        </button>
      </div>

      <div className="flex gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-app-text-muted" size={20} />
          <input 
            type="text"
            placeholder="Search research, datasets, or tags..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full p-4 pl-12 rounded-2xl bg-app-card border border-app-border outline-none focus:border-emerald-500"
          />
        </div>
        <button onClick={runWebSearch} disabled={!searchQuery.trim() || isSearchingWeb} className="px-5 rounded-2xl bg-emerald-600 text-white font-bold disabled:opacity-40" title="Search the live web">
          {isSearchingWeb ? 'Searching…' : 'Search Web'}
        </button>
        <button onClick={() => setShowFavorites(v => !v)} aria-pressed={showFavorites} aria-label="Filter research" className={`p-4 rounded-2xl border ${showFavorites ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-app-card border-app-border text-app-text-muted'}`}>
          <Filter size={24} />
        </button>
      </div>

      {webResults && (
        <section className="mb-8 p-6 rounded-[32px] bg-app-card border border-app-border space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-app-text">Live web research</h2>
              <button onClick={() => setWebResults(null)} className="text-xs font-bold text-app-text-muted">Clear</button>
            </div>
            <div className="prose prose-sm max-w-none text-app-text">{webResults.text}</div>
            {webResults.sources.length > 0 && (
              <div className="mt-5 space-y-2">
                {webResults.sources.slice(0, 8).map((source, i) => {
                  const url = safeExternalUrl(source.url);
                  return url ? (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block p-3 rounded-xl bg-app-bg hover:border-emerald-500 border border-transparent">
                      {source.title}
                    </a>
                  ) : null;
                })}
              </div>
            )}
          </div>

          {searchQuery && (
            <TopicVideoShelf
              topic={`${searchQuery} academic research conference lecture`}
              category="Research & Science"
            />
          )}
        </section>
      )}

      <div className="space-y-6">
        {filteredProjects.map(project => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 rounded-[40px] bg-app-card border border-app-border shadow-sm"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center font-black text-emerald-600">{project.author_id.slice(0,1).toUpperCase()}</div>
                </div>
                <div>
                  <h4 className="font-bold text-app-text">{project.author_id}</h4>
                  <p className="text-xs text-app-text-muted">Published in {project.institution_id}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => navigator.clipboard?.writeText(project.title)} aria-label="Share research item" className="p-2 rounded-xl bg-app-bg text-app-text-muted hover:text-emerald-600"><Share2 size={18} /></button>
                <button 
                  onClick={() => openDiscussion(project)}
                  className="p-2 rounded-xl bg-app-bg text-app-text-muted hover:text-emerald-600"
                >
                  <MessageSquare size={18} />
                </button>
              </div>
            </div>

            <h3 className="text-2xl font-black text-app-text mb-3">{project.title}</h3>
            <p className="text-app-text-muted mb-6 leading-relaxed">{project.summary}</p>

            <div className="flex flex-wrap gap-2 mb-8">
              {project.tags.map(tag => (
                <span key={tag} className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold flex items-center gap-1">
                  <Tag size={12} />
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-app-border">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-app-text-muted text-sm">
                  <Users size={18} />
                  <span>{project.collaborators.length} Collaborators</span>
                </div>
                {safeExternalUrl(project.dataset_url) && (
                  <a 
                    href={safeExternalUrl(project.dataset_url)!} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-emerald-600 text-sm font-bold"
                  >
                    <ExternalLink size={18} />
                    View Dataset
                  </a>
                )}
              </div>
              <button 
                onClick={() => handleJoin(project.id)}
                className="px-6 py-2 rounded-xl bg-emerald-600 text-white font-bold text-sm"
              >
                Join Research
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {activeProject && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-app-card rounded-[40px] p-8 w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-app-text">Research Discussion</h2>
                <button onClick={() => setActiveProject(null)} className="p-2 text-app-text-muted"><X size={24} /></button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2">
                <div className="p-4 rounded-2xl bg-app-bg border border-app-border">
                  <p className="text-sm font-bold text-indigo-600 mb-1">Dr. Sarah Chen</p>
                  <p className="text-sm text-app-text">This is a fascinating approach. Have you considered the impact of thermal fluctuations on the quantum state?</p>
                </div>
                <div className="p-4 rounded-2xl bg-app-bg border border-app-border">
                  <p className="text-sm font-bold text-emerald-600 mb-1">Prof. James Wilson</p>
                  <p className="text-sm text-app-text">I'd like to propose an improvement to the error correction algorithm mentioned in section 3.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <input 
                  type="text" 
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Add to the discussion..."
                  className="flex-1 p-4 rounded-2xl bg-app-bg border border-app-border outline-none focus:border-emerald-500"
                />
                <button 
                  onClick={postComment}
                  className="p-4 rounded-2xl bg-emerald-600 text-white"
                >
                  <Send size={20} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {isCreating && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-app-card rounded-[40px] p-8 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-black mb-6 text-app-text">Publish Research Summary</h2>
              
              <div className="space-y-6 mb-8">
                <div>
                  <label className="block text-sm font-bold text-app-text-muted mb-2">Project Title</label>
                  <input 
                    type="text"
                    value={newProject.title}
                    onChange={e => setNewProject({ ...newProject, title: e.target.value })}
                    className="w-full p-4 rounded-2xl bg-app-bg border border-app-border outline-none focus:border-emerald-500"
                    placeholder="e.g. Impact of Quantum Computing on Cryptography"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-app-text-muted mb-2">Summary</label>
                  <textarea 
                    rows={4}
                    value={newProject.summary}
                    onChange={e => setNewProject({ ...newProject, summary: e.target.value })}
                    className="w-full p-4 rounded-2xl bg-app-bg border border-app-border outline-none focus:border-emerald-500 resize-none"
                    placeholder="Briefly describe your research findings..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-app-text-muted mb-2">Dataset URL (Optional)</label>
                  <input 
                    type="url"
                    value={newProject.dataset_url}
                    onChange={e => setNewProject({ ...newProject, dataset_url: e.target.value })}
                    className="w-full p-4 rounded-2xl bg-app-bg border border-app-border outline-none focus:border-emerald-500"
                    placeholder="https://github.com/..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-app-text-muted mb-2">Tags (comma separated)</label>
                  <input 
                    type="text"
                    onChange={e => setNewProject({ ...newProject, tags: e.target.value.split(',').map(t => t.trim()) })}
                    className="w-full p-4 rounded-2xl bg-app-bg border border-app-border outline-none focus:border-emerald-500"
                    placeholder="AI, Physics, Medicine"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setIsCreating(false)}
                  className="flex-1 py-4 rounded-2xl bg-app-bg text-app-text font-bold"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreate}
                  className="flex-1 py-4 rounded-2xl bg-emerald-600 text-white font-bold"
                >
                  Publish
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

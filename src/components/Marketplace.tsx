import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  ChevronLeft, 
  Search, 
  Filter, 
  Star, 
  Download, 
  FileText, 
  Layers, 
  BookOpen, 
  Clock, 
  User, 
  Award, 
  TrendingUp, 
  Plus,
  ArrowRight,
  CheckCircle2,
  Zap,
  Tag
} from 'lucide-react';

interface MarketplaceProps {
  userName: string;
  onBack: () => void;
}

interface Resource {
  id: string;
  title: string;
  description: string;
  author: string;
  type: 'notes' | 'flashcards' | 'quiz' | 'guide';
  price: number; // in points
  rating: number;
  downloads: number;
  subject: string;
  is_premium: boolean;
  created_at: string;
}

export const Marketplace: React.FC<MarketplaceProps> = ({ userName, onBack }) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'notes' | 'flashcards' | 'quiz' | 'guide'>('all');
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [status, setStatus] = useState('');
  const [points, setPoints] = useState(1250);

  useEffect(() => {
    setResources([]);
  }, []);

  const filteredResources = resources.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         r.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || r.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="p-6 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Study Marketplace</h1>
            <p className="text-xs text-slate-500">Share and access premium study resources</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsCreating(true)} aria-label="Create marketplace listing" className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors">
            <Plus size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search for notes, flashcards, guides..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border-none rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex flex-wrap gap-2 bg-white p-2 rounded-2xl shadow-sm">
            {(['all', 'notes', 'flashcards', 'quiz', 'guide'] as const).map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all ${selectedType === type ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredResources.map((resource, i) => (
            <motion.div
              key={resource.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100 group hover:border-indigo-200 transition-all hover:shadow-xl hover:shadow-indigo-50"
            >
              <div className="flex items-center justify-between mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${resource.type === 'notes' ? 'bg-indigo-50 text-indigo-600' : resource.type === 'flashcards' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                  {resource.type === 'notes' ? <FileText size={28} /> : resource.type === 'flashcards' ? <Layers size={28} /> : <BookOpen size={28} />}
                </div>
                {resource.is_premium && (
                  <div className="px-3 py-1 bg-amber-500 text-white rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                    <Star size={10} className="fill-current" />
                    Premium
                  </div>
                )}
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">{resource.title}</h3>
              <p className="text-slate-500 text-sm line-clamp-2 mb-6">{resource.description}</p>
              
              <div className="flex items-center gap-4 mb-6 text-xs text-slate-400 font-bold uppercase tracking-wider">
                <span className="flex items-center gap-1">
                  <User size={12} />
                  {resource.author}
                </span>
                <span className="flex items-center gap-1">
                  <Star size={12} className="text-amber-500 fill-current" />
                  {resource.rating}
                </span>
                <span className="flex items-center gap-1">
                  <Download size={12} />
                  {resource.downloads}
                </span>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                <div className="flex items-center gap-1 text-indigo-600 font-bold text-lg">
                  <Zap size={18} className="fill-current" />
                  {resource.price}
                </div>
                <button 
                  onClick={() => setSelectedResource(resource)}
                  className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-indigo-600 transition-all flex items-center gap-2"
                >
                  Access
                  <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      {isCreating && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-[40px] p-8 max-w-lg w-full shadow-2xl">
            <h2 className="text-2xl font-black text-slate-900 mb-2">Create a resource</h2>
            <p className="text-sm text-slate-500 mb-6">Publish a study resource to the marketplace.</p>
            <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.currentTarget); const title = String(fd.get('title') || '').trim(); const description = String(fd.get('description') || '').trim(); if (!title || !description) return; setResources(prev => [{ id: crypto.randomUUID(), title, description, author: userName, type: 'notes', price: 0, rating: 0, downloads: 0, subject: String(fd.get('subject') || 'General'), is_premium: false, created_at: new Date().toISOString() }, ...prev]); setIsCreating(false); }}>
              <div className="space-y-3">
                <input name="title" required placeholder="Resource title" className="w-full p-4 rounded-2xl border border-slate-200" />
                <input name="subject" placeholder="Subject" className="w-full p-4 rounded-2xl border border-slate-200" />
                <textarea name="description" required placeholder="Short description" className="w-full p-4 rounded-2xl border border-slate-200 min-h-28" />
              </div>
              <div className="flex gap-3 mt-6"><button type="button" onClick={() => setIsCreating(false)} className="flex-1 py-3 rounded-2xl bg-slate-100 font-bold">Cancel</button><button type="submit" className="flex-1 py-3 rounded-2xl bg-indigo-600 text-white font-bold">Publish</button></div>
            </form>
          </div>
        </div>
      )}

      {/* Resource Detail Modal */}
      <AnimatePresence>
        {selectedResource && (
          <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[48px] p-10 max-w-2xl w-full shadow-2xl relative overflow-hidden"
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div className={`w-16 h-16 rounded-3xl flex items-center justify-center ${selectedResource.type === 'notes' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'}`}>
                    {selectedResource.type === 'notes' ? <FileText size={32} /> : <Layers size={32} />}
                  </div>
                  <button onClick={() => setSelectedResource(null)} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                    <ChevronLeft size={24} className="rotate-90" />
                  </button>
                </div>

                <h2 className="text-3xl font-bold text-slate-900 mb-4">{selectedResource.title}</h2>
                <p className="text-slate-500 text-lg mb-8 leading-relaxed">{selectedResource.description}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Subject</p>
                    <p className="font-bold text-slate-900">{selectedResource.subject}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Author</p>
                    <p className="font-bold text-slate-900">{selectedResource.author}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Rating</p>
                    <p className="font-bold text-slate-900 flex items-center gap-1">
                      <Star size={14} className="text-amber-500 fill-current" />
                      {selectedResource.rating}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Downloads</p>
                    <p className="font-bold text-slate-900">{selectedResource.downloads}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setSelectedResource(null)}
                    className="flex-1 py-5 bg-slate-100 text-slate-600 rounded-3xl font-bold hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button onClick={() => { if (points < selectedResource.price) { setStatus('Not enough points.'); return; } setPoints(p => p - selectedResource.price); setResources(rs => rs.map(r => r.id === selectedResource.id ? { ...r, downloads: r.downloads + 1 } : r)); setStatus('Resource unlocked successfully.'); }} className="flex-[2] py-5 bg-indigo-600 text-white rounded-3xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-colors flex items-center justify-center gap-3">
                    <Zap size={24} className="fill-current" />
                    {status || `Unlock for ${selectedResource.price} Points`}
                  </button>
                </div>
              </div>
              <div className="absolute -right-24 -bottom-24 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Marketplace;

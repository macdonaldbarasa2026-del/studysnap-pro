import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Users, Zap, ShieldCheck, ArrowRight, Chrome, Apple, Github, Loader2, Mic, Plus, ArrowUp, Sparkles, Book, LayoutDashboard, Phone, Monitor } from 'lucide-react';
import { signInWithGoogle, signInWithApple, signInWithMicrosoft, signInWithGithub, signInAsGuest } from '../lib/firebase';
import PhoneSignInModal from './PhoneSignInModal';
import { hapticClick, hapticSuccess, hapticError } from '../lib/haptics';

interface LoginViewProps { onLoginSuccess: () => void; }
type AuthType = 'google' | 'apple' | 'microsoft' | 'github' | 'guest';

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState<AuthType | null>(null);
  const [phoneOpen, setPhoneOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'dashboard' | 'flashcards'>('dashboard');
  const [previewPrompt, setPreviewPrompt] = useState('A habit tracking study planner that helps me build better routines and stay consistent with my medical school prep.');

  const handleAuth = async (type: AuthType) => {
    if (loading) return;
    hapticClick(); setLoading(type); setErrorMessage(null);
    try {
      let res;
      if (type === 'google') res = await signInWithGoogle();
      else if (type === 'apple') res = await signInWithApple();
      else if (type === 'microsoft') res = await signInWithMicrosoft();
      else if (type === 'github') res = await signInWithGithub();
      else res = await signInAsGuest();
      if (res || type === 'guest') { hapticSuccess(); onLoginSuccess(); }
    } catch (error: any) {
      hapticError();
      const code = error?.code || '';
      if (code === 'auth/popup-blocked') setErrorMessage('Pop-up blocked. Allow pop-ups for StudySnap and try again.');
      else if (code === 'auth/operation-not-allowed') setErrorMessage('This sign-in method is not enabled yet. An administrator must enable it in the authentication console.');
      else if (code === 'auth/account-exists-with-different-credential') setErrorMessage('An account already exists with this email. Sign in with the original method, then link another method from Account settings.');
      else setErrorMessage('Authentication could not be completed. Please try again.');
    } finally { setLoading(null); }
  };

  return (
    <div className="min-h-screen w-full relative overflow-x-hidden bg-[#e0f2fe]">
      <div className="absolute inset-0 pointer-events-none z-0"><div className="absolute inset-0 bg-gradient-to-b from-[#bde0fe] via-[#e0f2fe] to-white" /><div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-white/40 blur-[80px] rounded-full" /><div className="absolute top-[20%] right-[-10%] w-[60%] h-[60%] bg-white/50 blur-[100px] rounded-full" /><div className="absolute bottom-[-10%] left-[20%] w-[70%] h-[50%] bg-white/60 blur-[120px] rounded-full" /></div>
      <div className="max-w-[1400px] mx-auto px-6 py-8 relative z-10 min-h-screen flex flex-col md:flex-row md:items-center gap-12 lg:gap-24">
        <div className="flex-1 md:py-12 mt-4 md:mt-0">
          <div className="flex items-center gap-3 mb-12"><div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/30"><Book size={20} strokeWidth={2.5}/></div><span className="text-2xl font-black text-slate-900 tracking-tight">StudySnap</span></div>
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:.5}}><h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight">Your learning.<br/><span className="text-indigo-600">Already optimized.</span></h1><p className="mt-6 text-lg text-slate-700 max-w-md font-medium leading-relaxed">One secure identity for your notes, study tools, voice tutor and academic workspace.</p></motion.div>
          <div className="mt-12 space-y-8">
            <div className="flex items-start gap-5"><div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0"><Users size={24}/></div><div><h3 className="font-bold text-slate-900 text-[15px]">Your account, your identity</h3><p className="text-sm text-slate-600 mt-1 leading-relaxed max-w-[300px]">Use phone verification or a trusted platform account to keep your StudySnap identity consistent.</p></div></div>
            <div className="flex items-start gap-5"><div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center shrink-0"><Zap size={24}/></div><div><h3 className="font-bold text-slate-900 text-[15px]">Works across devices</h3><p className="text-sm text-slate-600 mt-1 leading-relaxed max-w-[300px]">Sign in on your phone, tablet or computer and continue your workspace.</p></div></div>
            <div className="flex items-start gap-5"><div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0"><ShieldCheck size={24}/></div><div><h3 className="font-bold text-slate-900 text-[15px]">Verified access</h3><p className="text-sm text-slate-600 mt-1 leading-relaxed max-w-[300px]">Provider authentication and SMS verification are handled by the secure identity layer.</p></div></div>
          </div>
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:.5,delay:.2}} className="mt-12 max-w-sm">
            {errorMessage && <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-xs font-bold border border-red-100">{errorMessage}</div>}
            <div className="space-y-3">
              <button onClick={() => handleAuth('guest')} disabled={!!loading} className="w-full py-4 px-6 bg-[#3b2de4] hover:bg-[#2b1dc4] text-white rounded-[20px] font-bold text-lg flex items-center justify-between transition-all group disabled:opacity-70 shadow-xl shadow-[#3b2de4]/20">{loading==='guest'?<span className="flex items-center gap-2"><Loader2 size={20} className="animate-spin"/>Preparing workspace...</span>:<>Start studying for free<ArrowRight size={20}/></>}</button>
              <button onClick={() => { setPhoneOpen(true); setErrorMessage(null); }} disabled={!!loading} className="w-full py-3.5 bg-white border border-slate-200 text-slate-800 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50"><Phone size={18}/> Continue with phone</button>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => handleAuth('google')} disabled={!!loading} className="py-3.5 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50"><Chrome size={18}/> Google</button>
                <button onClick={() => handleAuth('apple')} disabled={!!loading} className="py-3.5 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800"><Apple size={18}/> Apple</button>
                <button onClick={() => handleAuth('microsoft')} disabled={!!loading} className="py-3.5 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50"><Monitor size={18}/> Microsoft</button>
                <button onClick={() => handleAuth('github')} disabled={!!loading} className="py-3.5 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800"><Github size={18}/> GitHub</button>
              </div>
              <p className="text-[11px] text-slate-500 text-center">Choose one identity method. You can link additional methods later from Account settings.</p>
            </div>
          </motion.div>
        </div>
        <motion.div initial={{opacity:0,scale:.95,x:20}} animate={{opacity:1,scale:1,x:0}} transition={{duration:.7,delay:.2}} className="flex-1 hidden md:block"><div className="bg-white rounded-[40px] p-8 shadow-2xl shadow-indigo-900/10 border border-slate-100 max-w-[480px] mx-auto rotate-1 hover:rotate-0 transition-transform duration-500 relative"><div className="text-center mb-8"><h2 className="text-xl font-bold text-slate-900 mb-1">What do you want to learn first,</h2><h2 className="text-xl font-bold text-[#3b2de4]">for your exams?</h2></div><div className="flex p-1 bg-slate-100 rounded-2xl mb-6"><button type="button" onClick={()=>setPreviewMode('dashboard')} className={`flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 ${previewMode==='dashboard'?'bg-white shadow-sm text-slate-900':'text-slate-500'}`}><LayoutDashboard size={16}/> Dashboard</button><button type="button" onClick={()=>setPreviewMode('flashcards')} className={`flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 ${previewMode==='flashcards'?'bg-white shadow-sm text-slate-900':'text-slate-500'}`}><Sparkles size={16}/> Flashcards</button></div><div className="bg-white border-2 border-slate-100 rounded-3xl p-6 shadow-sm mb-6"><textarea aria-label="Example study prompt" value={previewPrompt} onChange={e=>setPreviewPrompt(e.target.value)} className="w-full bg-transparent border-0 outline-none resize-none text-slate-800 text-lg leading-relaxed min-h-[100px]"/><div className="flex items-center justify-between mt-8"><button type="button" onClick={()=>setPreviewPrompt(v=>v+'\n\nAdd a weekly study schedule.')} aria-label="Add study detail" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400"><Plus size={20}/></button><div className="flex items-center gap-3"><button type="button" onClick={()=>setErrorMessage('Voice input is available after sign-in.')} aria-label="Voice input" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400"><Mic size={18}/></button><button type="button" onClick={()=>setErrorMessage(`${previewMode==='dashboard'?'Dashboard':'Flashcards'} workspace ready — sign in to build it.`)} aria-label="Submit study prompt" className="w-10 h-10 rounded-full bg-[#3b2de4] flex items-center justify-center text-white"><ArrowUp size={20}/></button></div></div></div><p className="text-xs font-bold text-slate-400 text-center">Private workspace preview · no demo data is saved</p></div></motion.div>
      </div>
      {phoneOpen && <PhoneSignInModal onClose={()=>setPhoneOpen(false)} onSuccess={()=>{ setPhoneOpen(false); onLoginSuccess(); }} />}
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { safeExternalUrl } from '../lib/safe_url';
import { motion, AnimatePresence } from 'motion/react';
import { School, Building2, GraduationCap, Microscope, Plus, ChevronRight, Users, BookOpen, ArrowLeft, ShieldCheck, ExternalLink, Upload, CreditCard, Clock3 } from 'lucide-react';
import { Institution, InstitutionType } from '../types';
import { auth, storage } from '../lib/firebase';
import { ref, uploadBytes } from 'firebase/storage';
import { authedFetch } from '../lib/authedFetch';

interface InstitutionPortalProps { userName: string; role?: string; onBack: () => void; }

export const InstitutionPortal: React.FC<InstitutionPortalProps> = ({ userName, role, onBack }) => {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [isRegistering, setIsRegistering] = useState(false);
  const [selected, setSelected] = useState<Institution | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [docs, setDocs] = useState<File[]>([]);
  const [form, setForm] = useState({ name:'', type:'university' as InstitutionType, official_website:'', official_portal_url:'', official_email:'', registration_number:'', phone:'', address:'' });
  const canRegisterInstitution = role === 'admin' || role === 'institution_owner';

  const load = async () => { const res = await authedFetch('/api/institutions'); if (res.ok) setInstitutions(await res.json()); };
  useEffect(() => { load().catch(() => setMessage('Verified institution directory is temporarily unavailable.')); }, []);

  const register = async () => {
    if (!auth.currentUser || auth.currentUser.isAnonymous) { setMessage('Sign in with a verified account before registering an institution.'); return; }
    if (docs.length < 1) { setMessage('Upload at least one official registration/authorization document.'); return; }
    setSaving(true); setMessage('');
    try {
      const uid = auth.currentUser.uid;
      const uploaded = [];
      for (const file of docs) {
        const path = `institution-verification/${uid}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g,'_')}`;
        await uploadBytes(ref(storage, path), file, { contentType: file.type });
        uploaded.push({ id: crypto.randomUUID(), name:file.name, storage_path:path, type:file.type, uploaded_at:new Date().toISOString() });
      }
      const res = await authedFetch('/api/institutions', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ ...form, verification_documents: uploaded }) });
      const data = await res.json(); if (!res.ok) throw new Error(data.error || 'Registration failed');
      setMessage('Submitted for strict verification. The institution will not become public until an administrator verifies the documents and official details.');
      setIsRegistering(false); setDocs([]); setForm({ name:'', type:'university', official_website:'', official_portal_url:'', official_email:'', registration_number:'', phone:'', address:'' });
    } catch (e:any) { setMessage(e.message || 'Could not submit verification request.'); } finally { setSaving(false); }
  };

  const icon = (type: InstitutionType) => type === 'primary' ? <School/> : type === 'secondary' ? <Building2/> : type === 'research_center' ? <Microscope/> : <GraduationCap/>;

  return <div className="p-6 pb-32 max-w-5xl mx-auto">
    <div className="flex items-center justify-between mb-8 gap-4"><div className="flex items-center gap-4"><button onClick={onBack} className="p-2 text-app-text"><ArrowLeft/></button><div><h1 className="text-3xl font-black text-app-text">Institutions & Campuses</h1><p className="text-sm text-app-text-muted">One verified space for universities, colleges, technical schools and other learning institutions.</p></div></div>{canRegisterInstitution && <button onClick={()=>setIsRegistering(true)} className="px-5 py-3 rounded-2xl bg-indigo-600 text-white font-bold flex gap-2"><Plus/> Register Institution</button>}</div>
    {message && <div className="mb-6 p-4 rounded-2xl bg-amber-50 text-amber-900 font-medium">{message}</div>}
    <div className="grid md:grid-cols-2 gap-6">{institutions.map(inst=><motion.div key={inst.id} whileHover={{y:-3}} className="p-6 rounded-[32px] bg-app-card border border-app-border shadow-sm"><div className="flex justify-between"><div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">{icon(inst.type)}</div><span className="h-fit px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black flex gap-1"><ShieldCheck size={14}/> VERIFIED</span></div><h3 className="text-xl font-black mt-5 text-app-text">{inst.name}</h3><p className="text-sm text-app-text-muted capitalize">{inst.type.replace('_',' ')}</p><div className="grid grid-cols-2 gap-2 mt-5 text-xs font-bold text-app-text-muted"><span><Users size={14} className="inline mr-1"/> Community</span><span><BookOpen size={14} className="inline mr-1"/> Courses</span></div><div className="mt-6 flex gap-2"><button onClick={()=>setSelected(inst)} className="flex-1 py-3 rounded-xl bg-app-bg font-bold">Open Portal <ChevronRight className="inline" size={16}/></button>{safeExternalUrl(inst.official_website) && <a href={safeExternalUrl(inst.official_website)!} target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-app-bg"><ExternalLink size={18}/></a>}</div></motion.div>)}</div>
    {institutions.length===0 && <div className="py-16 text-center text-app-text-muted">No verified institutions are published yet.</div>}

    <AnimatePresence>{isRegistering && <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-5"><motion.div initial={{scale:.95,opacity:0}} animate={{scale:1,opacity:1}} className="bg-app-card rounded-[36px] p-7 w-full max-w-2xl max-h-[90vh] overflow-y-auto"><h2 className="text-2xl font-black text-app-text">Register an Institution</h2><p className="text-sm text-app-text-muted mt-2 mb-6">Use official details only. The institution stays private until an administrator verifies its evidence.</p><div className="grid sm:grid-cols-2 gap-4">
      {[['name','Institution name'],['registration_number','Official registration number'],['official_email','Official institution email'],['official_website','Official website'],['official_portal_url','Student/official portal URL'],['phone','Institution phone'],['address','Physical address']].map(([key,label]) => <label key={key} className="block"><span className="block text-xs font-black uppercase tracking-wide text-app-text-muted mb-1.5">{label}</span><input required={key==='name' || key==='registration_number'} value={(form as any)[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))} placeholder={label} className="w-full p-4 rounded-2xl bg-app-bg border border-app-border outline-none focus:border-app-accent" /></label>)}
      <label className="block"><span className="block text-xs font-black uppercase tracking-wide text-app-text-muted mb-1.5">Institution type</span><select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value as InstitutionType}))} className="w-full p-4 rounded-2xl bg-app-bg border border-app-border"><option value="primary">Primary School</option><option value="secondary">Secondary School</option><option value="college">College</option><option value="technical_college">Technical College / TVET</option><option value="university">University</option><option value="research_center">Research / Training Center</option></select></label>
    </div><label className="mt-5 block p-5 rounded-2xl border-2 border-dashed border-app-border cursor-pointer"><div className="flex items-center gap-3 font-bold"><Upload/> Upload official documents</div><div className="text-xs text-app-text-muted mt-1">Registration certificate, government authorization or equivalent. Up to 5 PDF/image files, 20MB each.</div><input type="file" multiple accept="application/pdf,image/*" className="hidden" onChange={e=>setDocs(Array.from(e.target.files || []).slice(0,5))}/>{docs.length>0 && <div className="mt-3 text-sm font-bold">{docs.map(d=>d.name).join(', ')}</div>}</label><div className="mt-6 flex gap-3"><button onClick={()=>setIsRegistering(false)} className="flex-1 p-4 rounded-2xl bg-app-bg font-bold">Cancel</button><button disabled={saving} onClick={register} className="flex-1 p-4 rounded-2xl bg-indigo-600 text-white font-bold disabled:opacity-50">{saving?'Uploading & submitting…':'Submit for verification'}</button></div></motion.div></div>}</AnimatePresence>
    {selected && <div className="fixed inset-0 z-[90] bg-black/40 flex items-center justify-center p-5"><div className="bg-app-card rounded-[32px] p-7 w-full max-w-xl"><button onClick={()=>setSelected(null)} className="float-right font-bold">Close</button><h2 className="text-2xl font-black text-app-text">{selected.name}</h2><p className="text-app-text-muted mt-1">Verified portal</p><div className="mt-6 space-y-3">{safeExternalUrl(selected.official_portal_url || selected.official_website) ? <a href={safeExternalUrl(selected.official_portal_url || selected.official_website)!} target="_blank" rel="noopener noreferrer" className="block p-4 rounded-2xl bg-indigo-50 text-indigo-700 font-bold"><ExternalLink className="inline mr-2"/> Official Institution Portal</a> : null}<div className="p-4 rounded-2xl bg-app-bg"><CreditCard className="inline mr-2"/> Payments are only enabled when this institution configures a verified payment provider. StudySnap never marks an external payment as paid without provider confirmation.</div><div className="p-4 rounded-2xl bg-app-bg"><Clock3 className="inline mr-2"/> Student services, results, notices and courses can be added by the institution owner after verification.</div></div></div></div>}
  </div>;
};
export default InstitutionPortal;

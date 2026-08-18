import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Phone, Search, ShieldCheck, X, ArrowRight, Loader2 } from 'lucide-react';
import { RecaptchaVerifier, ConfirmationResult } from 'firebase/auth';
import { auth, signInWithPhone } from '../lib/firebase';

const COUNTRY_CODES: Record<string, string> = {
  KE: '+254', UG: '+256', TZ: '+255', RW: '+250', ET: '+251', NG: '+234', GH: '+233', ZA: '+27',
  US: '+1', CA: '+1', GB: '+44', IE: '+353', AU: '+61', NZ: '+64', IN: '+91', PK: '+92', BD: '+880',
  AE: '+971', SA: '+966', QA: '+974', EG: '+20', DE: '+49', FR: '+33', ES: '+34', IT: '+39',
  NL: '+31', BE: '+32', CH: '+41', SE: '+46', NO: '+47', DK: '+45', FI: '+358', PL: '+48',
  BR: '+55', MX: '+52', AR: '+54', CL: '+56', CO: '+57', JP: '+81', KR: '+82', CN: '+86',
  SG: '+65', MY: '+60', ID: '+62', PH: '+63', TH: '+66', VN: '+84', TR: '+90', IL: '+972',
};

const COUNTRY_NAMES = Object.keys(COUNTRY_CODES).map(code => ({
  code,
  name: new Intl.DisplayNames([navigator.language || 'en'], { type: 'region' }).of(code) || code,
  dial: COUNTRY_CODES[code],
})).sort((a, b) => a.name.localeCompare(b.name));

export default function PhoneSignInModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [country, setCountry] = useState('KE');
  const [phone, setPhone] = useState('');
  const [query, setQuery] = useState('');
  const [code, setCode] = useState('');
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);
  const recaptchaId = 'studysnap-phone-recaptcha';

  useEffect(() => () => { recaptchaRef.current?.clear(); }, []);

  const countries = useMemo(() => {
    const q = query.trim().toLowerCase();
    return COUNTRY_NAMES.filter(c => !q || c.name.toLowerCase().includes(q) || c.code.toLowerCase() === q || c.dial.includes(q));
  }, [query]);

  const sendCode = async () => {
    setError('');
    const local = phone.replace(/\D/g, '');
    if (local.length < 6 || local.length > 14) return setError('Enter a valid phone number.');
    const fullPhone = `${COUNTRY_CODES[country]}${local}`;
    setLoading(true);
    try {
      if (!recaptchaRef.current) {
        recaptchaRef.current = new RecaptchaVerifier(auth, recaptchaId, { size: 'invisible' });
      }
      const result = await signInWithPhone(fullPhone, recaptchaRef.current);
      setConfirmation(result);
    } catch (e: any) {
      recaptchaRef.current?.clear();
      recaptchaRef.current = null;
      setError(e?.code === 'auth/operation-not-allowed' ? 'Phone sign-in is not enabled yet in the authentication console.' : 'Could not send the verification code. Check the number and try again.');
    } finally { setLoading(false); }
  };

  const verifyCode = async () => {
    if (!confirmation || !/^\d{6}$/.test(code.trim())) return setError('Enter the 6-digit verification code.');
    setLoading(true); setError('');
    try { await confirmation.confirm(code.trim()); onSuccess(); }
    catch { setError('The verification code is invalid or expired.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[140] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-3" onClick={onClose}>
      <div className="w-full max-w-md rounded-[2rem] bg-app-card border border-app-border shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-app-border flex items-center justify-between">
          <div><h2 className="text-xl font-black text-app-text">Verify your phone</h2><p className="text-xs text-app-text-muted mt-1">Use your country code and receive a one-time SMS.</p></div>
          <button onClick={onClose} className="w-10 h-10 rounded-xl bg-app-bg flex items-center justify-center"><X size={19}/></button>
        </div>
        <div className="p-5 space-y-4">
          {!confirmation ? <>
            <div className="relative"><Search size={16} className="absolute left-3 top-3.5 text-app-text-muted"/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Find your country" className="w-full h-11 rounded-xl bg-app-bg border border-app-border pl-9 pr-3 text-sm text-app-text outline-none"/></div>
            <select value={country} onChange={e => setCountry(e.target.value)} className="w-full h-12 rounded-2xl bg-app-bg border border-app-border px-4 text-app-text">
              {countries.map(c => <option key={c.code} value={c.code}>{c.name} {c.dial}</option>)}
            </select>
            <div className="flex gap-2">
              <div className="min-w-[86px] h-12 rounded-2xl bg-app-bg border border-app-border flex items-center justify-center font-black text-app-text">{COUNTRY_CODES[country]}</div>
              <input autoFocus inputMode="tel" autoComplete="tel" value={phone} onChange={e => { setPhone(e.target.value); setError(''); }} placeholder="712 345 678" className="flex-1 h-12 rounded-2xl bg-app-bg border border-app-border px-4 text-app-text outline-none" />
            </div>
            <button onClick={sendCode} disabled={loading} className="w-full h-12 rounded-2xl bg-app-accent text-white font-black flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? <Loader2 size={18} className="animate-spin"/> : <Phone size={18}/>} Send verification code
            </button>
          </> : <>
            <div className="p-4 rounded-2xl bg-app-accent/10 border border-app-accent/20 flex gap-3"><ShieldCheck className="text-app-accent shrink-0" size={20}/><div><div className="font-black text-app-text">Code sent</div><div className="text-xs text-app-text-muted mt-1">Enter the 6-digit code from your SMS.</div></div></div>
            <input autoFocus inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={e => { setCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }} placeholder="000000" className="w-full h-14 rounded-2xl bg-app-bg border border-app-border px-4 text-center text-2xl font-black tracking-[0.5em] text-app-text outline-none" />
            <button onClick={verifyCode} disabled={loading} className="w-full h-12 rounded-2xl bg-app-accent text-white font-black flex items-center justify-center gap-2 disabled:opacity-60">{loading ? <Loader2 size={18} className="animate-spin"/> : <ArrowRight size={18}/>} Verify and continue</button>
            <button onClick={() => setConfirmation(null)} className="w-full h-10 text-sm font-bold text-app-text-muted">Use a different number</button>
          </>}
          {error && <p role="alert" className="text-sm font-bold text-rose-600">{error}</p>}
          <div id={recaptchaId} />
          <p className="text-[10px] text-app-text-muted text-center">Your phone number is used for account identity and security. SMS verification may incur carrier charges.</p>
        </div>
      </div>
    </div>
  );
}

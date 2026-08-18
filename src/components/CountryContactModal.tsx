import React, { useMemo, useState } from 'react';
import { Search, X, UserPlus, CheckCircle2 } from 'lucide-react';

const ISO_COUNTRIES = `AF AL DZ AS AD AO AI AQ AG AR AM AW AU AT AZ BS BH BD BB BY BE BZ BJ BM BT BO BQ BA BW BV BR IO BN BG BF BI CV KH CM CA KY CF TD CL CN CX CC CO KM CG CD CK CR CI HR CU CW CY CZ DK DJ DM DO EC EG SV GQ ER EE SZ ET FK FO FJ FI FR GF PF TF GA GM GE DE GH GI GR GL GD GP GU GT GG GN GW GY HT HM VA HN HK HU IS IN ID IR IQ IE IM IL IT JM JP JE JO KZ KE KI KP KR KW KG LA LV LB LS LR LY LI LT LU MO MG MW MY MV ML MT MH MQ MR MU YT MX FM MD MC MN ME MS MA MZ MM NA NR NP NL NC NZ NI NE NG NU NF MK MP NO OM PK PW PS PA PG PY PE PH PN PL PT PR QA RE RO RU RW BL SH KN LC MF PM VC WS SM ST SA SN RS SC SL SG SX SK SI SB SO ZA GS SS ES LK SD SR SJ SE CH SY TW TJ TZ TH TL TG TK TO TT TN TR TM TC TV UG UA AE GB US UM UY UZ VU VE VN VG VI WF EH YE ZM ZW`.split(' ');

function displayCountry(code: string): string {
  try {
    return new Intl.DisplayNames([navigator.language || 'en'], { type: 'region' }).of(code) || code;
  } catch {
    return code;
  }
}

export interface StudySnapContact {
  id: string;
  name: string;
  country: string;
  phone: string;
}

export default function CountryContactModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (contact: StudySnapContact) => void;
}) {
  const [name, setName] = useState('');
  const [country, setCountry] = useState('KE');
  const [phone, setPhone] = useState('');
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');

  const countries = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ISO_COUNTRIES.map(code => ({ code, name: displayCountry(code) }))
      .filter(item => !q || item.name.toLowerCase().includes(q) || item.code.toLowerCase() === q)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [query]);

  const save = () => {
    const cleanName = name.trim().slice(0, 100);
    const digits = phone.replace(/[^0-9+]/g, '');
    if (!cleanName) return setError('Enter the contact name.');
    if (!/^\+[1-9]\d{6,14}$/.test(digits)) return setError('Use international format, for example +254712345678.');
    onSave({ id: crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`, name: cleanName, country, phone: digits });
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/45 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 sm:p-6" onClick={onClose}>
      <div className="w-full max-w-lg max-h-[min(92dvh,720px)] overflow-hidden rounded-[2rem] bg-app-card border border-app-border shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="shrink-0 flex items-center justify-between gap-3 p-4 sm:p-5 border-b border-app-border safe-area-top">
          <div><h2 className="text-lg sm:text-xl font-black text-app-text">Add contact</h2><p className="text-xs text-app-text-muted mt-1">Works with international numbers.</p></div>
          <button onClick={onClose} className="w-11 h-11 rounded-xl hover:bg-app-bg flex items-center justify-center" aria-label="Close"><X size={20}/></button>
        </div>
        <div className="overflow-y-auto p-4 sm:p-5 space-y-4">
          <input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="Contact name" maxLength={100} className="w-full min-h-12 rounded-2xl bg-app-bg border border-app-border px-4 text-app-text outline-none focus:border-app-accent" />
          <div>
            <label className="text-xs font-bold text-app-text-muted">Country</label>
            <div className="relative mt-1"><Search size={16} className="absolute left-3 top-3.5 text-app-text-muted"/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search every country" className="w-full min-h-11 rounded-xl bg-app-bg border border-app-border pl-9 pr-3 text-sm text-app-text outline-none focus:border-app-accent"/></div>
            <select value={country} onChange={e => setCountry(e.target.value)} className="mt-2 w-full min-h-12 rounded-2xl bg-app-bg border border-app-border px-4 text-app-text outline-none focus:border-app-accent" size={Math.min(6, Math.max(3, countries.length))}>
              {countries.map(item => <option key={item.code} value={item.code}>{item.name} ({item.code})</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-app-text-muted">Phone number</label>
            <input inputMode="tel" autoComplete="tel" value={phone} onChange={e => { setPhone(e.target.value); setError(''); }} placeholder="+254 712 345 678" className="mt-1 w-full min-h-12 rounded-2xl bg-app-bg border border-app-border px-4 text-app-text outline-none focus:border-app-accent" />
            <p className="text-[11px] text-app-text-muted mt-1">International E.164 format avoids country-specific ambiguity.</p>
          </div>
          {error && <p role="alert" className="text-sm font-semibold text-rose-600">{error}</p>}
        </div>
        <div className="shrink-0 p-4 sm:p-5 border-t border-app-border safe-area-bottom bg-app-card">
          <button onClick={save} className="w-full min-h-12 rounded-2xl bg-app-accent text-white font-black flex items-center justify-center gap-2"><UserPlus size={18}/> Save contact</button>
          <div className="mt-2 flex items-center justify-center gap-1 text-[10px] text-app-text-muted"><CheckCircle2 size={12}/> Contact is stored locally until sync is available.</div>
        </div>
      </div>
    </div>
  );
}

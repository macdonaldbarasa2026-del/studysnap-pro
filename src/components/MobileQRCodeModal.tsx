import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, X, Copy, Check, Smartphone, ExternalLink, ShieldCheck } from 'lucide-react';
import { useScrollLock } from '../lib/useScrollLock';

interface MobileQRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileQRCodeModal: React.FC<MobileQRCodeModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  useScrollLock(isOpen);
  const getAppUrl = () => {
    if (typeof window !== 'undefined' && window.location.origin && !window.location.origin.includes('localhost:3000')) {
      return window.location.origin;
    }
    return "https://ais-pre-dt2w364rnaz5xlhpcqnkvn-139430688470.europe-west3.run.app";
  };
  const appUrl = getAppUrl();

  const handleCopy = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-sm bg-slate-900 border-2 border-cyan-500/40 rounded-3xl p-6 shadow-2xl text-slate-100 relative overflow-hidden text-center"
        >
          {/* Top glow decoration */}
          <div className="absolute -top-12 -left-12 w-36 h-36 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X size={20} />
          </button>

          {/* Header */}
          <div className="flex flex-col items-center mb-5">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3">
              <Smartphone size={26} />
            </div>
            <h2 className="text-xl font-black text-white tracking-tight uppercase flex items-center gap-2">
              Scan Mobile QR Code
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Point your phone camera at this QR code to test on iOS / Android
            </p>
          </div>

          {/* High-Contrast Scannable QR Code Canvas */}
          <div className="p-5 bg-white rounded-2xl border-4 border-cyan-400 shadow-2xl mx-auto inline-block my-2">
            <QRCodeSVG
              value={appUrl}
              size={220}
              bgColor="#ffffff"
              fgColor="#000000"
              level="H"
              includeMargin={true}
            />
          </div>

          {/* URL & Quick Copy */}
          <div className="mt-4 p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2 text-left">
            <div className="truncate text-[11px] font-mono text-slate-300">
              {appUrl}
            </div>
            <button
              onClick={handleCopy}
              className="p-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 shrink-0 flex items-center gap-1 text-xs font-bold transition-all active:scale-95"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>

          {/* Open in New Tab Button */}
          <a
            href={appUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full mt-3 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs tracking-wider uppercase flex items-center justify-center gap-2"
          >
            <ExternalLink size={16} />
            Open Shared App URL
          </a>

          <div className="mt-4 text-[10px] text-slate-500 uppercase tracking-widest font-extrabold flex items-center justify-center gap-1">
            <ShieldCheck size={12} className="text-cyan-400" />
            Live Cloud Run Mobile Link
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

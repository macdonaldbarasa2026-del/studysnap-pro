import React from 'react';
import { motion } from 'motion/react';
import { Zap, ShieldCheck, Cpu, Activity } from 'lucide-react';

export const NativeBoot: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-[#050200] flex flex-col items-center justify-center z-[9999] font-mono">
      <div className="relative">
        <motion.div
           animate={{ scale: [1, 1.1, 1] }}
           transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
           className="w-24 h-24 bg-app-accent rounded-none flex items-center justify-center shadow-[0_0_50px_rgba(255,69,0,0.3)] border-2 border-white"
        >
          <Zap className="text-black" size={40} />
        </motion.div>
        
        {/* Orbital rings */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute -inset-4 border border-app-accent/40 rounded-none"
        />
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute -inset-8 border border-white/10 rounded-none"
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-12 text-center"
      >
        <h2 className="text-app-accent font-black tracking-[0.2em] uppercase text-xs mb-4 animate-pulse">Initializing Kernel...</h2>
          <div className="flex flex-col items-center gap-3 text-app-text-muted text-[10px] uppercase font-bold tracking-widest">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-app-accent" />
            <span>BIO_SECURE: PASS</span>
          </div>
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-app-accent animate-pulse" />
            <span>GPU_ACCEL: TRUE (HARDWARE)</span>
          </div>
          <div className="flex items-center gap-2">
            <Cpu size={14} className="text-app-accent" />
            <span>KERNEL: 0x8842_C++_STABLE</span>
          </div>
        </div>
      </motion.div>

      {/* Progress bar */}
      <div className="w-64 h-4 border border-app-accent p-1 mt-12 bg-black">
        <motion.div 
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 3, ease: "easeInOut" }}
          className="bg-app-accent h-full shadow-[0_0_15px_rgba(255,69,0,0.5)]"
        />
      </div>
      <div className="mt-4 text-[8px] text-app-text-muted font-bold tracking-widest">
        SYSTEM_READY_V3
      </div>
    </div>
  );
};

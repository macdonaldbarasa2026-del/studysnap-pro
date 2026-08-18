import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Check, Loader2, RotateCcw, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ScannerSubject { id: string; name: string; }

interface ScannerProps {
  onCapture: (base64: string, subjectId?: string) => void;
  onClose: () => void;
  subjects?: ScannerSubject[];
  initialSubjectId?: string;
}

export default function Scanner({ onCapture, onClose, subjects = [], initialSubjectId }: ScannerProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [subjectId, setSubjectId] = useState(initialSubjectId || subjects[0]?.id || '');
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let cancelled = false;
    let activeStream: MediaStream | null = null;
    async function startCamera() {
      setError(null);
      try {
        activeStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode,
            width: { ideal: 1280, max: 1920 },
            height: { ideal: 720, max: 1080 },
            frameRate: { ideal: 24, max: 30 }
          }
        });
        if (cancelled) { activeStream.getTracks().forEach(track => track.stop()); return; }
        setStream(activeStream);
        if (videoRef.current) videoRef.current.srcObject = activeStream;
      } catch (err) {
        const message = err instanceof DOMException && err.name === 'NotAllowedError'
          ? 'Camera permission is required to scan notes.'
          : 'Could not start the camera. Check camera permissions and try again.';
        setError(message);
      }
    }
    if (navigator.mediaDevices?.getUserMedia) startCamera();
    else setError('Camera scanning is not supported on this device/browser.');
    return () => {
      cancelled = true;
      activeStream?.getTracks().forEach(track => track.stop());
      setStream(null);
    };
  }, [facingMode]);
  const toggleCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };


  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);
      const data = canvas.toDataURL('image/jpeg', 0.9);
      setError(null);
      setCapturedImage(data);
    }
  };

  const confirmPhoto = () => {
    if (!capturedImage) return;
    if (!subjectId) {
      setError('Choose a subject before saving this scan.');
      return;
    }
    onCapture(capturedImage, subjectId);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black z-50 flex flex-col"
    >
      <div className="p-4 flex justify-between items-center text-white">
        <button onClick={onClose} className="p-2 rounded-full bg-white/10">
          <X size={24} />
        </button>
        <div className="text-center"><div className="font-semibold">Scan notes</div><div className="text-xs text-white/60">StudySnap will read, summarize and save it</div></div>
        <button onClick={toggleCamera} className="p-2 rounded-full bg-white/10 text-app-accent">
          <RefreshCw size={24} className={facingMode === 'user' ? 'rotate-180' : ''} />
        </button>
      </div>

      <div className="flex-1 relative overflow-hidden bg-black">
        {!capturedImage ? (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover grayscale-[0.2] contrast-125"
            />
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 rounded-full bg-black/50 px-3 py-1 text-xs text-white/80 backdrop-blur">Point your camera at the page</div>
            <div className="absolute inset-0 pointer-events-none">
              {/* Scanning Reticle */}
              <div className="absolute inset-x-12 inset-y-24 border-2 border-app-accent/30 flex items-center justify-center">
                <div className="w-8 h-8 absolute top-0 left-0 border-t-2 border-l-2 border-white" />
                <div className="w-8 h-8 absolute top-0 right-0 border-t-2 border-r-2 border-white" />
                <div className="w-8 h-8 absolute bottom-0 left-0 border-b-2 border-l-2 border-white" />
                <div className="w-8 h-8 absolute bottom-0 right-0 border-b-2 border-r-2 border-white" />
                <motion.div 
                  animate={{ y: ['calc(0% + 1px)', 'calc(100% - 1px)', 'calc(0% + 1px)'] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="w-full h-0.5 bg-white/80 shadow-[0_0_12px_rgba(255,255,255,0.7)]"
                />
              </div>
            </div>
          </>
        ) : (
          <img 
            src={capturedImage} 
            className="w-full h-full object-contain" 
            alt="Captured"
          />
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {capturedImage && (
        <div className="bg-black px-4 pt-3">
          <label className="block text-xs font-semibold text-white/70 mb-1">Save to subject</label>
          <select
            value={subjectId}
            onChange={(e) => { setSubjectId(e.target.value); setError(null); }}
            className="w-full min-h-11 rounded-xl bg-white/10 text-white border border-white/15 px-3 outline-none focus:border-white/40"
          >
            <option value="" className="text-black">Choose a subject</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id} className="text-black">{subject.name}</option>
            ))}
          </select>
          {error && <p className="mt-2 text-xs text-rose-300">{error}</p>}
        </div>
      )}

      <div className="p-6 sm:p-8 flex justify-center items-center gap-6 sm:gap-8 bg-black border-t border-white/10">
        {!capturedImage ? (
          <button 
            onClick={takePhoto}
            className="w-20 h-20 rounded-full bg-app-accent flex flex-col items-center justify-center active:scale-95 transition-transform border-4 border-white shadow-[0_0_20px_rgba(255,69,0,0.5)] group"
          >
            <Camera size={28} className="text-black" />
            <div className="text-[10px] font-black text-black leading-none mt-1">SCAN</div>
          </button>
        ) : (
          <>
            <button 
              onClick={() => setCapturedImage(null)}
              className="w-16 h-16 rounded-full bg-black text-app-accent border-2 border-app-accent flex flex-col items-center justify-center active:scale-95 transition-transform font-mono"
            >
              <RotateCcw size={20} />
              <span className="text-[8px] font-black mt-1">RETAKE</span>
            </button>
            <button 
              onClick={confirmPhoto}
              className="w-24 h-20 rounded-2xl bg-app-accent text-black flex flex-col items-center justify-center active:scale-95 transition-transform font-black shadow-[0_0_30px_rgba(255,69,0,0.6)]"
            >
              <Check size={32} />
              <span className="text-[10px] uppercase tracking-widest mt-1">Generate & Save</span>
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}

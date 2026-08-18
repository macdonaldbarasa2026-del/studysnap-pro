import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';
import pptxgen from 'pptxgenjs';
import * as pdfjsLib from 'pdfjs-dist';
import {
  ArrowLeft, FileDown, FilePlus2, FileText, Highlighter, Loader2, Plus,
  RotateCw, Save, Trash2, Presentation, GripVertical, Copy, ChevronUp,
  ChevronDown, X, Check, Sparkles
} from 'lucide-react';
import { UserProfile } from '../types';
import { SafeStorage } from '../lib/safe_storage';

type StudioMode = 'pdf' | 'ppt';
type PDFTool = 'select' | 'text' | 'highlight';

interface PdfPageState {
  sourceIndex: number;
  rotation: number;
  text: Array<{ id: string; text: string; x: number; y: number; size: number }>;
  highlights: Array<{ id: string; x: number; y: number; width: number; height: number }>;
}

interface SlideState {
  id: string;
  title: string;
  body: string;
  notes: string;
  background: string;
  accent: string;
}

interface FileStudioProps {
  onBack: () => void;
  addToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  userProfile: UserProfile | null;
}

const MAX_PDF_MB = 50;
const MAX_SLIDES = 30;
const DRAFT_KEY = 'studysnap-file-studio-draft';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

function downloadBytes(bytes: Uint8Array, filename: string, type: string) {
  const blob = new Blob([bytes], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const starterSlides = (): SlideState[] => [
  {
    id: uid('slide'),
    title: 'StudySnap Presentation',
    body: 'Start with a clear idea. Add evidence, examples, and a concise conclusion.',
    notes: '',
    background: 'F8FAFC',
    accent: '4F46E5',
  },
];

export const FileStudio: React.FC<FileStudioProps> = ({ onBack, addToast, userProfile }) => {
  const [mode, setMode] = useState<StudioMode>('pdf');
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [pdfName, setPdfName] = useState('document.pdf');
  const [pdfPages, setPdfPages] = useState<PdfPageState[]>([]);
  const [activePdfPage, setActivePdfPage] = useState(0);
  const [pdfTool, setPdfTool] = useState<PDFTool>('select');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfSaving, setPdfSaving] = useState(false);
  const [pdfTextDraft, setPdfTextDraft] = useState('');
  const [showPdfTextEditor, setShowPdfTextEditor] = useState(false);
  const [pptSlides, setPptSlides] = useState<SlideState[]>(starterSlides);
  const [activeSlide, setActiveSlide] = useState(0);
  const [pptSaving, setPptSaving] = useState(false);
  const pdfCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const activePage = pdfPages[activePdfPage];
  const canExport = !userProfile?.parental_lock;

  const persistDraft = useCallback((nextMode: StudioMode, payload: unknown) => {
    void SafeStorage.atomicWrite(DRAFT_KEY, { mode: nextMode, payload, updatedAt: new Date().toISOString() });
  }, []);

  useEffect(() => {
    if (mode === 'ppt') persistDraft('ppt', pptSlides);
  }, [mode, pptSlides, persistDraft]);

  useEffect(() => {
    if (!pdfBytes) return;
    const serializable = pdfPages.map(({ sourceIndex, rotation, text, highlights }) => ({ sourceIndex, rotation, text, highlights }));
    persistDraft('pdf', { name: pdfName, pages: serializable });
  }, [pdfBytes, pdfName, pdfPages, persistDraft]);

  const renderPdfPage = useCallback(async (pageIndex: number) => {
    if (!pdfBytes || !pdfCanvasRef.current || !pdfPages[pageIndex]) return;
    const loadingTask = pdfjsLib.getDocument({ data: pdfBytes.slice() });
    const sourcePdf = await loadingTask.promise;
    const sourcePage = await sourcePdf.getPage(pdfPages[pageIndex].sourceIndex + 1);
    const baseViewport = sourcePage.getViewport({ scale: 1 });
    const maxWidth = Math.min(window.innerWidth - 420, 1000);
    const scale = Math.max(0.8, Math.min(1.8, maxWidth / baseViewport.width));
    const viewport = sourcePage.getViewport({ scale });
    const canvas = pdfCanvasRef.current;
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const context = canvas.getContext('2d');
    if (!context) return;
    await sourcePage.render({ canvas, canvasContext: context, viewport }).promise;
    const current = pdfPages[pageIndex];
    if (current.rotation % 360 !== 0) {
      const rotated = document.createElement('canvas');
      const quarter = Math.abs(current.rotation % 180) === 90;
      rotated.width = quarter ? canvas.height : canvas.width;
      rotated.height = quarter ? canvas.width : canvas.height;
      const rctx = rotated.getContext('2d');
      if (rctx) {
        rctx.translate(rotated.width / 2, rotated.height / 2);
        rctx.rotate((current.rotation * Math.PI) / 180);
        rctx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
        canvas.width = rotated.width;
        canvas.height = rotated.height;
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(rotated, 0, 0);
      }
    }
    sourcePdf.destroy();
  }, [pdfBytes, pdfPages]);

  useEffect(() => {
    if (mode === 'pdf' && pdfBytes && pdfPages.length) {
      setPdfLoading(true);
      renderPdfPage(activePdfPage).catch((error) => {
        console.error(error);
        addToast('Could not render this PDF page.', 'error');
      }).finally(() => setPdfLoading(false));
    }
  }, [mode, pdfBytes, pdfPages, activePdfPage, renderPdfPage, addToast]);

  const openPdf = async (file: File) => {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      addToast('Choose a PDF file.', 'warning');
      return;
    }
    if (file.size > MAX_PDF_MB * 1024 * 1024) {
      addToast(`PDFs must be ${MAX_PDF_MB} MB or smaller.`, 'warning');
      return;
    }
    setPdfLoading(true);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const pdf = await PDFDocument.load(bytes, { ignoreEncryption: false });
      const pages = pdf.getPages().map((_, index) => ({
        sourceIndex: index,
        rotation: 0,
        text: [],
        highlights: [],
      }));
      setPdfBytes(bytes);
      setPdfName(file.name);
      setPdfPages(pages);
      setActivePdfPage(0);
      addToast(`${pages.length} PDF page${pages.length === 1 ? '' : 's'} loaded.`, 'success');
    } catch (error) {
      console.error(error);
      addToast('This PDF could not be opened. It may be encrypted or malformed.', 'error');
    } finally {
      setPdfLoading(false);
    }
  };

  const updateActivePage = (updater: (page: PdfPageState) => PdfPageState) => {
    setPdfPages((pages) => pages.map((page, index) => index === activePdfPage ? updater(page) : page));
  };

  const addPdfText = () => {
    if (!activePage) return;
    setPdfTextDraft('');
    setShowPdfTextEditor(true);
  };

  const confirmPdfText = () => {
    const text = pdfTextDraft.trim();
    if (!text) return;
    updateActivePage((page) => ({
      ...page,
      text: [...page.text, { id: uid('text'), text, x: 0.15, y: 0.18, size: 18 }],
    }));
    setShowPdfTextEditor(false);
  };

  const addPdfHighlight = () => {
    updateActivePage((page) => ({
      ...page,
      highlights: [...page.highlights, { id: uid('highlight'), x: 0.12, y: 0.25, width: 0.55, height: 0.08 }],
    }));
  };

  const rotatePdfPage = () => updateActivePage((page) => ({ ...page, rotation: (page.rotation + 90) % 360 }));

  const deletePdfPage = () => {
    if (!activePage) return;
    if (pdfPages.length === 1) {
      addToast('A PDF must contain at least one page.', 'warning');
      return;
    }
    setPdfPages((pages) => pages.filter((_, index) => index !== activePdfPage));
    setActivePdfPage((index) => Math.min(index, pdfPages.length - 2));
  };

  const movePdfPage = (direction: -1 | 1) => {
    setPdfPages((pages) => {
      const next = [...pages];
      const target = activePdfPage + direction;
      if (target < 0 || target >= next.length) return next;
      [next[activePdfPage], next[target]] = [next[target], next[activePdfPage]];
      setActivePdfPage(target);
      return next;
    });
  };

  const savePdf = async () => {
    if (!pdfBytes || !pdfPages.length || !canExport) return;
    setPdfSaving(true);
    try {
      const source = await PDFDocument.load(pdfBytes);
      const output = await PDFDocument.create();
      const font = await output.embedFont(StandardFonts.Helvetica);
      for (const pageState of pdfPages) {
        const [page] = await output.copyPages(source, [pageState.sourceIndex]);
        page.setRotation(degrees(pageState.rotation));
        for (const highlight of pageState.highlights) {
          const { width, height } = page.getSize();
          page.drawRectangle({
            x: highlight.x * width,
            y: height - (highlight.y + highlight.height) * height,
            width: highlight.width * width,
            height: highlight.height * height,
            color: rgb(1, 0.88, 0.2),
            opacity: 0.35,
            borderOpacity: 0,
          });
        }
        for (const item of pageState.text) {
          const { width, height } = page.getSize();
          page.drawText(item.text, {
            x: item.x * width,
            y: height - item.y * height,
            size: item.size,
            font,
            color: rgb(0.08, 0.1, 0.14),
            maxWidth: Math.max(100, width * 0.7),
          });
        }
        output.addPage(page);
      }
      const bytes = await output.save({ useObjectStreams: true });
      downloadBytes(bytes, pdfName.replace(/\.pdf$/i, '') + '-edited.pdf', 'application/pdf');
      addToast('Edited PDF exported successfully.', 'success');
    } catch (error) {
      console.error(error);
      addToast('PDF export failed. The original file was not changed.', 'error');
    } finally {
      setPdfSaving(false);
    }
  };

  const updateSlide = (index: number, patch: Partial<SlideState>) => {
    setPptSlides((slides) => slides.map((slide, slideIndex) => slideIndex === index ? { ...slide, ...patch } : slide));
  };

  const addSlide = () => {
    if (pptSlides.length >= MAX_SLIDES) {
      addToast(`Presentations are limited to ${MAX_SLIDES} slides in StudySnap for performance.`, 'warning');
      return;
    }
    setPptSlides((slides) => [...slides, {
      id: uid('slide'), title: 'New slide', body: 'Add your content here.', notes: '', background: 'FFFFFF', accent: '4F46E5',
    }]);
    setActiveSlide(pptSlides.length);
  };

  const deleteSlide = () => {
    if (pptSlides.length === 1) return;
    setPptSlides((slides) => slides.filter((_, index) => index !== activeSlide));
    setActiveSlide((index) => Math.min(index, pptSlides.length - 2));
  };

  const duplicateSlide = () => {
    if (pptSlides.length >= MAX_SLIDES) return;
    const copy = { ...pptSlides[activeSlide], id: uid('slide'), title: `${pptSlides[activeSlide].title} — Copy` };
    setPptSlides((slides) => [...slides.slice(0, activeSlide + 1), copy, ...slides.slice(activeSlide + 1)]);
    setActiveSlide(activeSlide + 1);
  };

  const moveSlide = (direction: -1 | 1) => {
    setPptSlides((slides) => {
      const next = [...slides];
      const target = activeSlide + direction;
      if (target < 0 || target >= next.length) return next;
      [next[activeSlide], next[target]] = [next[target], next[activeSlide]];
      setActiveSlide(target);
      return next;
    });
  };

  const exportPpt = async () => {
    if (!canExport || !pptSlides.length) return;
    setPptSaving(true);
    try {
      const pptx = new pptxgen();
      pptx.layout = 'LAYOUT_WIDE';
      pptx.author = 'StudySnap';
      pptx.company = 'StudySnap';
      pptx.subject = 'StudySnap presentation';
      pptx.title = pptSlides[0]?.title || 'StudySnap Presentation';
      pptx.theme = {
        headFontFace: 'Aptos Display',
        bodyFontFace: 'Aptos',
      };
      pptSlides.forEach((slideState, index) => {
        const slide = pptx.addSlide();
        slide.background = { color: slideState.background };
        slide.addShape(pptx.ShapeType.rect, {
          x: 0, y: 0, w: 0.18, h: 7.5, fill: { color: slideState.accent }, line: { color: slideState.accent },
        });
        slide.addText(slideState.title || 'Untitled', {
          x: 0.55, y: 0.65, w: 11.8, h: 0.7, fontFace: 'Aptos Display', fontSize: 28,
          bold: true, color: '172033', margin: 0,
        });
        slide.addText(slideState.body || '', {
          x: 0.62, y: 1.55, w: 11.3, h: 4.7, fontFace: 'Aptos', fontSize: 20,
          color: '334155', breakLine: false, valign: 'top', fit: 'shrink', margin: 0.04,
        });
        slide.addText(`StudySnap • ${index + 1}/${pptSlides.length}`, {
          x: 0.62, y: 6.95, w: 11.4, h: 0.25, fontSize: 9, color: '64748B', margin: 0,
        });
        if (slideState.notes.trim()) slide.addNotes(slideState.notes.trim());
      });
      await pptx.writeFile({ fileName: `${(pptSlides[0]?.title || 'StudySnap Presentation').replace(/[^a-z0-9-_ ]/gi, '').trim() || 'StudySnap-Presentation'}.pptx` });
      addToast('PowerPoint presentation exported successfully.', 'success');
    } catch (error) {
      console.error(error);
      addToast('PowerPoint export failed. Check your browser download permissions.', 'error');
    } finally {
      setPptSaving(false);
    }
  };

  const openPptFile = () => {
    addToast('StudySnap currently edits presentations created in its workspace. Existing PPTX import is intentionally not enabled until full-fidelity import is available.', 'info');
  };

  const pdfPreview = useMemo(() => (
    <div className="relative max-h-[68vh] overflow-auto rounded-2xl bg-slate-900/90 p-4 flex justify-center">
      {pdfLoading && <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 backdrop-blur-sm"><Loader2 className="animate-spin text-white" /></div>}
      <canvas ref={pdfCanvasRef} className="max-w-full h-auto shadow-2xl rounded-sm bg-white" aria-label={`PDF page ${activePdfPage + 1}`} />
      {activePage && (
        <div className="absolute inset-4 pointer-events-none">
          {activePage.text.map((item) => (
            <div key={item.id} className="absolute whitespace-pre-wrap bg-yellow-100/80 text-slate-900 px-1 rounded" style={{ left: `${item.x * 100}%`, top: `${item.y * 100}%`, fontSize: `${Math.max(11, item.size * 0.65)}px` }}>{item.text}</div>
          ))}
          {activePage.highlights.map((item) => (
            <div key={item.id} className="absolute bg-yellow-300/35 border border-yellow-400/50 rounded" style={{ left: `${item.x * 100}%`, top: `${item.y * 100}%`, width: `${item.width * 100}%`, height: `${item.height * 100}%` }} />
          ))}
        </div>
      )}
    </div>
  ), [activePage, activePdfPage, pdfLoading]);

  return (
    <>
    {showPdfTextEditor && (
      <div className="fixed inset-0 z-[100] bg-black/45 backdrop-blur-sm grid place-items-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-app-border bg-app-card p-5 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div><h2 className="font-black text-lg">Add PDF text</h2><p className="text-xs text-app-text-muted mt-1">The text is placed near the top-left of the current page.</p></div>
            <button onClick={() => setShowPdfTextEditor(false)} className="p-2 rounded-lg hover:bg-app-bg" aria-label="Close text editor"><X size={18}/></button>
          </div>
          <textarea autoFocus value={pdfTextDraft} onChange={(e) => setPdfTextDraft(e.target.value)} rows={5} placeholder="Type the text to add…" className="w-full rounded-xl border border-app-border bg-app-bg p-3 text-sm"/>
          <div className="mt-4 flex gap-2 justify-end"><button onClick={() => setShowPdfTextEditor(false)} className="px-4 py-2.5 rounded-xl border border-app-border font-black text-sm">Cancel</button><button onClick={confirmPdfText} className="px-4 py-2.5 rounded-xl bg-app-accent text-white font-black text-sm flex items-center gap-2"><Check size={16}/> Add text</button></div>
        </div>
      </div>
    )}
    <div className="min-h-[100dvh] bg-app-bg text-app-text flex flex-col">
      <header className="sticky top-0 z-30 border-b border-app-border bg-app-card/95 backdrop-blur px-3 sm:px-5 py-3 pt-[calc(0.75rem+var(--safe-top))]">
        <div className="max-w-[1600px] mx-auto flex items-center gap-3">
          <button onClick={onBack} className="p-2.5 rounded-xl hover:bg-app-accent/10" aria-label="Back"><ArrowLeft size={20} /></button>
          <div className="min-w-0 flex-1"><h1 className="font-black text-lg sm:text-xl truncate">Documents</h1><p className="text-xs text-app-text-muted">Edit PDFs and build PowerPoint presentations</p></div>
          <div className="flex rounded-xl border border-app-border p-1 bg-app-bg">
            <button onClick={() => setMode('pdf')} className={`px-3 py-2 rounded-lg text-xs font-black flex items-center gap-2 ${mode === 'pdf' ? 'bg-app-card shadow-sm' : 'text-app-text-muted'}`}><FileText size={16}/> PDF</button>
            <button onClick={() => setMode('ppt')} className={`px-3 py-2 rounded-lg text-xs font-black flex items-center gap-2 ${mode === 'ppt' ? 'bg-app-card shadow-sm' : 'text-app-text-muted'}`}><Presentation size={16}/> PPT</button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1600px] mx-auto p-3 sm:p-5 pb-[calc(1.5rem+var(--safe-bottom))]">
        {mode === 'pdf' ? (
          <div className="grid lg:grid-cols-[260px_minmax(0,1fr)_300px] gap-4 min-h-[calc(100dvh-110px)]">
            <aside className="rounded-2xl border border-app-border bg-app-card p-3 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-3"><div className="font-black text-sm">Pages</div><button onClick={() => fileInputRef.current?.click()} className="p-2 rounded-lg hover:bg-app-accent/10" aria-label="Open PDF"><FilePlus2 size={18}/></button></div>
              <input ref={fileInputRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) void openPdf(file); e.currentTarget.value = ''; }} />
              {!pdfPages.length ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-5"><FileText size={42} className="text-app-text-muted mb-3"/><p className="font-black text-sm">Open a PDF</p><p className="text-xs text-app-text-muted mt-1">Edit page order, rotation, highlights and text.</p><button onClick={() => fileInputRef.current?.click()} className="mt-4 px-4 py-2.5 rounded-xl bg-app-accent text-white text-sm font-black">Choose PDF</button></div>
              ) : (
                <div className="overflow-auto space-y-2 pr-1">
                  {pdfPages.map((page, index) => (
                    <button key={`${page.sourceIndex}-${index}`} onClick={() => setActivePdfPage(index)} className={`w-full flex items-center gap-2 p-2 rounded-xl text-left border ${index === activePdfPage ? 'border-app-accent bg-app-accent/10' : 'border-transparent hover:bg-app-bg'}`}>
                      <GripVertical size={14} className="text-app-text-muted"/><span className="w-7 h-8 rounded-lg bg-app-bg flex items-center justify-center text-[10px] font-black">{index + 1}</span><span className="text-xs font-bold truncate">Page {page.sourceIndex + 1}</span>
                    </button>
                  ))}
                </div>
              )}
            </aside>

            <section className="rounded-2xl border border-app-border bg-app-card p-3 sm:p-4 flex flex-col min-h-0">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <button onClick={addPdfText} disabled={!activePage} className="px-3 py-2 rounded-xl bg-app-bg disabled:opacity-40 text-xs font-black flex items-center gap-2"><FileText size={15}/> Text</button>
                <button onClick={addPdfHighlight} disabled={!activePage} className="px-3 py-2 rounded-xl bg-app-bg disabled:opacity-40 text-xs font-black flex items-center gap-2"><Highlighter size={15}/> Highlight</button>
                <button onClick={rotatePdfPage} disabled={!activePage} className="px-3 py-2 rounded-xl bg-app-bg disabled:opacity-40 text-xs font-black flex items-center gap-2"><RotateCw size={15}/> Rotate</button>
                <button onClick={() => movePdfPage(-1)} disabled={!activePage || activePdfPage === 0} className="px-3 py-2 rounded-xl bg-app-bg disabled:opacity-40 text-xs font-black"><ChevronUp size={15}/></button>
                <button onClick={() => movePdfPage(1)} disabled={!activePage || activePdfPage === pdfPages.length - 1} className="px-3 py-2 rounded-xl bg-app-bg disabled:opacity-40 text-xs font-black"><ChevronDown size={15}/></button>
                <button onClick={deletePdfPage} disabled={!activePage} className="px-3 py-2 rounded-xl bg-red-500/10 text-red-600 disabled:opacity-40 text-xs font-black"><Trash2 size={15}/></button>
                <div className="flex-1" />
                <button onClick={() => fileInputRef.current?.click()} className="px-3 py-2 rounded-xl border border-app-border text-xs font-black">Open PDF</button>
              </div>
              {pdfBytes ? pdfPreview : <div className="flex-1 grid place-items-center rounded-2xl bg-slate-100 dark:bg-slate-900/30 min-h-[60vh]"><div className="text-center p-8"><FileText size={56} className="mx-auto text-app-text-muted mb-4"/><h2 className="text-2xl font-black">PDF Editor</h2><p className="text-sm text-app-text-muted mt-2 max-w-md">Import a PDF to reorder, rotate, annotate, highlight and export a new edited copy.</p><button onClick={() => fileInputRef.current?.click()} className="mt-5 px-5 py-3 rounded-xl bg-app-accent text-white font-black">Open PDF</button></div></div>}
            </section>

            <aside className="rounded-2xl border border-app-border bg-app-card p-4 flex flex-col gap-4">
              <div><p className="text-[10px] font-black uppercase tracking-wider text-app-text-muted">Document</p><h2 className="font-black truncate mt-1">{pdfName}</h2>{pdfBytes && <p className="text-xs text-app-text-muted mt-1">{pdfPages.length} page{pdfPages.length === 1 ? '' : 's'}</p>}</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl bg-app-bg p-3"><div className="font-black">Text</div><div className="text-app-text-muted mt-1">Add labels/notes</div></div>
                <div className="rounded-xl bg-app-bg p-3"><div className="font-black">Highlight</div><div className="text-app-text-muted mt-1">Mark key areas</div></div>
                <div className="rounded-xl bg-app-bg p-3"><div className="font-black">Pages</div><div className="text-app-text-muted mt-1">Reorder/delete</div></div>
                <div className="rounded-xl bg-app-bg p-3"><div className="font-black">Rotate</div><div className="text-app-text-muted mt-1">Fix orientation</div></div>
              </div>
              {!canExport && <div className="p-3 rounded-xl bg-amber-500/10 text-amber-700 text-xs font-bold">Export is disabled while parental lock is active.</div>}
              <button onClick={savePdf} disabled={!pdfBytes || pdfSaving || !canExport} className="mt-auto w-full py-3 rounded-xl bg-app-accent text-white font-black disabled:opacity-40 flex items-center justify-center gap-2"><Save size={17}/>{pdfSaving ? 'Exporting…' : 'Save edited PDF'}</button>
            </aside>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[240px_minmax(0,1fr)_320px] gap-4 min-h-[calc(100dvh-110px)]">
            <aside className="rounded-2xl border border-app-border bg-app-card p-3 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-3"><div className="font-black text-sm">Slides</div><button onClick={addSlide} className="p-2 rounded-lg hover:bg-app-accent/10" aria-label="Add slide"><Plus size={18}/></button></div>
              <div className="overflow-auto space-y-2">
                {pptSlides.map((slide, index) => <button key={slide.id} onClick={() => setActiveSlide(index)} className={`w-full text-left p-2 rounded-xl border ${index === activeSlide ? 'border-app-accent bg-app-accent/10' : 'border-transparent hover:bg-app-bg'}`}><div className="aspect-video rounded-lg flex items-end p-2" style={{backgroundColor:`#${slide.background}`}}><span className="text-[9px] font-black truncate" style={{color:'#172033'}}>{index + 1}. {slide.title}</span></div></button>)}
              </div>
              <div className="mt-auto grid grid-cols-2 gap-2 pt-3"><button onClick={duplicateSlide} className="p-2 rounded-lg bg-app-bg text-xs font-black"><Copy size={14} className="mx-auto"/></button><button onClick={deleteSlide} className="p-2 rounded-lg bg-red-500/10 text-red-600 text-xs font-black"><Trash2 size={14} className="mx-auto"/></button></div>
            </aside>

            <section className="rounded-2xl border border-app-border bg-app-card p-4 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-3"><div><div className="font-black">Slide {activeSlide + 1}</div><div className="text-xs text-app-text-muted">Edit content, style and notes.</div></div><div className="flex gap-2"><button onClick={() => moveSlide(-1)} disabled={activeSlide === 0} className="p-2 rounded-lg bg-app-bg disabled:opacity-40"><ChevronUp size={16}/></button><button onClick={() => moveSlide(1)} disabled={activeSlide === pptSlides.length - 1} className="p-2 rounded-lg bg-app-bg disabled:opacity-40"><ChevronDown size={16}/></button></div></div>
              <div className="flex-1 grid place-items-center bg-slate-100 dark:bg-slate-900/30 rounded-2xl p-5 overflow-auto">
                <div className="w-full max-w-5xl aspect-video rounded-xl shadow-xl p-[6%] flex flex-col justify-between" style={{backgroundColor:`#${pptSlides[activeSlide].background}`}}>
                  <div><div className="w-12 h-1 rounded-full mb-7" style={{backgroundColor:`#${pptSlides[activeSlide].accent}`}}/><h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900">{pptSlides[activeSlide].title}</h2></div>
                  <p className="whitespace-pre-wrap text-lg sm:text-2xl leading-relaxed text-slate-700 max-w-4xl">{pptSlides[activeSlide].body}</p>
                  <div className="text-xs text-slate-500 font-bold">StudySnap • {activeSlide + 1}/{pptSlides.length}</div>
                </div>
              </div>
            </section>

            <aside className="rounded-2xl border border-app-border bg-app-card p-4 overflow-auto">
              <div className="space-y-4">
                <div><label className="text-xs font-black text-app-text-muted">Title</label><input value={pptSlides[activeSlide].title} onChange={(e) => updateSlide(activeSlide, { title: e.target.value })} className="mt-1 w-full rounded-xl border border-app-border bg-app-bg p-3 text-sm font-bold"/></div>
                <div><label className="text-xs font-black text-app-text-muted">Body</label><textarea value={pptSlides[activeSlide].body} onChange={(e) => updateSlide(activeSlide, { body: e.target.value })} rows={8} className="mt-1 w-full rounded-xl border border-app-border bg-app-bg p-3 text-sm leading-relaxed"/></div>
                <div><label className="text-xs font-black text-app-text-muted">Speaker notes</label><textarea value={pptSlides[activeSlide].notes} onChange={(e) => updateSlide(activeSlide, { notes: e.target.value })} rows={5} className="mt-1 w-full rounded-xl border border-app-border bg-app-bg p-3 text-sm"/></div>
                <div className="grid grid-cols-2 gap-3"><div><label className="text-xs font-black text-app-text-muted">Background</label><input type="color" value={`#${pptSlides[activeSlide].background}`} onChange={(e) => updateSlide(activeSlide, { background: e.target.value.slice(1).toUpperCase() })} className="mt-1 w-full h-11 rounded-xl border border-app-border"/></div><div><label className="text-xs font-black text-app-text-muted">Accent</label><input type="color" value={`#${pptSlides[activeSlide].accent}`} onChange={(e) => updateSlide(activeSlide, { accent: e.target.value.slice(1).toUpperCase() })} className="mt-1 w-full h-11 rounded-xl border border-app-border"/></div></div>
                <div className="p-3 rounded-xl bg-app-accent/10 text-xs text-app-text-muted flex gap-2"><Sparkles size={15} className="text-app-accent shrink-0"/><span>Slides autosave as a local StudySnap draft while you work.</span></div>
                {!canExport && <div className="p-3 rounded-xl bg-amber-500/10 text-amber-700 text-xs font-bold">Export is disabled while parental lock is active.</div>}
                <button onClick={openPptFile} className="w-full py-2.5 rounded-xl border border-app-border font-black text-sm flex items-center justify-center gap-2"><FilePlus2 size={16}/> Open PPTX</button>
                <button onClick={exportPpt} disabled={pptSaving || !canExport} className="w-full py-3 rounded-xl bg-app-accent text-white font-black disabled:opacity-40 flex items-center justify-center gap-2"><FileDown size={17}/>{pptSaving ? 'Exporting…' : 'Export PowerPoint'}</button>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
    </>
  );
};

export default FileStudio;

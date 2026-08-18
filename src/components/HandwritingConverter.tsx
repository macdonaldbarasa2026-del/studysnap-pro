import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Download, 
  Type, 
  Settings, 
  ChevronLeft, 
  Upload, 
  Loader2, 
  CheckCircle2,
  Palette,
  AlignLeft,
  RotateCcw
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { ToastType } from './Toast';
import { downloadPdf } from '../utils/pdfExport';

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface HandwritingConverterProps {
  onBack: () => void;
  addToast: (message: string, type?: ToastType) => void;
}

type HandwritingFont = 'font-handwriting' | 'font-handwriting-script' | 'font-handwriting-indie' | 'font-handwriting-shadows';

export const HandwritingConverter: React.FC<HandwritingConverterProps> = ({ onBack, addToast }) => {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [fontSize, setFontSize] = useState(20);
  const [fontColor, setFontColor] = useState('#2563eb'); // Blue pen color
  const [selectedFont, setSelectedFont] = useState<HandwritingFont>('font-handwriting');
  const [paperType, setPaperType] = useState<'plain' | 'lined' | 'grid'>('lined');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const extractTextFromPDF = async (file: File) => {
    setIsProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n\n';
      }
      
      setText(fullText);
      addToast('Text extracted successfully!', 'success');
    } catch (error) {
      console.error('Error extracting text:', error);
      addToast('Failed to extract text from PDF. Please try another file.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      extractTextFromPDF(selectedFile);
    } else {
      addToast('Please select a valid PDF file.', 'warning');
    }
  };

  const handleDownload = () => {
    if (!text.trim()) return;
    downloadPdf({
      title: file?.name ? file.name.replace(/\.pdf$/i, '') : 'StudySnap Converted Notes',
      subtitle: 'Text extracted from the uploaded PDF',
      sections: [{ heading: 'Converted Notes', body: text }]
    }, `StudySnap-Converted-${new Date().toISOString().slice(0, 10)}`);
  };

  return (
    <div className="min-h-screen bg-app-bg p-6 pb-24">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="p-3 rounded-2xl bg-app-card text-app-text shadow-sm hover:scale-105 transition-transform"
            >
              <ChevronLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-app-text">Handwriting Converter</h1>
              <p className="text-app-text-muted">Convert digital PDFs to hand-written notes</p>
            </div>
          </div>
          
          {text && (
            <button 
              onClick={handleDownload}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors"
            >
              <Download size={20} />
              Export Notes
            </button>
          )}
        </div>

        {!text && !isProcessing ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-app-card rounded-[40px] p-12 border-4 border-dashed border-app-border flex flex-col items-center justify-center text-center gap-6"
          >
            <div className="w-24 h-24 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Upload size={48} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-app-text mb-2">Upload your PDF</h2>
              <p className="text-app-text-muted max-w-sm">
                We'll extract the text and convert it into a beautiful hand-written style for your study notes.
              </p>
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-200 hover:scale-105 transition-transform"
            >
              Select PDF File
            </button>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf"
              className="hidden"
            />
          </motion.div>
        ) : isProcessing ? (
          <div className="bg-app-card rounded-[40px] p-20 flex flex-col items-center justify-center text-center gap-6">
            <Loader2 size={64} className="text-indigo-600 animate-spin" />
            <div>
              <h2 className="text-2xl font-bold text-app-text mb-2">Processing PDF...</h2>
              <p className="text-app-text-muted">Extracting text and generating handwriting style</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Controls */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-app-card rounded-3xl p-6 shadow-sm border border-app-border">
                <h3 className="font-bold text-app-text mb-4 flex items-center gap-2">
                  <Palette size={18} /> Style Settings
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-app-text-muted uppercase mb-2 block">Handwriting Style</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['font-handwriting', 'font-handwriting-script', 'font-handwriting-indie', 'font-handwriting-shadows'] as HandwritingFont[]).map(f => (
                        <button
                          key={f}
                          onClick={() => setSelectedFont(f)}
                          className={`p-3 rounded-xl border-2 transition-all ${selectedFont === f ? 'border-indigo-600 bg-indigo-50' : 'border-app-border'}`}
                        >
                          <span className={`${f} text-lg`}>Abc</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-app-text-muted uppercase mb-2 block">Ink Color</label>
                    <div className="flex gap-2">
                      {['#171717', '#2563eb', '#dc2626', '#16a34a'].map(c => (
                        <button
                          key={c}
                          onClick={() => setFontColor(c)}
                          className={`w-8 h-8 rounded-full border-2 ${fontColor === c ? 'border-indigo-600 scale-110' : 'border-transparent'}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-app-text-muted uppercase mb-2 block">Font Size: {fontSize}px</label>
                    <input 
                      type="range" 
                      min="12" 
                      max="48" 
                      value={fontSize}
                      onChange={e => setFontSize(parseInt(e.target.value))}
                      className="w-full accent-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-app-text-muted uppercase mb-2 block">Paper Type</label>
                    <div className="flex gap-2">
                      {(['plain', 'lined', 'grid'] as const).map(p => (
                        <button
                          key={p}
                          onClick={() => setPaperType(p)}
                          className={`flex-1 py-2 rounded-xl border-2 text-xs font-bold capitalize transition-all ${paperType === p ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-app-border text-app-text-muted'}`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => { setText(''); setFile(null); }}
                className="w-full p-4 rounded-2xl bg-app-card text-rose-500 font-bold flex items-center justify-center gap-2 border border-rose-100"
              >
                <RotateCcw size={18} /> Start Over
              </button>
            </div>

            {/* Preview */}
            <div className="lg:col-span-3">
              <div 
                className={`w-full min-h-[800px] bg-white rounded-3xl shadow-xl p-12 overflow-hidden relative ${
                  paperType === 'lined' ? 'bg-[linear-gradient(#e5e7eb_1px,transparent_1px)] bg-[length:100%_2rem]' :
                  paperType === 'grid' ? 'bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-[length:20px_20px]' : ''
                }`}
                style={{ 
                  color: fontColor,
                  fontSize: `${fontSize}px`,
                  lineHeight: paperType === 'lined' ? '2rem' : '1.5',
                }}
              >
                {/* Margin line for lined paper */}
                {paperType === 'lined' && (
                  <div className="absolute left-16 top-0 bottom-0 w-[2px] bg-rose-200" />
                )}
                
                <div className={`${selectedFont} whitespace-pre-wrap ${paperType === 'lined' ? 'pl-12' : ''}`}>
                  {text}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

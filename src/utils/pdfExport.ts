export interface PdfDocument {
  title: string;
  subtitle?: string;
  sections: Array<{ heading?: string; body: string }>;
}

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 54;
const LINE_HEIGHT = 15;
const MAX_CHARS = 88;

const sanitize = (value: string) => String(value ?? '')
  .replace(/[\x09\x0A\x0D\x20-\x7E]/g, c => c)
  .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, '?')
  .replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

const wrap = (value: string, max = MAX_CHARS): string[] => {
  const output: string[] = [];
  for (const paragraph of String(value ?? '').replace(/\r/g, '').split('\n')) {
    if (!paragraph.trim()) { output.push(''); continue; }
    let line = '';
    for (const word of paragraph.split(/\s+/)) {
      if (!line) line = word;
      else if ((line + ' ' + word).length <= max) line += ' ' + word;
      else { output.push(line); line = word; }
    }
    if (line) output.push(line);
  }
  return output;
};

const buildPage = (title: string, lines: string[], pageNumber: number) => {
  const commands: string[] = ['BT'];
  commands.push('/F2 18 Tf', `${MARGIN} ${PAGE_HEIGHT - MARGIN} Td`, `(${sanitize(title)}) Tj`);
  commands.push('/F1 9 Tf', '0 -18 Td', `(StudySnap - Page ${pageNumber}) Tj`, '/F1 10 Tf', '0 -24 Td');
  for (const line of lines) { commands.push(`(${sanitize(line)}) Tj`, `0 -${LINE_HEIGHT} Td`); }
  commands.push('ET');
  return commands.join('\n');
};

export const downloadPdf = (docData: PdfDocument, filename: string) => {
  const pages: string[][] = [];
  let current: string[] = [];
  const maxLines = Math.floor((PAGE_HEIGHT - MARGIN * 2 - 72) / LINE_HEIGHT);
  const addLine = (line: string) => { if (current.length >= maxLines) { pages.push(current); current = []; } current.push(line); };

  if (docData.subtitle) { wrap(docData.subtitle).forEach(addLine); addLine(''); }
  for (const section of docData.sections) {
    if (section.heading) { addLine(''); addLine(section.heading.toUpperCase()); }
    wrap(section.body).forEach(addLine); addLine('');
  }
  if (current.length) pages.push(current);
  if (!pages.length) pages.push(['No content available.']);

  const objects: string[] = [];
  const addObject = (body: string) => { objects.push(body); return objects.length; };
  const catalogId = addObject('');
  const pagesId = addObject('');
  const fontId = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  const boldFontId = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');
  const pageIds: number[] = [];

  pages.forEach((lines, index) => {
    const content = buildPage(docData.title, lines, index + 1);
    const contentId = addObject(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
    pageIds.push(addObject(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 ${fontId} 0 R /F2 ${boldFontId} 0 R >> >> /Contents ${contentId} 0 R >>`));
  });
  objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageIds.map(id => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`;
  objects[catalogId - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;

  let pdf = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';
  const offsets: number[] = [0];
  objects.forEach((object, index) => { offsets[index + 1] = pdf.length; pdf += `${index + 1} 0 obj\n${object}\nendobj\n`; });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i++) pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xref}\n%%EOF`;

  const url = URL.createObjectURL(new Blob([pdf], { type: 'application/pdf' }));
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  document.body.appendChild(anchor); anchor.click(); anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/**
 * Builds a minimal, valid PDF as a Buffer from a list of text lines.
 * No external dependency. Hand-composed with correct xref byte offsets.
 */
const escapePdfText = (s: string): string =>
    s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

const wrapLine = (line: string, maxChars: number): string[] => {
    if (line.length <= maxChars) return [line];
    const words = line.split(' ');
    const out: string[] = [];
    let cur = '';
    for (const w of words) {
        if ((cur + ' ' + w).trim().length > maxChars) {
            if (cur) out.push(cur);
            cur = w;
        } else {
            cur = cur ? cur + ' ' + w : w;
        }
    }
    if (cur) out.push(cur);
    return out;
};

export function buildReadmePdf(title: string, bodyLines: string[]): Buffer {
    const maxChars = 78;
    const wrapped: string[] = [title, ''];
    for (const l of bodyLines) {
        if (l === '') wrapped.push('');
        else for (const w of wrapLine(l, maxChars)) wrapped.push(w);
    }

    const topY = 760;
    const lineHeight = 16;

    const contentCommands = wrapped
        .map((line, i) => {
            const y = topY - i * lineHeight;
            const size = i === 0 ? 18 : 11;
            return `BT /F1 ${size} Tf 50 ${y} Td (${escapePdfText(line)}) Tj ET`;
        })
        .join('\n');

    const stream = contentCommands;
    const streamLength = Buffer.byteLength(stream, 'utf8');

    const objects: string[] = [];
    objects[1] = '<< /Type /Catalog /Pages 2 0 R >>';
    objects[2] = '<< /Type /Pages /Kids [3 0 R] /Count 1 >>';
    objects[3] =
        '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] ' +
        '/Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>';
    objects[4] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>';
    objects[5] = `<< /Length ${streamLength} >>\nstream\n${stream}\nendstream`;

    let pdf = '%PDF-1.4\n%\u00E2\u00E3\u00CF\u00D3\n';
    const offsets: number[] = [0];
    for (let i = 1; i <= 5; i++) {
        offsets[i] = Buffer.byteLength(pdf, 'utf8');
        pdf += `${i} 0 obj\n${objects[i]}\nendobj\n`;
    }

    const xrefOffset = Buffer.byteLength(pdf, 'utf8');
    pdf += 'xref\n0 6\n0000000000 65535 f \n';
    for (let i = 1; i <= 5; i++) {
        pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
    }
    pdf += `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

    return Buffer.from(pdf, 'utf8');
}

export const TAB_README_BODY: Record<string, string[]> = {
    Studies: [
        'Welcome to your Studies vault.',
        '',
        'Use this tab to organize everything related to your academic life.',
        '',
        'How to use:',
        '- Click the "New Entry" button in the sidebar to create a new folder',
        '  inside the currently open location.',
        '- Click the + button next to a folder to create a nested folder inside it.',
        '- Drag & drop files, or use the upload button, to add PDFs, images,',
        '  lecture slides, handwritten scans, or any study material.',
        '',
        'Suggested contents:',
        '- Subject folders (e.g., Mathematics, Physics, Compilers)',
        '- Topic subfolders (e.g., Calculus, Quantum Mechanics)',
        '- Lecture notes, textbook PDFs, assignments, practice sheets',
        '- Diagrams, mind maps, summary notes',
        '',
        'Everything you upload here is stored in your own Google Drive,',
        'under My-Notebook/Studies. Your data never leaves your account.',
    ],
    Internships: [
        'Welcome to your Internships vault.',
        '',
        'Use this tab to capture everything from your internship experiences.',
        '',
        'How to use:',
        '- Click "New Entry" to create a folder for each internship or company.',
        '- Inside, create subfolders for projects, onboarding docs, learnings.',
        '- Upload project reports, code exports, design docs, and takeaways.',
        '',
        'Suggested contents:',
        '- Folder per company (e.g., Google Summer 2025, Meta Winter 2026)',
        '- Project documents, weekly reports, design specs',
        '- Learnings, reflections, and references to follow up later',
        '- Screenshots and architecture diagrams',
        '',
        'Stored in your Google Drive at My-Notebook/Internships.',
    ],
    Jobs: [
        'Welcome to your Jobs vault.',
        '',
        'Use this tab to track full-time job research and work artifacts.',
        '',
        'How to use:',
        '- Click "New Entry" to create a folder per role or per employer.',
        '- Upload job descriptions, offer letters, interview prep, work notes.',
        '',
        'Suggested contents:',
        '- Folder per target role or company',
        '- Interview preparation PDFs and notes',
        '- Resume versions, cover letters, portfolio exports',
        '- Post-joining: work notes, tech docs, internal references',
        '',
        'Stored in your Google Drive at My-Notebook/Jobs.',
    ],
    Archive: [
        'Welcome to your Archive vault.',
        '',
        'Use this tab to store older material you no longer need daily',
        'but want to keep for reference.',
        '',
        'How to use:',
        '- Click "New Entry" to create a folder per year, project, or topic.',
        '- Upload anything you are archiving: old projects, references,',
        '  papers you have finished, course material you have completed.',
        '',
        'Suggested contents:',
        '- Year-based folders (e.g., 2023, 2024)',
        '- Completed course folders',
        '- Old resumes, expired offer letters',
        '- Legacy notes you want to keep but not surface daily',
        '',
        'Stored in your Google Drive at My-Notebook/Archive.',
    ],
};

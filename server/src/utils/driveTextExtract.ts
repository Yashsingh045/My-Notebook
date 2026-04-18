import type { drive_v3 } from 'googleapis';
import { PDFParse } from 'pdf-parse';

const MAX_CHARS = 60_000;

/**
 * Recursively extract plain text from a TipTap ProseMirror JSON doc.
 */
export function tiptapDocToText(node: any): string {
    if (!node) return '';
    if (typeof node === 'string') return node;
    if (node.type === 'text') return node.text || '';
    let out = '';
    if (Array.isArray(node.content)) {
        for (const child of node.content) out += tiptapDocToText(child);
    }
    if (node.type === 'paragraph' || node.type === 'heading' || node.type === 'listItem') {
        out += '\n';
    }
    return out;
}

export async function readStreamAsString(stream: NodeJS.ReadableStream): Promise<string> {
    const chunks: Buffer[] = [];
    return new Promise((resolve, reject) => {
        stream.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
        stream.on('error', reject);
    });
}

export async function readStreamAsBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
    const chunks: Buffer[] = [];
    return new Promise((resolve, reject) => {
        stream.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
    });
}

export interface ExtractedFile {
    text: string;
    truncated: boolean;
    mimeType: string;
    name: string;
}

/**
 * Downloads a Drive file and returns plain text suitable for feeding to an LLM.
 * Throws if the file is not text-extractable in a lightweight way.
 */
export async function extractDriveFileText(
    drive: drive_v3.Drive,
    fileId: string
): Promise<ExtractedFile> {
    const meta = await drive.files.get({
        fileId,
        fields: 'name, mimeType, size',
    });
    const name = meta.data.name || 'file';
    const mimeType = meta.data.mimeType || 'application/octet-stream';

    let raw = '';

    if (mimeType === 'application/vnd.google-apps.document') {
        const exp = await drive.files.export(
            { fileId, mimeType: 'text/plain' },
            { responseType: 'stream' }
        );
        raw = await readStreamAsString(exp.data as unknown as NodeJS.ReadableStream);
    } else if (mimeType === 'application/pdf' || name.toLowerCase().endsWith('.pdf')) {
        const media = await drive.files.get(
            { fileId, alt: 'media' },
            { responseType: 'stream' }
        );
        const buffer = await readStreamAsBuffer(
            media.data as unknown as NodeJS.ReadableStream
        );
        const parser = new PDFParse({ data: new Uint8Array(buffer) });
        try {
            const parsed = await parser.getText();
            const text = (parsed.text || '').trim();
            if (!text) {
                throw new Error(
                    'PDF appears to contain no extractable text (likely a scan/image-only PDF). OCR isn\'t supported yet.'
                );
            }
            raw = `PDF: ${name}\n\n${text}`;
        } catch (err: any) {
            if (/scan|OCR|no extractable/i.test(err?.message || '')) throw err;
            throw new Error(`Failed to parse PDF: ${err?.message || 'unknown error'}`);
        } finally {
            await parser.destroy().catch(() => {});
        }
    } else if (
        mimeType.startsWith('text/') ||
        mimeType === 'application/json' ||
        name.endsWith('.md') ||
        name.endsWith('.note.json') ||
        name.endsWith('.json')
    ) {
        const media = await drive.files.get(
            { fileId, alt: 'media' },
            { responseType: 'stream' }
        );
        raw = await readStreamAsString(
            media.data as unknown as NodeJS.ReadableStream
        );
        if (name.endsWith('.note.json')) {
            try {
                const parsed = JSON.parse(raw);
                const title = typeof parsed.title === 'string' ? parsed.title : '';
                const body = tiptapDocToText(parsed.doc);
                raw = `Note title: ${title}\n\n${body}`;
            } catch {
                // fall back to raw JSON if parsing fails
            }
        }
    } else {
        throw new Error(
            `AI context extraction not supported for ${mimeType}. Open a note or text file to use it as context.`
        );
    }

    const truncated = raw.length > MAX_CHARS;
    const text = truncated ? raw.slice(0, MAX_CHARS) : raw;
    return { text, truncated, mimeType, name };
}

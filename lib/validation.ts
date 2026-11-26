import { NextRequest, NextResponse } from 'next/server';

export class HttpDomainError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export class ValidationError extends HttpDomainError {
  constructor(message: string) {
    super(400, message);
  }
}

export class ForbiddenError extends HttpDomainError {
  constructor(message = 'Forbidden') {
    super(403, message);
  }
}

export class NotFoundError extends HttpDomainError {
  constructor(message = 'Resource not found') {
    super(404, message);
  }
}

export class ConflictError extends HttpDomainError {
  constructor(message: string) {
    super(409, message);
  }
}

export class InsufficientCreditsError extends HttpDomainError {
  constructor(message = 'Insufficient available ECHO credits.') {
    super(400, message);
  }
}

export function toErrorResponse(error: unknown, fallbackMessage: string): NextResponse {
  if (error instanceof HttpDomainError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error(fallbackMessage, error);
  return NextResponse.json({ error: fallbackMessage }, { status: 500 });
}

export async function readJsonBody(req: NextRequest | Request): Promise<Record<string, unknown>> {
  try {
    const parsed = await req.json();
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new ValidationError('Invalid JSON request payload.');
    }
    return parsed as Record<string, unknown>;
  } catch (err) {
    if (err instanceof ValidationError) throw err;
    throw new ValidationError('Malformed JSON request body.');
  }
}

/** Strips null bytes & non-printable control characters while bounding text length. */
export function sanitizeText(
  raw: unknown,
  opts: {
    fieldName: string;
    maxLen: number;
    minLen?: number;
    defaultValue?: string;
    collapseNewlines?: boolean;
  }
): string {
  if (raw === undefined || raw === null) {
    if (opts.defaultValue !== undefined) return opts.defaultValue;
    throw new ValidationError(`${opts.fieldName} is required.`);
  }
  if (typeof raw !== 'string') {
    throw new ValidationError(`${opts.fieldName} must be a text string.`);
  }

  // Strip null bytes and ASCII control characters except tab, LF, CR
  let cleaned = raw.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();
  if (opts.collapseNewlines) {
    cleaned = cleaned.replace(/\s+/g, ' ');
  }

  if (!cleaned && opts.defaultValue !== undefined) {
    return opts.defaultValue;
  }

  const minLen = opts.minLen ?? 0;
  if (cleaned.length < minLen) {
    throw new ValidationError(
      minLen === 1
        ? `${opts.fieldName} is required.`
        : `${opts.fieldName} must be at least ${minLen} characters.`
    );
  }

  if (cleaned.length > opts.maxLen) {
    throw new ValidationError(`${opts.fieldName} must not exceed ${opts.maxLen} characters.`);
  }

  return cleaned;
}

export function parseBoundedNumber(
  raw: unknown,
  opts: { min: number; max: number; fieldName: string }
): number {
  const num = typeof raw === 'number' ? raw : typeof raw === 'string' && raw.trim() !== '' ? Number(raw) : NaN;
  if (!Number.isFinite(num) || num < opts.min || num > opts.max) {
    throw new ValidationError(
      `${opts.fieldName} must be a number between ${opts.min} and ${opts.max}.`
    );
  }
  return num;
}

export function parsePositiveInt(
  raw: unknown,
  opts: { min: number; max: number; fieldName: string }
): number {
  const num = parseBoundedNumber(raw, opts);
  if (!Number.isInteger(num)) {
    throw new ValidationError(`${opts.fieldName} must be a whole integer.`);
  }
  return num;
}

const COMPRESSED_AVATAR_DATA_URL_REGEX = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/;
const MAX_AVATAR_DATA_URL_LENGTH = 220_000;

export function validateAvatarUrlInput(
  raw: unknown
): { ok: true; value: string | null } | { ok: false; error: string } {
  if (raw === null || raw === '') {
    return { ok: true, value: null };
  }
  if (typeof raw !== 'string') {
    return { ok: false, error: 'Invalid avatarUrl payload type.' };
  }

  const trimmed = raw.trim();
  if (!trimmed) {
    return { ok: true, value: null };
  }

  const lower = trimmed.toLowerCase();
  if (lower.startsWith('javascript:') || lower.startsWith('vbscript:')) {
    return { ok: false, error: 'Unsafe avatar URL scheme rejected.' };
  }

  if (lower.startsWith('data:')) {
    if (trimmed.length > MAX_AVATAR_DATA_URL_LENGTH) {
      return {
        ok: false,
        error: 'Compressed avatar exceeds limit. Please choose a smaller image.',
      };
    }
    if (!COMPRESSED_AVATAR_DATA_URL_REGEX.test(trimmed)) {
      return {
        ok: false,
        error: 'Unsupported image format. Only compressed JPG, PNG, and WebP are allowed.',
      };
    }
    return { ok: true, value: trimmed };
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'https:' || trimmed.length > 2048) {
      return { ok: false, error: 'Avatar URL must use HTTPS.' };
    }
    return { ok: true, value: parsed.toString() };
  } catch {
    return { ok: false, error: 'Malformed avatar URL.' };
  }
}

const MAX_ATTACHMENT_DATA_URI_LENGTH = 11_000_000; // ~8 MB raw binary in base64
const BLOCKED_ATTACHMENT_MIMES = new Set([
  'image/svg+xml',
  'text/html',
  'application/xhtml+xml',
  'text/javascript',
  'application/javascript',
  'application/x-javascript',
  'application/ecmascript',
  'application/x-msdownload',
  'application/x-msdos-program',
  'application/x-sh',
  'text/xml',
  'application/xml',
]);

const DATA_URI_PATTERN = /^data:([a-z0-9!#$&^_.+-]+\/[a-z0-9!#$&^_.+-]+)(?:;[a-z0-9=._+-]+)*;base64,([A-Za-z0-9+/=]+)$/i;

export interface ValidatedAttachment {
  attachmentUrl: string;
  attachmentName: string | null;
  attachmentType: 'image' | 'audio' | 'file';
  attachmentSize: string | null;
}

export function validateChatAttachment(input: {
  attachmentUrl?: unknown;
  attachmentName?: unknown;
  attachmentType?: unknown;
  attachmentSize?: unknown;
}): ValidatedAttachment | null {
  const { attachmentUrl, attachmentName, attachmentType, attachmentSize } = input;
  if (attachmentUrl === undefined || attachmentUrl === null || attachmentUrl === '') {
    return null;
  }
  if (typeof attachmentUrl !== 'string') {
    throw new ValidationError('Invalid attachment payload.');
  }

  const trimmedUrl = attachmentUrl.trim();
  const lower = trimmedUrl.toLowerCase();

  if (lower.startsWith('javascript:') || lower.startsWith('vbscript:')) {
    throw new ValidationError('Unsafe attachment URI scheme blocked.');
  }

  if (lower.startsWith('data:')) {
    if (trimmedUrl.length > MAX_ATTACHMENT_DATA_URI_LENGTH) {
      throw new ValidationError('Attachment exceeds the 8 MB size limit.');
    }

    const match = DATA_URI_PATTERN.exec(trimmedUrl);
    if (!match) {
      throw new ValidationError('Unsupported or malformed base64 data attachment.');
    }

    const mime = match[1].toLowerCase();
    if (BLOCKED_ATTACHMENT_MIMES.has(mime) || mime.includes('svg') || mime.includes('html') || mime.includes('script')) {
      throw new ValidationError(`Attachment MIME type "${mime}" is blocked for security.`);
    }
  } else {
    let parsed: URL;
    try {
      parsed = new URL(trimmedUrl);
    } catch {
      throw new ValidationError('Malformed attachment URL.');
    }
    if (parsed.protocol !== 'https:' || trimmedUrl.length > 2048) {
      throw new ValidationError('External attachments must use a valid HTTPS URL.');
    }
  }

  const safeType: 'image' | 'audio' | 'file' =
    attachmentType === 'image' || attachmentType === 'audio' ? attachmentType : 'file';

  const safeName =
    typeof attachmentName === 'string' && attachmentName.trim()
      ? sanitizeText(attachmentName, {
          fieldName: 'Attachment name',
          maxLen: 255,
          collapseNewlines: true,
        })
      : null;

  const safeSize =
    typeof attachmentSize === 'string' && attachmentSize.trim()
      ? sanitizeText(attachmentSize, {
          fieldName: 'Attachment size',
          maxLen: 32,
          collapseNewlines: true,
        })
      : null;

  return {
    attachmentUrl: trimmedUrl,
    attachmentName: safeName,
    attachmentType: safeType,
    attachmentSize: safeSize,
  };
}

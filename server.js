'use strict';

/**
 * Nur PWA server
 *
 * This is deliberately built with Node's standard library only. It serves the
 * PWA from the directory above this file and keeps story submissions outside
 * the public URL space. It is suitable for a small self-hosted moderation
 * workflow; use a managed database and identity provider for a large service.
 */

const http = require('node:http');
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const { URL } = require('node:url');

const BACKEND_DIR = __dirname;
const PUBLIC_DIR = path.resolve(BACKEND_DIR, '..');
const DATA_DIR = path.join(BACKEND_DIR, 'data');
const STORE_FILE = path.join(DATA_DIR, 'stories.json');

loadEnvFile(path.join(BACKEND_DIR, '.env'));

const PORT = parseInteger(process.env.PORT, 8080, 1, 65535);
const MAX_BODY_BYTES = parseInteger(process.env.MAX_BODY_BYTES, 16_384, 1_024, 65_536);
const ADMIN_TOKEN = String(process.env.ADMIN_TOKEN || '').trim();
const OPENAI_API_KEY = String(process.env.OPENAI_API_KEY || '').trim();
const OPENAI_MODEL = String(process.env.OPENAI_MODEL || 'gpt-5-mini').trim();
const ALLOWED_ORIGINS = new Set(
  String(process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
    .filter(isValidOrigin),
);

const STORY_STATUSES = new Set(['pending', 'published', 'rejected']);
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
};

// Mutations are serialized so two submissions cannot overwrite one another.
let writeQueue = Promise.resolve();

function loadEnvFile(filePath) {
  try {
    const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;

      const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
      if (!match) continue;

      const [, key, rawValue] = match;
      if (Object.prototype.hasOwnProperty.call(process.env, key)) continue;

      let value = rawValue.trim();
      const quote = value[0];
      if ((quote === '"' || quote === "'") && value.endsWith(quote)) {
        value = value.slice(1, -1);
      } else {
        const commentIndex = value.indexOf(' #');
        if (commentIndex >= 0) value = value.slice(0, commentIndex).trim();
      }
      process.env[key] = value;
    }
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.warn('Could not read .env:', error.message);
    }
  }
}

function parseInteger(value, fallback, min, max) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed >= min && parsed <= max ? parsed : fallback;
}

function isValidOrigin(value) {
  try {
    const parsed = new URL(value);
    return (parsed.protocol === 'http:' || parsed.protocol === 'https:') && parsed.origin === value.replace(/\/$/, '');
  } catch {
    return false;
  }
}

function applySecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Permissions-Policy', 'camera=(), geolocation=(), microphone=()');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; base-uri 'self'; connect-src 'self' https:; font-src 'self' https://fonts.gstatic.com; frame-ancestors 'self'; img-src 'self' data: https:; manifest-src 'self'; media-src 'self' https:; object-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; worker-src 'self'",
  );
}

function requestOriginIsAllowed(req) {
  const origin = req.headers.origin;
  if (!origin) return true;
  if (!isValidOrigin(origin)) return false;

  try {
    const host = String(req.headers.host || '').toLowerCase();
    const parsed = new URL(origin);
    return parsed.host.toLowerCase() === host || ALLOWED_ORIGINS.has(origin);
  } catch {
    return false;
  }
}

function applyCors(req, res) {
  const origin = req.headers.origin;
  if (!origin) return true;
  if (!requestOriginIsAllowed(req)) return false;

  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Token');
  res.setHeader('Access-Control-Max-Age', '600');
  res.setHeader('Vary', 'Origin');
  return true;
}

function sendJson(res, statusCode, payload, headers = {}) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store',
    ...headers,
  });
  res.end(body);
}

function sendError(res, statusCode, code, message, details) {
  const error = { code, message };
  if (details) error.details = details;
  sendJson(res, statusCode, { error });
}

function sendMethodNotAllowed(res, allowed) {
  sendError(res, 405, 'method_not_allowed', 'Этот метод не поддерживается.', { allowed });
}

async function readJsonBody(req) {
  const contentType = String(req.headers['content-type'] || '').toLowerCase();
  if (!contentType.startsWith('application/json')) {
    const error = new Error('Нужен заголовок Content-Type: application/json.');
    error.statusCode = 415;
    error.code = 'unsupported_media_type';
    throw error;
  }

  const advertisedLength = Number.parseInt(req.headers['content-length'], 10);
  if (Number.isFinite(advertisedLength) && advertisedLength > MAX_BODY_BYTES) {
    const error = new Error(`Тело запроса не может быть больше ${MAX_BODY_BYTES} байт.`);
    error.statusCode = 413;
    error.code = 'payload_too_large';
    throw error;
  }

  return new Promise((resolve, reject) => {
    const chunks = [];
    let received = 0;
    let settled = false;

    const fail = (error) => {
      if (settled) return;
      settled = true;
      reject(error);
    };

    req.on('data', (chunk) => {
      received += chunk.length;
      if (received > MAX_BODY_BYTES) {
        const error = new Error(`Тело запроса не может быть больше ${MAX_BODY_BYTES} байт.`);
        error.statusCode = 413;
        error.code = 'payload_too_large';
        fail(error);
        req.resume();
        return;
      }
      chunks.push(chunk);
    });
    req.on('aborted', () => {
      const error = new Error('Запрос был прерван.');
      error.statusCode = 400;
      error.code = 'request_aborted';
      fail(error);
    });
    req.on('error', fail);
    req.on('end', () => {
      if (settled) return;
      try {
        const rawBody = Buffer.concat(chunks).toString('utf8');
        const body = JSON.parse(rawBody);
        if (!body || typeof body !== 'object' || Array.isArray(body)) {
          const error = new Error('Ожидался JSON-объект.');
          error.statusCode = 400;
          error.code = 'invalid_json';
          throw error;
        }
        settled = true;
        resolve(body);
      } catch (cause) {
        if (cause.statusCode) return fail(cause);
        const error = new Error('Не удалось прочитать JSON.');
        error.statusCode = 400;
        error.code = 'invalid_json';
        fail(error);
      }
    });
  });
}

function normalizeText(value, { label, min, max, multiline = false }) {
  if (typeof value !== 'string') return { error: `${label}: укажите текст.` };

  let text = value
    .normalize('NFKC')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/\r\n?/g, '\n');

  if (multiline) {
    text = text.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n');
  } else {
    text = text.replace(/\s+/g, ' ');
  }
  text = text.trim();

  const length = Array.from(text).length;
  if (length < min || length > max) {
    return { error: `${label}: от ${min} до ${max} символов.` };
  }
  return { value: text };
}

function validateSubmittedStory(payload) {
  const errors = [];
  const allowedFields = new Set(['author', 'title', 'body']);
  const unsupported = Object.keys(payload).filter((key) => !allowedFields.has(key));
  if (unsupported.length) errors.push(`Недопустимые поля: ${unsupported.join(', ')}.`);

  const author = normalizeText(payload.author, { label: 'Автор', min: 2, max: 70 });
  const title = normalizeText(payload.title, { label: 'Заголовок', min: 3, max: 120 });
  const body = normalizeText(payload.body, { label: 'История', min: 20, max: 3_000, multiline: true });
  for (const item of [author, title, body]) if (item.error) errors.push(item.error);

  if (errors.length) return { errors };
  return { value: { author: author.value, title: title.value, body: body.value } };
}

function validateStoryPatch(payload) {
  const errors = [];
  const allowedFields = new Set(['author', 'title', 'body', 'status']);
  const unsupported = Object.keys(payload).filter((key) => !allowedFields.has(key));
  if (unsupported.length) errors.push(`Недопустимые поля: ${unsupported.join(', ')}.`);
  if (!Object.prototype.hasOwnProperty.call(payload, 'status')) {
    errors.push('Укажите новый статус истории.');
  } else if (typeof payload.status !== 'string' || !STORY_STATUSES.has(payload.status)) {
    errors.push('Статус должен быть pending, published или rejected.');
  }

  const fields = {};
  const definitions = {
    author: { label: 'Автор', min: 2, max: 70 },
    title: { label: 'Заголовок', min: 3, max: 120 },
    body: { label: 'История', min: 20, max: 3_000, multiline: true },
  };
  for (const [field, definition] of Object.entries(definitions)) {
    if (!Object.prototype.hasOwnProperty.call(payload, field)) continue;
    const checked = normalizeText(payload[field], definition);
    if (checked.error) errors.push(checked.error);
    else fields[field] = checked.value;
  }

  if (errors.length) return { errors };
  return { value: { ...fields, status: payload.status } };
}

function validateStore(store) {
  if (!store || typeof store !== 'object' || Array.isArray(store) || !Array.isArray(store.stories)) {
    throw new Error('Story storage has an invalid format.');
  }
  return { version: 1, stories: store.stories };
}

async function ensureStore() {
  await fsp.mkdir(DATA_DIR, { recursive: true, mode: 0o700 });
  try {
    await fsp.access(STORE_FILE);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    await writeStoreAtomically({ version: 1, stories: [] });
  }
}

async function readStore() {
  const rawStore = await fsp.readFile(STORE_FILE, 'utf8');
  try {
    return validateStore(JSON.parse(rawStore));
  } catch (cause) {
    const error = new Error('Story storage is corrupted. Restore it from a backup before continuing.');
    error.cause = cause;
    throw error;
  }
}

async function writeStoreAtomically(store) {
  const safeStore = validateStore(store);
  const contents = `${JSON.stringify(safeStore, null, 2)}\n`;
  const temporaryPath = path.join(
    DATA_DIR,
    `.stories-${process.pid}-${Date.now()}-${crypto.randomBytes(6).toString('hex')}.tmp`,
  );
  let handle;
  try {
    handle = await fsp.open(temporaryPath, 'wx', 0o600);
    await handle.writeFile(contents, 'utf8');
    await handle.sync();
    await handle.close();
    handle = undefined;
    await fsp.rename(temporaryPath, STORE_FILE);
  } finally {
    if (handle) await handle.close().catch(() => {});
    await fsp.unlink(temporaryPath).catch(() => {});
  }
}

function mutateStore(mutator) {
  const operation = writeQueue.then(async () => {
    const store = await readStore();
    const result = await mutator(store);
    await writeStoreAtomically(store);
    return result;
  });

  // Keep the queue usable after a failed write while still returning the error
  // to the request that caused it.
  writeQueue = operation.catch(() => {});
  return operation;
}

function toPublicStory(story) {
  return {
    id: story.id,
    title: story.title,
    body: story.body,
    author: story.author,
    createdAt: story.createdAt,
    publishedAt: story.publishedAt || story.updatedAt,
  };
}

function toAdminStory(story) {
  return {
    id: story.id,
    title: story.title,
    body: story.body,
    author: story.author,
    status: story.status,
    createdAt: story.createdAt,
    updatedAt: story.updatedAt,
    publishedAt: story.publishedAt || null,
    reviewedAt: story.reviewedAt || null,
  };
}

function getPagination(searchParams) {
  const requestedLimit = parseInteger(searchParams.get('limit'), 24, 1, 100);
  const requestedOffset = parseInteger(searchParams.get('offset'), 0, 0, Number.MAX_SAFE_INTEGER);
  return { limit: requestedLimit, offset: requestedOffset };
}

function adminAuthenticationStatus(req) {
  if (!ADMIN_TOKEN) return 'unconfigured';
  const provided = req.headers['x-admin-token'];
  if (typeof provided !== 'string') return 'denied';

  const expectedBuffer = Buffer.from(ADMIN_TOKEN, 'utf8');
  const providedBuffer = Buffer.from(provided, 'utf8');
  if (expectedBuffer.length !== providedBuffer.length) return 'denied';
  return crypto.timingSafeEqual(expectedBuffer, providedBuffer) ? 'ok' : 'denied';
}

function requireAdmin(req, res) {
  const auth = adminAuthenticationStatus(req);
  if (auth === 'ok') return true;
  if (auth === 'unconfigured') {
    sendError(res, 503, 'admin_not_configured', 'Административный токен ещё не настроен на сервере.');
  } else {
    sendError(res, 401, 'unauthorized', 'Требуется действующий административный токен.');
  }
  return false;
}

async function handleStories(req, res, requestUrl) {
  if (req.method === 'GET') {
    const { limit, offset } = getPagination(requestUrl.searchParams);
    const store = await readStore();
    const publishedStories = store.stories
      .filter((story) => story.status === 'published')
      .sort((left, right) => String(right.publishedAt || right.createdAt).localeCompare(String(left.publishedAt || left.createdAt)));
    const stories = publishedStories.slice(offset, offset + limit).map(toPublicStory);
    sendJson(res, 200, { stories, total: publishedStories.length, limit, offset });
    return;
  }

  if (req.method === 'POST') {
    const payload = await readJsonBody(req);
    const validated = validateSubmittedStory(payload);
    if (validated.errors) {
      sendError(res, 422, 'validation_failed', 'Проверьте поля истории.', validated.errors);
      return;
    }

    const now = new Date().toISOString();
    const story = {
      id: crypto.randomUUID(),
      ...validated.value,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };
    await mutateStore((store) => {
      store.stories.push(story);
      return story;
    });
    sendJson(res, 202, {
      message: 'История отправлена на модерацию. Спасибо за доверие.',
      submission: { id: story.id, status: story.status, createdAt: story.createdAt },
    });
    return;
  }

  sendMethodNotAllowed(res, ['GET', 'POST']);
}

async function handleAssistant(req, res) {
  if (req.method !== 'POST') {
    sendMethodNotAllowed(res, ['POST']);
    return;
  }
  if (!OPENAI_API_KEY) {
    sendError(res, 503, 'assistant_not_configured', 'ИИ пока не подключён к серверу.');
    return;
  }
  const payload = await readJsonBody(req);
  const question = normalizeText(payload.question, { label: 'Вопрос', min: 2, max: 1_500, multiline: true });
  if (question.error) {
    sendError(res, 422, 'validation_failed', question.error);
    return;
  }
  const language = typeof payload.language === 'string' ? payload.language.slice(0, 12) : 'ru';
  const instructions = `You are Nur, a respectful Islamic reference assistant. Reply in the user's language (${language}). Give useful, careful answers grounded in the Qur'an and authentic hadith when possible. Include concise source references when you state a religious claim. Never issue a fatwa, never pretend certainty about disputed fiqh, and for personal, legal, medical, financial, or disputed religious matters say that there are differences of opinion and recommend a knowledgeable local imam. Do not invent Qur'an verses, hadith, or citations. Be warm, concise, and clear.`;
  const upstream = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: OPENAI_MODEL, instructions, input: question.value, store: false, max_output_tokens: 700 }),
    signal: AbortSignal.timeout(25_000),
  });
  const result = await upstream.json().catch(() => ({}));
  if (!upstream.ok) {
    console.error('Assistant upstream error:', upstream.status, result?.error?.message || 'unknown');
    sendError(res, 502, 'assistant_upstream_error', 'ИИ временно недоступен. Попробуйте ещё раз позже.');
    return;
  }
  const answer = String(result.output_text || '').trim();
  if (!answer) {
    sendError(res, 502, 'assistant_empty_answer', 'ИИ не вернул ответ. Попробуйте ещё раз.');
    return;
  }
  sendJson(res, 200, { answer });
}

async function handleAdminStories(req, res, requestUrl, storyId) {
  if (!requireAdmin(req, res)) return;

  if (!storyId) {
    if (req.method !== 'GET') {
      sendMethodNotAllowed(res, ['GET']);
      return;
    }

    const requestedStatus = requestUrl.searchParams.get('status') || 'pending';
    if (requestedStatus !== 'all' && !STORY_STATUSES.has(requestedStatus)) {
      sendError(res, 400, 'invalid_status', 'Статус должен быть pending, published, rejected или all.');
      return;
    }
    const { limit, offset } = getPagination(requestUrl.searchParams);
    const store = await readStore();
    const all = store.stories
      .filter((story) => requestedStatus === 'all' || story.status === requestedStatus)
      .sort((left, right) => String(right.createdAt).localeCompare(String(left.createdAt)));
    sendJson(res, 200, {
      stories: all.slice(offset, offset + limit).map(toAdminStory),
      total: all.length,
      limit,
      offset,
      status: requestedStatus,
    });
    return;
  }

  if (req.method !== 'PATCH') {
    sendMethodNotAllowed(res, ['PATCH']);
    return;
  }
  if (!UUID_PATTERN.test(storyId)) {
    sendError(res, 400, 'invalid_story_id', 'Некорректный идентификатор истории.');
    return;
  }

  const payload = await readJsonBody(req);
  const validated = validateStoryPatch(payload);
  if (validated.errors) {
    sendError(res, 422, 'validation_failed', 'Проверьте изменения истории.', validated.errors);
    return;
  }

  const updated = await mutateStore((store) => {
    const story = store.stories.find((item) => item.id === storyId);
    if (!story) return null;

    const previousStatus = story.status;
    Object.assign(story, validated.value);
    story.updatedAt = new Date().toISOString();
    story.reviewedAt = story.updatedAt;
    if (story.status === 'published' && previousStatus !== 'published') story.publishedAt = story.updatedAt;
    if (story.status !== 'published') delete story.publishedAt;
    return story;
  });

  if (!updated) {
    sendError(res, 404, 'story_not_found', 'История не найдена.');
    return;
  }
  sendJson(res, 200, { story: toAdminStory(updated) });
}

async function handleApi(req, res, requestUrl) {
  if (!applyCors(req, res)) {
    sendError(res, 403, 'origin_not_allowed', 'Этот источник не разрешён для API.');
    return;
  }
  if (req.method === 'OPTIONS') {
    res.writeHead(204, { 'Cache-Control': 'no-store' });
    res.end();
    return;
  }

  const { pathname } = requestUrl;
  if (pathname === '/api/stories') {
    await handleStories(req, res, requestUrl);
    return;
  }
  if (pathname === '/api/assistant') {
    await handleAssistant(req, res);
    return;
  }
  if (pathname === '/api/admin/stories') {
    await handleAdminStories(req, res, requestUrl, null);
    return;
  }
  const adminStoryMatch = pathname.match(/^\/api\/admin\/stories\/([^/]+)$/);
  if (adminStoryMatch) {
    await handleAdminStories(req, res, requestUrl, adminStoryMatch[1]);
    return;
  }
  sendError(res, 404, 'api_not_found', 'API-маршрут не найден.');
}

function resolvePublicFile(decodedPathname) {
  const urlPath = decodedPathname === '/' ? '/index.html' : decodedPathname;
  const requested = urlPath.replace(/^[/\\]+/, '');
  const filePath = path.resolve(PUBLIC_DIR, requested);
  const relative = path.relative(PUBLIC_DIR, filePath);
  const outsidePublicDir = relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative);
  if (outsidePublicDir) return null;

  const pathSegments = relative.split(path.sep);
  if (
    relative === 'backend' ||
    relative.startsWith(`backend${path.sep}`) ||
    pathSegments.some((segment) => segment.startsWith('.'))
  ) {
    return null;
  }
  return filePath;
}

function serveStatic(req, res, decodedPathname) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    sendMethodNotAllowed(res, ['GET', 'HEAD']);
    return;
  }

  const filePath = resolvePublicFile(decodedPathname);
  if (!filePath) {
    sendError(res, 404, 'not_found', 'Страница не найдена.');
    return;
  }

  fs.stat(filePath, (statError, stat) => {
    if (statError || !stat.isFile()) {
      sendError(res, 404, 'not_found', 'Страница не найдена.');
      return;
    }

    const extension = path.extname(filePath).toLowerCase();
    const headers = {
      'Content-Type': MIME_TYPES[extension] || 'application/octet-stream',
      'Content-Length': stat.size,
      'Cache-Control': 'no-cache',
    };
    if (path.basename(filePath) === 'sw.js') headers['Service-Worker-Allowed'] = '/';
    res.writeHead(200, headers);
    if (req.method === 'HEAD') {
      res.end();
      return;
    }

    const stream = fs.createReadStream(filePath);
    stream.on('error', () => {
      if (!res.headersSent) sendError(res, 500, 'file_read_error', 'Не удалось открыть файл.');
      else res.destroy();
    });
    stream.pipe(res);
  });
}

async function requestHandler(req, res) {
  applySecurityHeaders(res);

  let requestUrl;
  let decodedPathname;
  try {
    requestUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    decodedPathname = decodeURIComponent(requestUrl.pathname);
  } catch {
    sendError(res, 400, 'invalid_url', 'Некорректный адрес запроса.');
    return;
  }

  try {
    if (decodedPathname === '/api' || decodedPathname.startsWith('/api/')) {
      await handleApi(req, res, requestUrl);
    } else {
      serveStatic(req, res, decodedPathname);
    }
  } catch (error) {
    if (res.headersSent) {
      res.destroy();
      return;
    }
    const statusCode = Number.isInteger(error.statusCode) ? error.statusCode : 500;
    const code = error.code || 'internal_error';
    if (statusCode >= 500) console.error('Request failed:', error);
    sendError(res, statusCode, code, error.message || 'Внутренняя ошибка сервера.');
  }
}

async function start() {
  await ensureStore();
  const server = http.createServer((req, res) => {
    requestHandler(req, res);
  });

  server.on('clientError', (_error, socket) => {
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
  });
  server.listen(PORT, () => {
    console.log(`Nur PWA and story API are running at http://localhost:${PORT}`);
    if (!ADMIN_TOKEN) console.warn('Admin API is disabled: set ADMIN_TOKEN in backend/.env before moderating stories.');
  });
}

start().catch((error) => {
  console.error('The server could not start:', error);
  process.exitCode = 1;
});

import { createServer } from 'node:http';
import { constants as fsConstants } from 'node:fs';
import { access, appendFile, mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, extname, join, resolve, sep } from 'node:path';

const PORT = Number(process.env.PORT || 3001);
const DATA_DIR = process.env.DATA_DIR
    ? resolve(process.cwd(), process.env.DATA_DIR)
    : join(process.cwd(), 'data');
const WAITLIST_FILE = process.env.WAITLIST_FILE
    ? resolve(process.cwd(), process.env.WAITLIST_FILE)
    : join(DATA_DIR, 'waitlist.csv');
const DIST_DIR = join(process.cwd(), 'dist');
const INDEX_FILE = join(DIST_DIR, 'index.html');
const CSV_HEADER = 'timestamp,name,email,instagram\n';
const MAX_BODY_SIZE = 1_000_000;
const ALLOWED_ORIGIN = process.env.CORS_ORIGIN || '*';

const MIME_TYPES = {
    '.css': 'text/css; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.map': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.txt': 'text/plain; charset=utf-8',
    '.ico': 'image/x-icon',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
};

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

function sendJson(res, statusCode, payload) {
    res.writeHead(statusCode, {
        ...CORS_HEADERS,
        'X-Content-Type-Options': 'nosniff',
        'Content-Type': 'application/json; charset=utf-8',
    });
    res.end(JSON.stringify(payload));
}

async function ensureWaitlistFile() {
    await mkdir(dirname(WAITLIST_FILE), { recursive: true });

    try {
        await access(WAITLIST_FILE, fsConstants.F_OK);
    } catch {
        await writeFile(WAITLIST_FILE, CSV_HEADER, 'utf8');
    }
}

function parseJsonBody(req) {
    return new Promise((resolve, reject) => {
        let rawBody = '';

        req.on('data', (chunk) => {
            rawBody += chunk;

            if (rawBody.length > MAX_BODY_SIZE) {
                reject(new Error('Request body too large.'));
                req.destroy();
            }
        });

        req.on('end', () => {
            if (!rawBody.trim()) {
                resolve({});
                return;
            }

            try {
                resolve(JSON.parse(rawBody));
            } catch {
                reject(new Error('Invalid JSON payload.'));
            }
        });

        req.on('error', () => {
            reject(new Error('Unable to read request body.'));
        });
    });
}

function normalizeField(value) {
    if (typeof value !== 'string') {
        return '';
    }

    return value.trim();
}

function toCsvCell(value) {
    const safe = String(value).replace(/"/g, '""').replace(/\r?\n/g, ' ');
    return `"${safe}"`;
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function appendWaitlistEntry({ name, email, instagram }) {
    await ensureWaitlistFile();

    const row = [
        new Date().toISOString(),
        name,
        email.toLowerCase(),
        instagram,
    ]
        .map(toCsvCell)
        .join(',');

    await appendFile(WAITLIST_FILE, `${row}\n`, 'utf8');
}

function resolvePublicFile(pathname) {
    try {
        const requestedPath = pathname === '/' ? '/index.html' : pathname;
        const decodedPath = decodeURIComponent(requestedPath);
        const resolvedPath = resolve(DIST_DIR, `.${decodedPath}`);
        if (resolvedPath !== DIST_DIR && !resolvedPath.startsWith(`${DIST_DIR}${sep}`)) {
            return null;
        }

        return resolvedPath;
    } catch {
        return null;
    }
}

async function sendStaticFile(res, filePath) {
    try {
        const fileInfo = await stat(filePath);
        if (!fileInfo.isFile()) {
            return false;
        }

        const body = await readFile(filePath);
        const extension = extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[extension] || 'application/octet-stream';
        const isVersionedAsset = filePath.includes(`${sep}assets${sep}`);

        res.writeHead(200, {
            'Cache-Control': isVersionedAsset ? 'public, max-age=31536000, immutable' : 'no-cache',
            'Content-Type': contentType,
            'X-Content-Type-Options': 'nosniff',
        });
        res.end(body);
        return true;
    } catch (error) {
        if (error && typeof error === 'object' && 'code' in error) {
            if (error.code === 'ENOENT' || error.code === 'ENOTDIR') {
                return false;
            }
        }

        throw error;
    }
}

const server = createServer(async (req, res) => {
    if (!req.url) {
        sendJson(res, 400, { error: 'Invalid request URL.' });
        return;
    }

    if (req.method === 'OPTIONS') {
        res.writeHead(204, CORS_HEADERS);
        res.end();
        return;
    }

    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

    if (req.method === 'GET' && url.pathname === '/api/health') {
        sendJson(res, 200, { ok: true });
        return;
    }

    if (req.method === 'POST' && url.pathname === '/api/waitlist') {
        try {
            const body = await parseJsonBody(req);
            const name = normalizeField(body.name);
            const email = normalizeField(body.email);
            const instagram = normalizeField(body.instagram);

            if (!isValidEmail(email)) {
                sendJson(res, 400, { error: 'Please provide a valid email address.' });
                return;
            }

            await appendWaitlistEntry({ name, email, instagram });
            sendJson(res, 201, { ok: true });
            return;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to save this submission.';
            sendJson(res, 500, { error: message });
            return;
        }
    }

    if (url.pathname === '/api' || url.pathname.startsWith('/api/')) {
        sendJson(res, 404, { error: 'Route not found.' });
        return;
    }

    if (req.method === 'GET') {
        const staticFile = resolvePublicFile(url.pathname);
        if (staticFile && await sendStaticFile(res, staticFile)) {
            return;
        }

        if (await sendStaticFile(res, INDEX_FILE)) {
            return;
        }

        sendJson(res, 404, { error: 'Frontend build not found. Run `npm run build` before starting the server.' });
        return;
    }

    sendJson(res, 404, { error: 'Route not found.' });
});

ensureWaitlistFile()
    .then(() => {
        server.listen(PORT, () => {
            console.log(`Waitlist server running at http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Failed to initialize waitlist file.', error);
        process.exit(1);
    });

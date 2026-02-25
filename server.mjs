import { createServer } from 'node:http';
import { constants as fsConstants } from 'node:fs';
import { access, appendFile, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const PORT = Number(process.env.PORT || 3001);
const DATA_DIR = join(process.cwd(), 'data');
const WAITLIST_FILE = join(DATA_DIR, 'waitlist.csv');
const CSV_HEADER = 'timestamp,name,email,instagram\n';
const MAX_BODY_SIZE = 1_000_000;

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

function sendJson(res, statusCode, payload) {
    res.writeHead(statusCode, {
        ...CORS_HEADERS,
        'Content-Type': 'application/json; charset=utf-8',
    });
    res.end(JSON.stringify(payload));
}

async function ensureWaitlistFile() {
    await mkdir(DATA_DIR, { recursive: true });

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

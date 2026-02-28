import { Redis } from '@upstash/redis';

const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
const MAX_BODY_SIZE = 1_000_000;
const WAITLIST_KEY = process.env.WAITLIST_KEY || 'waitlist:entries';
const REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const HAS_REDIS_CONFIG = Boolean(REDIS_REST_URL && REDIS_REST_TOKEN);

const redis = HAS_REDIS_CONFIG
    ? new Redis({
        url: REDIS_REST_URL,
        token: REDIS_REST_TOKEN,
    })
    : null;

function applyCors(res) {
    res.setHeader('Access-Control-Allow-Origin', CORS_ORIGIN);
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('X-Content-Type-Options', 'nosniff');
}

function normalizeField(value) {
    if (typeof value !== 'string') {
        return '';
    }

    return value.trim();
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function readBody(req) {
    if (req.body && typeof req.body === 'object') {
        return req.body;
    }

    if (typeof req.body === 'string') {
        return req.body.trim() ? JSON.parse(req.body) : {};
    }

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

export default async function handler(req, res) {
    applyCors(res);

    if (req.method === 'OPTIONS') {
        res.status(204).end();
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed.' });
        return;
    }

    if (!redis) {
        res.status(500).json({
            error: 'Redis is not configured. Add the Upstash Redis integration and environment variables.',
        });
        return;
    }

    try {
        const body = await readBody(req);
        const name = normalizeField(body.name);
        const email = normalizeField(body.email);
        const instagram = normalizeField(body.instagram);

        if (!isValidEmail(email)) {
            res.status(400).json({ error: 'Please provide a valid email address.' });
            return;
        }

        const entry = {
            timestamp: new Date().toISOString(),
            name,
            email: email.toLowerCase(),
            instagram,
        };

        await redis.rpush(WAITLIST_KEY, JSON.stringify(entry));
        res.status(201).json({ ok: true });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to save this submission.';
        res.status(500).json({ error: message });
    }
}

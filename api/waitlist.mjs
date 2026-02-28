import { Redis } from '@upstash/redis';

const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
const MAX_BODY_SIZE = 1_000_000;
const WAITLIST_KEY = process.env.WAITLIST_KEY || 'waitlist:entries';

function normalizeEnv(value) {
    if (typeof value !== 'string') {
        return '';
    }

    const trimmed = value.trim();
    return trimmed.replace(/^["']|["']$/g, '');
}

function parseRedisConnection(redisConnectionUrl) {
    const normalized = normalizeEnv(redisConnectionUrl);
    if (!normalized) {
        return { restUrl: '', token: '' };
    }

    try {
        const parsed = new URL(normalized);
        const token = decodeURIComponent(parsed.password || parsed.username || '');
        if (!parsed.hostname || !token) {
            return { restUrl: '', token: '' };
        }

        return {
            restUrl: `https://${parsed.hostname}`,
            token,
        };
    } catch {
        return { restUrl: '', token: '' };
    }
}

function resolveRedisConfig() {
    const kvRestUrl = normalizeEnv(process.env.KV_REST_API_URL);
    const kvRestApiToken = normalizeEnv(process.env.KV_REST_API_TOKEN);
    const kvReadOnlyToken = normalizeEnv(process.env.KV_REST_API_READ_ONLY_TOKEN);

    const upstashRestUrl = normalizeEnv(process.env.UPSTASH_REDIS_REST_URL);
    const upstashRestToken = normalizeEnv(process.env.UPSTASH_REDIS_REST_TOKEN);

    const kvConnection = parseRedisConnection(process.env.KV_URL);
    const redisConnection = parseRedisConnection(process.env.REDIS_URL);

    const restUrl = kvRestUrl || upstashRestUrl || kvConnection.restUrl || redisConnection.restUrl;
    const writeToken = kvRestApiToken || upstashRestToken || kvConnection.token || redisConnection.token;

    return {
        restUrl,
        writeToken,
        hasReadOnlyToken: Boolean(kvReadOnlyToken),
    };
}

const redisConfig = resolveRedisConfig();
const redis = redisConfig.restUrl && redisConfig.writeToken
    ? new Redis({
        url: redisConfig.restUrl,
        token: redisConfig.writeToken,
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
        if (redisConfig.restUrl && redisConfig.hasReadOnlyToken) {
            res.status(500).json({
                error: 'Read-only Redis token detected. Set KV_REST_API_TOKEN (write token) for waitlist writes.',
            });
            return;
        }

        res.status(500).json({
            error: 'Redis is not configured. Set KV_REST_API_URL + KV_REST_API_TOKEN (or UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN).',
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


# Elura Waitlist

Elura helps beauty artists stop chasing clients and start getting booked.

This project is the early-access waitlist experience for artists who want a cleaner, more professional way to get discovered and booked.

## What Elura Is
Elura is designed for beauty professionals who want:
- A premium portfolio presence
- More consistent direct bookings
- Better trust with clients
- Less dependence on chaotic DM workflows

## Why Join Early
Waitlist members get first access as features roll out.

Early access is focused on artists who are serious about:
- Presenting their work professionally
- Growing booking quality, not just volume
- Building a long-term, premium personal brand

## Who It's For
- Makeup artists
- Beauty service professionals
- Artists currently booking mostly through social platforms and referrals

## Waitlist Flow
Users submit:
- Name
- Email
- Optional Instagram handle

After submission, they are added to the early-access list and contacted when access opens.

## Local Preview
```bash
npm install
npm run server
npm run dev
```

Open `http://localhost:5173`.

## Deployment

### Vercel (Recommended)
This repo is now set up for Vercel with:
- Static frontend from `dist`
- Serverless API routes in `api/health.mjs` and `api/waitlist.mjs`
- Persistent waitlist storage in Upstash Redis (via Vercel integration)

#### Vercel Setup Steps
1. Import this repo into Vercel.
2. Add the Upstash Redis integration from the Vercel Marketplace.
3. Ensure these environment variables exist in Vercel:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `KV_REST_API_READ_ONLY_TOKEN` (optional, read-only)
   - `KV_URL` (optional fallback source)
   - `REDIS_URL` (optional fallback source)
   - `WAITLIST_KEY` (optional, defaults to `waitlist:entries`)
   - `CORS_ORIGIN` (optional, defaults to `*`)
4. Deploy.

#### Verify After Deploy
- `GET https://<your-domain>/api/health` -> `{"ok":true}`
- Submit the waitlist form from your deployed site.

### Runtime Requirements
- Node.js `20.19.0+`
- npm `10+`

### Build + Start
```bash
npm install
npm run deploy:check
npm start
```

`npm start` serves both:
- API routes (`/api/health`, `/api/waitlist`)
- Built frontend from `dist/`

### Environment Variables
- `PORT` (default: `3001`)
- `CORS_ORIGIN` (default: `*`)
- `DATA_DIR` (optional override for data folder)
- `WAITLIST_FILE` (optional override for CSV file path)

Example:
```bash
PORT=3001 CORS_ORIGIN=https://your-domain.com WAITLIST_FILE=/var/data/waitlist.csv npm start
```

### Health Check
```bash
curl http://localhost:3001/api/health
```

Expected response:
```json
{"ok":true}
```

## Storage Note
- Local `npm start` uses CSV file storage (`WAITLIST_FILE`).
- Vercel deployment prefers `KV_REST_API_URL` + `KV_REST_API_TOKEN`, and can also derive config from `KV_URL` / `REDIS_URL`.
- Do not rely on local filesystem writes for Vercel production data.


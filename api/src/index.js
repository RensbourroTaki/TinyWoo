// DAIGANOID Highscore-Server: ein Cloudflare Worker mit einem Durable Object (SQLite-Speicher).
// Haelt die gemeinsame Highscore-Liste, prueft Namen mit demselben Filter wie die Website
// (game/filter/namefilter.js) und zaehlt ueber WebSockets, wer gerade auf der Arcade-Seite ist.
//
//   GET  /scores?limit=100            Top-Liste, Sitzungs-Token, Online-Zahlen
//   POST /scores                      { name, score, round, token } -> Eintrag speichern
//   GET  /check?name=...              Namensfilter ausprobieren
//   WS   /live                        Online-Zaehler; Server sendet {type:'live', online, playing}
//   GET  /admin/scores?key=K          alle Eintraege inkl. IP-Kennung (nur mit Admin-Schluessel)
//   GET  /admin/delete?key=K&id=12    Eintrag loeschen (oder &name=XYZ bzw. &ip=KENNUNG)
//   GET  /admin/wipe?key=K&confirm=yes  alles loeschen
import { checkName, sanitizeName } from '../../game/filter/namefilter.js';

const MAX_SCORE = 9999999;          // 7 Stellen wie im HUD
const MAX_ROUND = 33;               // 32 Runden + "durchgespielt"
const KEEP_ROWS = 1000;             // mehr Eintraege fallen unten raus
const LIST_MAX = 100;
const TOKEN_TTL_MS = 12 * 3600 * 1000;
const MIN_MS_PER_ROUND = 6000;      // Mindestspielzeit je erreichter Runde (Plausibilitaet)
const RATE_GAP_MS = 15000;          // Abstand zwischen zwei Eintraegen derselben IP
const RATE_PER_DAY = 40;

const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' };
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });

// ---------------------------------------------------------------- Hilfen

function allowedOrigin(req, env) {
  const origin = req.headers.get('Origin') || '';
  if (!origin) return '';
  const list = String(env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
  for (const a of list) {
    if (a === origin) return origin;
    if (a.endsWith('*') && origin.startsWith(a.slice(0, -1))) return origin;
  }
  return '';
}

function corsHeaders(origin) {
  const h = { Vary: 'Origin' };
  if (origin) {
    h['Access-Control-Allow-Origin'] = origin;
    h['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS';
    h['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
    h['Access-Control-Max-Age'] = '86400';
  }
  return h;
}

const enc = new TextEncoder();
const b64url = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

async function hmac(secret, msg) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64url(await crypto.subtle.sign('HMAC', key, enc.encode(msg)));
}

async function sha256(msg) {
  return b64url(await crypto.subtle.digest('SHA-256', enc.encode(msg)));
}

function safeEqual(a, b) {
  a = String(a); b = String(b);
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

// ---------------------------------------------------------------- Worker (Eingang)

export default {
  async fetch(req, env) {
    const origin = allowedOrigin(req, env);
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(origin) });
    const stub = env.ARCADE.get(env.ARCADE.idFromName('daiganoid'));
    const res = await stub.fetch(req);
    if (res.status === 101) return res;                 // WebSocket-Handshake unveraendert durchreichen
    const out = new Response(res.body, res);
    for (const [k, v] of Object.entries(corsHeaders(origin))) out.headers.set(k, v);
    return out;
  },
};

// ---------------------------------------------------------------- Durable Object

export class Arcade {
  constructor(ctx, env) {
    this.ctx = ctx;
    this.env = env;
    this.sql = ctx.storage.sql;
    this.sql.exec(`CREATE TABLE IF NOT EXISTS scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      score INTEGER NOT NULL,
      round INTEGER NOT NULL,
      created INTEGER NOT NULL,
      ip TEXT NOT NULL DEFAULT '')`);
    this.sql.exec(`CREATE INDEX IF NOT EXISTS scores_rank ON scores (score DESC, created ASC)`);
    this.rate = new Map();                              // IP-Kennung -> Zeitpunkte der letzten Eintraege
    // "ping" wird mit "pong" beantwortet, ohne das Objekt aufzuwecken.
    this.ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair('ping', 'pong'));
  }

  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';
    try {
      if (path === '/live') return this.live(req);
      if (path === '/scores' && req.method === 'GET') return this.list(url);
      if (path === '/scores' && req.method === 'POST') return this.submit(req);
      if (path === '/check' && req.method === 'GET') return json(checkName(url.searchParams.get('name') || ''));
      if (path.startsWith('/admin/')) return this.admin(req, url, path);
      if (path === '/') return json({ ok: true, service: 'daiganoid-api', ...this.counts() });
      return json({ error: 'not-found' }, 404);
    } catch (e) {
      return json({ error: 'server', message: String((e && e.message) || e) }, 500);
    }
  }

  get secret() { return this.env.TOKEN_SECRET || 'daiganoid-dev-secret'; }

  // ------------------------------------------------------------ Liste

  listData(limit) {
    const rows = this.sql.exec(
      `SELECT id, name, score, round, created FROM scores ORDER BY score DESC, created ASC LIMIT ?`, limit).toArray();
    const total = this.sql.exec(`SELECT COUNT(*) AS n FROM scores`).one().n;
    return { scores: rows.map((r) => ({ id: r.id, name: r.name, score: r.score, round: r.round, date: r.created })), total };
  }

  async list(url) {
    const limit = Math.min(LIST_MAX, Math.max(1, Number(url.searchParams.get('limit')) || 10));
    const ts = Date.now();
    return json({ ...this.listData(limit), token: `${ts}.${await hmac(this.secret, String(ts))}`, live: this.counts() });
  }

  // ------------------------------------------------------------ Eintragen

  async verifyToken(token) {
    const parts = String(token || '').split('.');
    if (parts.length !== 2) return { ok: false, reason: 'format' };
    const ts = Number(parts[0]);
    if (!Number.isFinite(ts)) return { ok: false, reason: 'format' };
    if (Date.now() - ts > TOKEN_TTL_MS || ts > Date.now() + 60000) return { ok: false, reason: 'expired' };
    if (!safeEqual(parts[1], await hmac(this.secret, String(ts)))) return { ok: false, reason: 'signature' };
    return { ok: true, ts };
  }

  async submit(req) {
    let body;
    try { body = await req.json(); } catch (e) { return json({ error: 'bad-json' }, 400); }
    const now = Date.now();

    // Bremse je IP (nur im Speicher, nach einem Neustart des Objekts wieder leer)
    const ip = req.headers.get('CF-Connecting-IP') || '0.0.0.0';
    const ipHash = (await sha256(`${this.secret}|${ip}`)).slice(0, 16);
    const hist = (this.rate.get(ipHash) || []).filter((t) => now - t < 86400000);
    if (hist.length && now - hist[hist.length - 1] < RATE_GAP_MS) {
      return json({ error: 'rate', retryIn: Math.ceil((RATE_GAP_MS - (now - hist[hist.length - 1])) / 1000) }, 429);
    }
    if (hist.length >= RATE_PER_DAY) return json({ error: 'rate-daily' }, 429);

    // Sitzungs-Token (von GET /scores) und Plausibilitaet
    const tok = await this.verifyToken(body.token);
    if (!tok.ok) return json({ error: 'token', reason: tok.reason }, 403);
    const score = Number(body.score), round = Number(body.round);
    if (!Number.isInteger(score) || score <= 0 || score > MAX_SCORE) return json({ error: 'score' }, 422);
    if (!Number.isInteger(round) || round < 1 || round > MAX_ROUND) return json({ error: 'round' }, 422);
    const minPlay = Math.max(8000, (round - 1) * MIN_MS_PER_ROUND);
    if (now - tok.ts < minPlay) return json({ error: 'too-fast' }, 422);

    // Name durch den Filter
    const chk = checkName(String(body.name || ''));
    if (!chk.ok) return json({ error: 'name', reason: chk.reason }, 422);

    hist.push(now);
    this.rate.set(ipHash, hist);
    if (this.rate.size > 5000) this.rate.clear();

    const id = this.sql.exec(
      `INSERT INTO scores (name, score, round, created, ip) VALUES (?, ?, ?, ?, ?) RETURNING id`,
      chk.name, score, round, now, ipHash).one().id;
    this.sql.exec(
      `DELETE FROM scores WHERE id IN (SELECT id FROM scores ORDER BY score DESC, created ASC LIMIT -1 OFFSET ?)`, KEEP_ROWS);
    const rank = this.sql.exec(
      `SELECT COUNT(*) AS n FROM scores WHERE score > ? OR (score = ? AND created < ?)`, score, score, now).one().n + 1;
    return json({ ok: true, id, rank, name: chk.name, ...this.listData(LIST_MAX) });
  }

  // ------------------------------------------------------------ Online-Zaehler (WebSocket)

  live(req) {
    if ((req.headers.get('Upgrade') || '').toLowerCase() !== 'websocket') return json({ error: 'websocket-expected' }, 426);
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    this.ctx.acceptWebSocket(server);
    server.serializeAttachment({ playing: false });
    this.broadcast();
    return new Response(null, { status: 101, webSocket: client });
  }

  openSockets() { return this.ctx.getWebSockets().filter((s) => s.readyState === 1); }

  counts() {
    const socks = this.openSockets();
    let playing = 0;
    for (const s of socks) { const a = s.deserializeAttachment(); if (a && a.playing) playing++; }
    return { online: socks.length, playing };
  }

  broadcast() {
    const msg = JSON.stringify({ type: 'live', ...this.counts() });
    for (const s of this.openSockets()) { try { s.send(msg); } catch (e) { /* Verbindung weg */ } }
  }

  webSocketMessage(ws, msg) {
    if (typeof msg !== 'string' || msg.length > 200) return;
    let data;
    try { data = JSON.parse(msg); } catch (e) { return; }
    if (data && typeof data.playing === 'boolean') {
      const a = ws.deserializeAttachment() || {};
      if (a.playing !== data.playing) { ws.serializeAttachment({ ...a, playing: data.playing }); this.broadcast(); }
    }
  }

  webSocketClose(ws, code, reason) {
    try { ws.close(code, reason); } catch (e) { /* schon zu */ }
    this.broadcast();
  }

  webSocketError(ws) {
    try { ws.close(1011, 'error'); } catch (e) { /* schon zu */ }
    this.broadcast();
  }

  // ------------------------------------------------------------ Verwaltung

  async admin(req, url, path) {
    const key = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '') || url.searchParams.get('key') || '';
    if (!this.env.ADMIN_KEY || !safeEqual(key, this.env.ADMIN_KEY)) return json({ error: 'forbidden' }, 403);
    if (path === '/admin/scores') {
      const rows = this.sql.exec(`SELECT id, name, score, round, created, ip FROM scores ORDER BY score DESC, created ASC LIMIT ?`, KEEP_ROWS).toArray();
      return json({ total: rows.length, ...this.counts(), scores: rows });
    }
    if (path === '/admin/delete') {
      const id = url.searchParams.get('id'), name = url.searchParams.get('name'), ip = url.searchParams.get('ip');
      let cur;
      if (id) cur = this.sql.exec(`DELETE FROM scores WHERE id = ?`, Number(id));
      else if (name) cur = this.sql.exec(`DELETE FROM scores WHERE name = ?`, sanitizeName(name));
      else if (ip) cur = this.sql.exec(`DELETE FROM scores WHERE ip = ?`, ip);
      else return json({ error: 'id, name oder ip angeben' }, 400);
      return json({ ok: true, deleted: cur.rowsWritten });
    }
    if (path === '/admin/wipe') {
      if (url.searchParams.get('confirm') !== 'yes') return json({ error: 'confirm=yes fehlt' }, 400);
      const cur = this.sql.exec(`DELETE FROM scores`);
      return json({ ok: true, deleted: cur.rowsWritten });
    }
    return json({ error: 'not-found' }, 404);
  }
}

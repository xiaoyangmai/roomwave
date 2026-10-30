const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { URL } = require('node:url');

const ROOT = __dirname;
const APP_ROOT = path.join(ROOT, 'src');
const PORT = Number(process.env.PORT || 4173);
const DATA_DIR = path.join(APP_ROOT, 'data');
const WARDROBE_FILE = path.join(DATA_DIR, 'wardrobe-state.json');

// The room simulation already ships in the public frontend files. Loading the
// same state modules here keeps the local backend and browser on one model.
for (const file of [
  'roomwave-codec.js',
  'music-catalog.js',
  'gaming-seated-state.js',
  'workout-room-state.js',
  'mia-lilly-room-state.js',
  'baking-room-state.js',
  'fortune-room-state.js',
  'roomwave-engine.js',
]) require(path.join(APP_ROOT, file));

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

const giftValues = Object.freeze({ rose: 1, heart: 100, sunglasses: 200, corgi: 300, gg: 1 });
const catalog = Object.freeze({
  lily: [
    ['casual', 'Casual', 'starter'], ['bunny-hoodie', 'Bunny hoodie', 'cozy'], ['swimsuit', 'Swimsuit', 'summer'],
    ['two-piece', 'Two piece', 'summer'], ['pajamas', 'Pajamas', 'cozy'], ['maid', 'Maid', 'special'],
    ['qipao', 'Qipao', 'special'], ['rezero', 'Re:Zero', 'special'], ['halloween', 'Halloween', 'seasonal'], ['detailed', 'Detailed', 'special'],
  ],
  mia: [
    ['casual', 'Casual', 'starter'], ['cat-hoodie', 'Cat hoodie', 'cozy'], ['swimsuit', 'Swimsuit', 'summer'],
    ['one-piece', 'One piece', 'summer'], ['pajamas', 'Pajamas', 'cozy'], ['maid', 'Maid', 'special'],
    ['qipao', 'Qipao', 'special'], ['rezero', 'Re:Zero', 'special'], ['nun', 'Nun', 'special'], ['halloween', 'Halloween', 'seasonal'], ['detailed', 'Detailed', 'special'],
  ],
  stella: [['casual', 'Casual', 'starter']],
});
const roomCatalog = [
  { id: 'balcony', name: 'Moonlit Balcony', image: 'assets/rooms-v1/room-balcony.lossless.webp', category: 'room', price: 0, owned: true },
];

function makeWardrobeState(shared = false, epoch = 1) {
  const unlocks = { lily: { casual: true }, mia: { casual: true }, stella: { casual: true } };
  const catalogData = Object.fromEntries(Object.entries(catalog).map(([character, items]) => [
    character,
    items.map(([outfit, name, category], index) => ({ outfit, name, category, price: index === 0 ? 0 : 100 + index * 50 })),
  ]));
  return {
    epoch,
    imported: shared,
    lastReset: null,
    points: { balance: shared ? 1000 : 0 },
    wallets: { lily: shared ? 1000 : 0, mia: shared ? 1000 : 0, stella: 0 },
    unlocks,
    equipped: { lily: 'casual', mia: 'casual', stella: 'casual' },
    room: 'balcony',
    rooms: roomCatalog.map(room => ({ ...room })),
    catalog: catalogData,
    characters: [
      { id: 'lily', name: 'Lilly', owned: true, price: 0 },
      { id: 'mia', name: 'Mia', owned: true, price: 0 },
      { id: 'stella', name: 'Stella', owned: shared, price: 300 },
    ],
    activeCast: ['lily', 'mia'],
    upgrades: [{ id: 'remove-hand', name: 'Remove random hand', description: 'Keep the camera clear during reactions.', price: 200, owned: false, equipped: false }],
  };
}

function readSoloStates() {
  try { return JSON.parse(fs.readFileSync(WARDROBE_FILE, 'utf8')); } catch { return {}; }
}

const soloStates = readSoloStates();
let sharedWardrobe = makeWardrobeState(true);
function persistSoloStates() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(WARDROBE_FILE, JSON.stringify(soloStates, null, 2), 'utf8');
}

function clientId(req, res) {
  const cookies = String(req.headers.cookie || '').split(';').map(item => item.trim());
  const existing = cookies.find(item => item.startsWith('roomwave_client='))?.split('=')[1];
  if (existing && /^[0-9a-f-]{20,80}$/i.test(existing)) return existing;
  const id = crypto.randomUUID();
  res.setHeader('Set-Cookie', `roomwave_client=${id}; Path=/; SameSite=Lax`);
  return id;
}

function soloWardrobe(req, res) {
  const id = clientId(req, res);
  if (!soloStates[id]) soloStates[id] = makeWardrobeState(false);
  return soloStates[id];
}

function wardrobeFor(req, res, shared) {
  return shared ? sharedWardrobe : soloWardrobe(req, res);
}

function clone(value) {
  return structuredClone(value);
}

function saveState(shared, id, state) {
  if (shared) sharedWardrobe = state;
  else { soloStates[id] = state; persistSoloStates(); }
}

function findOutfit(state, character, outfit) {
  return state.catalog[character]?.find(item => item.outfit === outfit) || null;
}

function wardrobeAction(state, body) {
  const action = body?.action;
  if (!action) return state;
  if (action === 'import') {
    state.points.balance += Math.max(0, Math.min(1e9, Number(body.coins) || 0));
    state.imported = true;
    return state;
  }
  if (action === 'gift') {
    const amount = giftValues[body.gift] || 0;
    state.points.balance = Math.max(0, state.points.balance + amount);
    if (body.recipient && Object.hasOwn(state.wallets, body.recipient)) state.wallets[body.recipient] += amount;
    return state;
  }
  if (action === 'reset') {
    const next = makeWardrobeState(false, state.epoch + 1);
    next.lastReset = body.receipt || crypto.randomUUID();
    return next;
  }

  if (body.epoch !== state.epoch) {
    const error = new Error('The shop changed in another tab. Refresh and try again.');
    error.status = 409;
    error.state = state;
    throw error;
  }

  if (action === 'purchaseCharacter' && body.character === 'stella') {
    if (state.characters.find(item => item.id === 'stella')?.owned) return state;
    if (state.points.balance < 300) throw Object.assign(new Error('You need 300 coins to unlock Stella.'), { status: 400, state });
    state.points.balance -= 300;
    state.characters.find(item => item.id === 'stella').owned = true;
    return state;
  }
  if (action === 'equipCast') {
    if (!Array.isArray(body.characters) || body.characters.length !== 2 || new Set(body.characters).size !== 2) throw Object.assign(new Error('Choose two different anchors.'), { status: 400, state });
    if (body.characters.some(id => !state.characters.find(item => item.id === id)?.owned)) throw Object.assign(new Error('That character is locked.'), { status: 400, state });
    state.activeCast = body.characters.slice();
    return state;
  }
  if (['purchase', 'equip'].includes(action)) {
    const character = body.character;
    const item = findOutfit(state, character, body.outfit);
    if (!item) throw Object.assign(new Error('That outfit is unavailable.'), { status: 400, state });
    if (!state.unlocks[character]) state.unlocks[character] = {};
    if (!state.unlocks[character][item.outfit]) {
      if (state.points.balance < item.price) throw Object.assign(new Error('Not enough coins.'), { status: 400, state });
      state.points.balance -= item.price;
      state.unlocks[character][item.outfit] = true;
    }
    state.equipped[character] = item.outfit;
    return state;
  }
  if (['purchaseRoom', 'equipRoom'].includes(action)) {
    const room = state.rooms.find(item => item.id === body.room);
    if (!room) throw Object.assign(new Error('That room is unavailable.'), { status: 400, state });
    state.room = room.id;
    return state;
  }
  if (['purchaseUpgrade', 'equipUpgrade', 'unequipUpgrade'].includes(action)) {
    const upgrade = state.upgrades.find(item => item.id === body.upgrade);
    if (!upgrade) throw Object.assign(new Error('That upgrade is unavailable.'), { status: 400, state });
    if (action === 'purchaseUpgrade') {
      if (state.points.balance < upgrade.price) throw Object.assign(new Error('Not enough coins.'), { status: 400, state });
      state.points.balance -= upgrade.price; upgrade.owned = true; upgrade.equipped = true;
    } else if (!upgrade.owned) throw Object.assign(new Error('Purchase this upgrade first.'), { status: 400, state });
    else upgrade.equipped = action === 'equipUpgrade';
    return state;
  }
  return state;
}

const rooms = new Map();
function roomState(room) {
  if (!rooms.has(room)) rooms.set(room, { engine: globalThis.RoomwaveEngine.create(room), revision: 0, connections: new Set(), lastTick: Date.now() });
  return rooms.get(room);
}

function syncRoom(state) {
  const now = Date.now();
  state.engine.advance(Math.max(0, Math.min(10000, now - state.lastTick)));
  state.lastTick = now;
}

function sendJson(res, status, value, extraHeaders = {}) {
  const body = JSON.stringify(value);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...extraHeaders });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', chunk => { size += chunk.length; if (size <= 1024 * 1024) chunks.push(chunk); });
    req.on('end', () => { try { resolve(size ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {}); } catch { reject(new Error('Invalid JSON')); } });
    req.on('error', reject);
  });
}

function safeStaticPath(urlPath) {
  const decoded = decodeURIComponent(urlPath);
  const clean = decoded === '/together' || decoded === '/together/' ? '/together/index.html'
    : decoded === '/solo' || decoded === '/solo/' ? '/solo/index.html'
      : decoded === '/' ? '/index.html' : decoded;
  let target = path.resolve(APP_ROOT, `.${clean}`);
  if (target !== APP_ROOT && fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target, 'index.html');
  if (target !== APP_ROOT && !target.startsWith(`${APP_ROOT}${path.sep}`)) return null;
  return target;
}

async function handle(req, res) {
  const url = new URL(req.url || '/', `http://${req.headers.host || '127.0.0.1'}`);
  try {
    if (url.pathname === '/api/visits' && req.method === 'POST') {
      const body = await readBody(req); const count = Math.max(1, Number(body.visitId ? 7 : 1));
      return sendJson(res, 200, { visits: count });
    }
    if (url.pathname === '/api/wardrobe') {
      const shared = url.searchParams.get('mode') === 'together';
      const id = shared ? null : clientId(req, res);
      let state = wardrobeFor(req, res, shared);
      if (req.method === 'POST') {
        try {
          const body = await readBody(req);
          state = clone(state);
          state = wardrobeAction(state, body);
          saveState(shared, id, state);
        } catch (error) {
          return sendJson(res, error.status || 400, { error: error.message || 'Could not save.', state: error.state || state });
        }
      }
      return sendJson(res, 200, clone(state));
    }
    if (url.pathname === '/api/rooms' && req.method === 'POST') {
      const body = await readBody(req);
      const room = body.room;
      if (!globalThis.RoomwaveEngine.rooms.includes(room)) return sendJson(res, 400, { error: 'Unknown room.' });
      const state = roomState(room);
      syncRoom(state);
      if (body.connection) state.connections.add(String(body.connection));
      if (body.leave) { if (body.connection) state.connections.delete(String(body.connection)); return sendJson(res, 200, { ok: true, serverNow: Date.now() }); }
      let outcome = null;
      if (body.command) {
        outcome = state.engine.command(body.command.method, body.command.args, body.command.epoch);
        if (outcome.accepted) state.revision++;
      }
      return sendJson(res, 200, { revision: state.revision, checkpoint: state.engine.checkpoint(), snapshotAge: 0, serverNow: Date.now(), people: Math.max(1, state.connections.size), outcome });
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') return sendJson(res, 405, { error: 'Method not allowed.' });
    const staticPath = url.pathname === '/favicon.ico' ? '/favicon.svg' : url.pathname;
    const file = safeStaticPath(staticPath);
    if (!file || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); return res.end('Not found'); }
    const stream = fs.createReadStream(file);
    res.writeHead(200, { 'Content-Type': MIME_TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    if (req.method === 'HEAD') return res.end();
    stream.pipe(res);
  } catch (error) {
    sendJson(res, 500, { error: error.message || 'Server error' });
  }
}

const server = http.createServer((req, res) => { void handle(req, res); });
server.listen(PORT, '127.0.0.1', () => console.log(`Roomwave server running at http://127.0.0.1:${PORT}/together/`));

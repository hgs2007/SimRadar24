const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORT = Number(process.env.PORT || 8080);
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, "data");
const BOOKINGS_PATH = path.join(DATA_DIR, "bookings.json");
const IS_VERCEL = Boolean(process.env.VERCEL);
const AIRLINES_PATH = path.join(ROOT, "airlines_icao_real.json");
const VATSIM_DATA_URL = "https://data.vatsim.net/v3/vatsim-data.json";
const STATSIM_BASE_URL = "https://api.statsim.net";
const STATSIM_API_KEY = process.env.STATSIM_API_KEY || "";
const AIRPORTS_DATA_URL = "https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat";
const POLL_INTERVAL_MS = 15000;
const REQUEST_TIMEOUT_MS = 15000;
const STATSIM_REQUEST_TIMEOUT_MS = 60000;
const STATSIM_CACHE_MS = 10 * 60 * 1000;
const SEARCH_RESULT_LIMIT = 24;
const TURNAROUND_MINUTES = 95;
const ACTIVE_GROUND_SPEED_MAX = 30;
const HISTORY_LOOKBACK_DAYS = 2;
const WEEKLY_FREQUENCY_LOOKBACK_DAYS = 7;
const MAX_ITINERARY_LEGS = 3;
const MAX_ITINERARY_RESULTS = 8;
const MAX_ROUTES_PER_AIRPORT = 18;
const MIN_CONNECTION_MINUTES = 75;
const ITINERARY_SEARCH_TIMEOUT_MS = 8000;

const GLOBAL_HUBS = [
  "KDFW", "KJFK", "KLAX", "KATL", "KMIA", "CYYZ",
  "EGLL", "LFPG", "EHAM", "EDDF", "LTFM",
  "OMDB", "OTHH", "VIDP", "VOMM", "WSSS", "RJTT", "RKSI", "VHHH", "ZBAA",
];

const CONTENT_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
};

const airlineNames = fs.existsSync(AIRLINES_PATH)
  ? JSON.parse(fs.readFileSync(AIRLINES_PATH, "utf8"))
  : {};

const airlineBranding = {
  AAL: { color: "#ba0c2f", accent: "#7c1027" },
  AAR: { color: "#cc8a00", accent: "#111827" },
  AFR: { color: "#1b4fa8", accent: "#e4002b" },
  BAW: { color: "#1f3f8f", accent: "#c8102e" },
  DAL: { color: "#c8102e", accent: "#0f172a" },
  DLH: { color: "#05164d", accent: "#f5c542" },
  JBU: { color: "#0047ba", accent: "#0b5fff" },
  KLM: { color: "#0098db", accent: "#0b2447" },
  QFA: { color: "#d71920", accent: "#5c1119" },
  QTR: { color: "#5c1635", accent: "#ae8d54" },
  SIA: { color: "#0f3b82", accent: "#d4af37" },
  THY: { color: "#d71920", accent: "#27374d" },
  UAL: { color: "#005daa", accent: "#0d274d" },
  UAE: { color: "#d71920", accent: "#00732f" },
};

const boardingPassThemes = {
  AAL: { primary: "#ba0c2f", secondary: "#1f365c", accent: "#d9b36f", ink: "#ffffff", uiFont: "manrope", displayFont: "playfair" },
  AFR: { primary: "#1b4fa8", secondary: "#102a52", accent: "#e4002b", ink: "#ffffff", uiFont: "manrope", displayFont: "cormorant" },
  BAW: { primary: "#1f3f8f", secondary: "#13254a", accent: "#d1b06a", ink: "#ffffff", uiFont: "manrope", displayFont: "playfair" },
  DAL: { primary: "#c8102e", secondary: "#11213e", accent: "#8fa6c3", ink: "#ffffff", uiFont: "manrope", displayFont: "cormorant" },
  DLH: { primary: "#05164d", secondary: "#0c245f", accent: "#f5c542", ink: "#ffffff", uiFont: "manrope", displayFont: "playfair" },
  JBU: { primary: "#0047ba", secondary: "#0b2a68", accent: "#67d2ff", ink: "#ffffff", uiFont: "manrope", displayFont: "cormorant" },
  KLM: { primary: "#0098db", secondary: "#0d3352", accent: "#9fe4ff", ink: "#ffffff", uiFont: "manrope", displayFont: "cormorant" },
  QFA: { primary: "#d71920", secondary: "#420d14", accent: "#f5d7d8", ink: "#ffffff", uiFont: "manrope", displayFont: "playfair" },
  QTR: { primary: "#5c1635", secondary: "#2f0f1e", accent: "#b9995a", ink: "#ffffff", uiFont: "manrope", displayFont: "playfair" },
  SIA: { primary: "#0f3b82", secondary: "#071d43", accent: "#d4af37", ink: "#ffffff", uiFont: "manrope", displayFont: "playfair" },
  THY: { primary: "#d71920", secondary: "#3f0c11", accent: "#f0d6d7", ink: "#ffffff", uiFont: "manrope", displayFont: "cormorant" },
  UAL: { primary: "#005daa", secondary: "#08284a", accent: "#5ca9ff", ink: "#ffffff", uiFont: "manrope", displayFont: "cormorant" },
  UAE: { primary: "#d71920", secondary: "#0a5c2a", accent: "#ffffff", ink: "#ffffff", uiFont: "manrope", displayFont: "playfair" },
};

const aircraftCatalog = {
  A20N: { name: "Airbus A320neo", family: "narrow" },
  A21N: { name: "Airbus A321neo", family: "narrow" },
  A319: { name: "Airbus A319", family: "narrow" },
  A320: { name: "Airbus A320", family: "narrow" },
  A321: { name: "Airbus A321", family: "narrow" },
  A332: { name: "Airbus A330-200", family: "wide" },
  A333: { name: "Airbus A330-300", family: "wide" },
  A339: { name: "Airbus A330-900neo", family: "wide" },
  A343: { name: "Airbus A340-300", family: "wide" },
  A359: { name: "Airbus A350-900", family: "wide" },
  A35K: { name: "Airbus A350-1000", family: "wide" },
  A388: { name: "Airbus A380-800", family: "super" },
  AT72: { name: "ATR 72", family: "regional" },
  B38M: { name: "Boeing 737 MAX 8", family: "narrow" },
  B39M: { name: "Boeing 737 MAX 9", family: "narrow" },
  B737: { name: "Boeing 737", family: "narrow" },
  B738: { name: "Boeing 737-800", family: "narrow" },
  B739: { name: "Boeing 737-900", family: "narrow" },
  B744: { name: "Boeing 747-400", family: "wide" },
  B748: { name: "Boeing 747-8", family: "wide" },
  B752: { name: "Boeing 757-200", family: "narrow" },
  B763: { name: "Boeing 767-300", family: "wide" },
  B772: { name: "Boeing 777-200", family: "wide" },
  B77L: { name: "Boeing 777-200LR", family: "wide" },
  B77W: { name: "Boeing 777-300ER", family: "wide" },
  B788: { name: "Boeing 787-8", family: "wide" },
  B789: { name: "Boeing 787-9", family: "wide" },
  B78X: { name: "Boeing 787-10", family: "wide" },
  CRJ7: { name: "CRJ-700", family: "regional" },
  CRJ9: { name: "CRJ-900", family: "regional" },
  DH8D: { name: "Dash 8 Q400", family: "regional" },
  E170: { name: "Embraer 170", family: "regional" },
  E175: { name: "Embraer 175", family: "regional" },
  E190: { name: "Embraer 190", family: "regional" },
  E195: { name: "Embraer 195", family: "regional" },
};

const specificSeatTemplates = {
  "QTR|B77W": {
    label: "Qatar Airways 777-300ER",
    cabins: [
      { cabin: "business", rows: range(1, 6), columns: ["A", "C", "D", "G", "H", "K"], premiumRows: [] },
      { cabin: "economy_plus", rows: range(10, 14), columns: ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K"], premiumRows: [10] },
      { cabin: "economy", rows: range(15, 43), columns: ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K"], premiumRows: [15, 29] },
    ],
  },
  "QTR|A35K": {
    label: "Qatar Airways A350-1000",
    cabins: [
      { cabin: "business", rows: range(1, 9), columns: ["A", "D", "G", "K"], premiumRows: [] },
      { cabin: "economy_plus", rows: range(11, 14), columns: ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K"], premiumRows: [11] },
      { cabin: "economy", rows: range(15, 41), columns: ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K"], premiumRows: [26] },
    ],
  },
  "UAE|A388": {
    label: "Emirates A380-800",
    cabins: [
      { cabin: "first", rows: range(1, 4), columns: ["A", "E", "F", "K"], premiumRows: [] },
      { cabin: "business", rows: range(6, 14), columns: ["A", "C", "D", "G", "H", "K"], premiumRows: [] },
      { cabin: "economy_plus", rows: range(43, 47), columns: ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K"], premiumRows: [43] },
      { cabin: "economy", rows: range(48, 88), columns: ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K"], premiumRows: [67] },
    ],
  },
  "DAL|A359": {
    label: "Delta A350-900",
    cabins: [
      { cabin: "business", rows: range(1, 8), columns: ["A", "D", "G", "K"], premiumRows: [] },
      { cabin: "economy_plus", rows: range(20, 24), columns: ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K"], premiumRows: [20] },
      { cabin: "economy", rows: range(25, 47), columns: ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K"], premiumRows: [31] },
    ],
  },
  "KLM|B77W": {
    label: "KLM 777-300ER",
    cabins: [
      { cabin: "business", rows: range(1, 8), columns: ["A", "C", "D", "G", "H", "K"], premiumRows: [] },
      { cabin: "economy_plus", rows: range(9, 13), columns: ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K"], premiumRows: [9] },
      { cabin: "economy", rows: range(14, 44), columns: ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K"], premiumRows: [30] },
    ],
  },
  "UAL|B77W": {
    label: "United 777-300ER",
    cabins: [
      { cabin: "business", rows: range(1, 9), columns: ["A", "D", "G", "L"], premiumRows: [] },
      { cabin: "economy_plus", rows: range(20, 24), columns: ["A", "B", "C", "D", "E", "F", "G", "H", "J", "L"], premiumRows: [20] },
      { cabin: "economy", rows: range(25, 56), columns: ["A", "B", "C", "D", "E", "F", "G", "H", "J", "L"], premiumRows: [39] },
    ],
  },
  "AAL|B788": {
    label: "American 787-8",
    cabins: [
      { cabin: "business", rows: range(1, 6), columns: ["A", "D", "G", "L"], premiumRows: [] },
      { cabin: "economy_plus", rows: range(10, 13), columns: ["A", "B", "C", "D", "E", "F", "G", "H", "J", "L"], premiumRows: [10] },
      { cabin: "economy", rows: range(14, 35), columns: ["A", "B", "C", "D", "E", "F", "G", "H", "J", "L"], premiumRows: [22] },
    ],
  },
  "SIA|A359": {
    label: "Singapore Airlines A350-900",
    cabins: [
      { cabin: "business", rows: range(11, 20), columns: ["A", "D", "F", "K"], premiumRows: [] },
      { cabin: "premium_economy", rows: range(31, 35), columns: ["A", "C", "D", "E", "F", "H", "K"], premiumRows: [31] },
      { cabin: "economy", rows: range(41, 66), columns: ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K"], premiumRows: [41] },
    ],
  },
};

const genericSeatTemplates = {
  narrow: {
    label: "Standard narrowbody",
    cabins: [
      { cabin: "business", rows: range(1, 4), columns: ["A", "C", "D", "F"], premiumRows: [] },
      { cabin: "economy_plus", rows: range(5, 8), columns: ["A", "B", "C", "D", "E", "F"], premiumRows: [5] },
      { cabin: "economy", rows: range(9, 31), columns: ["A", "B", "C", "D", "E", "F"], premiumRows: [16] },
    ],
  },
  regional: {
    label: "Standard regional jet",
    cabins: [
      { cabin: "economy_plus", rows: range(1, 3), columns: ["A", "C", "D", "F"], premiumRows: [1] },
      { cabin: "economy", rows: range(4, 19), columns: ["A", "C", "D", "F"], premiumRows: [8] },
    ],
  },
  wide: {
    label: "Standard twin-aisle",
    cabins: [
      { cabin: "business", rows: range(1, 8), columns: ["A", "D", "G", "K"], premiumRows: [] },
      { cabin: "economy_plus", rows: range(10, 14), columns: ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K"], premiumRows: [10] },
      { cabin: "economy", rows: range(15, 42), columns: ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K"], premiumRows: [28] },
    ],
  },
  super: {
    label: "High-capacity widebody",
    cabins: [
      { cabin: "first", rows: range(1, 3), columns: ["A", "E", "F", "K"], premiumRows: [] },
      { cabin: "business", rows: range(4, 10), columns: ["A", "C", "D", "G", "H", "K"], premiumRows: [] },
      { cabin: "economy_plus", rows: range(30, 35), columns: ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K"], premiumRows: [30] },
      { cabin: "economy", rows: range(36, 74), columns: ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K"], premiumRows: [53] },
    ],
  },
};

let latestSnapshot = null;
let lastSuccessAt = null;
let lastError = null;
let pollInFlight = null;
let airportsByIcao = null;
let airportLoadPromise = null;
let bookingsPersistenceWarningShown = false;
let bookingsState = loadBookingsState();
const searchFlightCache = new Map();
const statsimCache = new Map();
const routeHistoryCache = new Map();

function range(start, end) {
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function ensureDataDir() {
  if (IS_VERCEL) {
    return;
  }

  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadBookingsState() {
  const emptyState = { version: 1, bookings: [], reservedSeatsByFlight: {} };

  if (IS_VERCEL) {
    return emptyState;
  }

  ensureDataDir();

  if (!fs.existsSync(BOOKINGS_PATH)) {
    fs.writeFileSync(BOOKINGS_PATH, JSON.stringify(emptyState, null, 2));
    return emptyState;
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(BOOKINGS_PATH, "utf8"));
    return {
      version: 1,
      bookings: Array.isArray(parsed.bookings) ? parsed.bookings : [],
      reservedSeatsByFlight: parsed.reservedSeatsByFlight && typeof parsed.reservedSeatsByFlight === "object"
        ? parsed.reservedSeatsByFlight
        : {},
    };
  } catch {
    return emptyState;
  }
}

function persistBookingsState() {
  if (IS_VERCEL) {
    if (!bookingsPersistenceWarningShown) {
      bookingsPersistenceWarningShown = true;
      console.warn("[airline-backend] Running on Vercel without persistent booking storage; reservations are instance-local.");
    }
    return;
  }

  ensureDataDir();
  fs.writeFileSync(BOOKINGS_PATH, JSON.stringify(bookingsState, null, 2));
}

function sendJson(response, statusCode, payload) {
  const body = Buffer.from(JSON.stringify(payload));
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Content-Length": body.length,
  });
  response.end(body);
}

function sendText(response, statusCode, payload) {
  const body = Buffer.from(payload);
  response.writeHead(statusCode, {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store",
    "Content-Length": body.length,
  });
  response.end(body);
}

async function readJsonBody(request) {
  const chunks = [];

  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const raw = Buffer.concat(chunks).toString("utf8").trim();

  if (!raw) {
    return {};
  }

  return JSON.parse(raw);
}

async function fetchJson(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs || REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      cache: "no-store",
      headers: {
        "User-Agent": "VATSIMAirlineMock/1.0",
        Accept: "application/json",
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      throw new Error(`${url} returned ${response.status}`);
    }

    return await response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

async function fetchText(url) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      cache: "no-store",
      headers: {
        "User-Agent": "VATSIMAirlineMock/1.0",
        Accept: "text/plain, text/csv, */*",
      },
    });

    if (!response.ok) {
      throw new Error(`${url} returned ${response.status}`);
    }

    return await response.text();
  } finally {
    clearTimeout(timeoutId);
  }
}

async function fetchVatsimSnapshot() {
  const data = await fetchJson(VATSIM_DATA_URL);
  latestSnapshot = {
    ...data,
    _backend: {
      source: VATSIM_DATA_URL,
      lastSuccessAt: new Date().toISOString(),
      statsimEnabled: Boolean(STATSIM_API_KEY),
    },
  };
  lastSuccessAt = new Date();
  lastError = null;
}

async function pollVatsimSnapshot() {
  if (pollInFlight) {
    return pollInFlight;
  }

  pollInFlight = fetchVatsimSnapshot()
    .catch((error) => {
      lastError = error instanceof Error ? error.message : String(error);
      console.error("[airline-backend] Poll failed:", error);
      return null;
    })
    .finally(() => {
      pollInFlight = null;
    });

  return pollInFlight;
}

async function ensureFreshSnapshot() {
  const snapshotAgeMs =
    lastSuccessAt instanceof Date
      ? Date.now() - lastSuccessAt.getTime()
      : Number.POSITIVE_INFINITY;

  if (!latestSnapshot || snapshotAgeMs > POLL_INTERVAL_MS) {
    await pollVatsimSnapshot();
  }
}

function startPolling() {
  pollVatsimSnapshot();
  setInterval(pollVatsimSnapshot, POLL_INTERVAL_MS);
}

function splitCsvLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];

    if (character === "\"") {
      if (inQuotes && line[index + 1] === "\"") {
        current += "\"";
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (character === "," && !inQuotes) {
      result.push(current);
      current = "";
      continue;
    }

    current += character;
  }

  result.push(current);
  return result;
}

async function getAirportIndex() {
  if (airportsByIcao) {
    return airportsByIcao;
  }

  if (airportLoadPromise) {
    return airportLoadPromise;
  }

  airportLoadPromise = fetchText(AIRPORTS_DATA_URL)
    .then((raw) => {
      const map = new Map();
      const rows = raw.split(/\r?\n/);

      for (const row of rows) {
        if (!row) {
          continue;
        }

        const fields = splitCsvLine(row);
        const icao = (fields[5] || "").replace(/"/g, "").trim().toUpperCase();

        if (!icao || icao === "\\N") {
          continue;
        }

        map.set(icao, {
          name: (fields[1] || "").replace(/"/g, "").trim(),
          city: (fields[2] || "").replace(/"/g, "").trim(),
          country: (fields[3] || "").replace(/"/g, "").trim(),
          iata: (fields[4] || "").replace(/"/g, "").trim(),
          icao,
          latitude: Number(fields[6]),
          longitude: Number(fields[7]),
          timezone: (fields[11] || "").replace(/"/g, "").trim() || null,
        });
      }

      airportsByIcao = map;
      return map;
    })
    .catch((error) => {
      console.error("[airline-backend] Airport data failed:", error);
      airportsByIcao = new Map();
      return airportsByIcao;
    })
    .finally(() => {
      airportLoadPromise = null;
    });

  return airportLoadPromise;
}

function normalizeIcao(value) {
  return String(value || "").trim().toUpperCase();
}

function normalizeAircraftCode(value) {
  const raw = normalizeIcao(value);

  if (!raw) {
    return "";
  }

  if (aircraftCatalog[raw]) {
    return raw;
  }

  const tokens = raw.split(/[^A-Z0-9]+/).filter(Boolean);

  for (const token of tokens) {
    if (aircraftCatalog[token]) {
      return token;
    }
  }

  const embeddedMatch = raw.match(/[A-Z]\d{2}[A-Z]?|B\d{3}[A-Z]?|CRJ\d|E\d{3}|AT\d{2}|DH8D|MD11/);

  if (embeddedMatch && aircraftCatalog[embeddedMatch[0]]) {
    return embeddedMatch[0];
  }

  return raw;
}

function sanitizePassengers(rawValue, fallback = 1) {
  const numeric = Number(rawValue);

  if (!Number.isFinite(numeric)) {
    return fallback;
  }

  return Math.max(1, Math.min(9, Math.round(numeric)));
}

function sanitizeCheckedBags(rawValue, passengerCount) {
  const numeric = Number(rawValue);

  if (!Number.isFinite(numeric)) {
    return 0;
  }

  return Math.max(0, Math.min(passengerCount * 4, Math.round(numeric)));
}

function extractAirlineCode(callsign) {
  const match = String(callsign || "").toUpperCase().match(/^[A-Z]{3}/);
  return match ? match[0] : "GEN";
}

function getAirlineName(airlineCode) {
  return airlineNames[airlineCode] || `${airlineCode} Airways`;
}

function getBoardingPassTheme(airlineCode) {
  return boardingPassThemes[airlineCode] || {
    primary: "#17304f",
    secondary: "#27486d",
    accent: "#f4b678",
    ink: "#ffffff",
    uiFont: "manrope",
    displayFont: "cormorant",
  };
}

function getAircraftMeta(aircraftCode) {
  const normalized = normalizeAircraftCode(aircraftCode);

  if (aircraftCatalog[normalized]) {
    return aircraftCatalog[normalized];
  }

  if (/^(A33|A34|A35|A38|B74|B76|B77|B78)/.test(normalized)) {
    return { name: normalized, family: "wide" };
  }

  if (/^(CRJ|E17|E19|AT|DH8)/.test(normalized)) {
    return { name: normalized, family: "regional" };
  }

  return { name: normalized || "Unknown aircraft", family: "narrow" };
}

function isGroundFlight(pilot) {
  const groundspeed = Number(pilot?.groundspeed || 0);
  const altitude = Number(pilot?.altitude || 0);
  return groundspeed <= ACTIVE_GROUND_SPEED_MAX && altitude <= 1500;
}

function parseDofFromRemarks(remarks) {
  const match = String(remarks || "").match(/DOF\/(\d{2})(\d{2})(\d{2})/i);

  if (!match) {
    return null;
  }

  const [, year, month, day] = match;
  return {
    year: Number(`20${year}`),
    month: Number(month) - 1,
    day: Number(day),
  };
}

function parseScheduledDepartureDate(entity) {
  const scheduled = parseFiledDepartureDate(entity);

  if (!scheduled) {
    return buildRealisticDepartureDate(entity).toISOString();
  }

  if (isFiledDeparturePlausible(entity, scheduled)) {
    return scheduled.toISOString();
  }

  return buildRealisticDepartureDate(entity).toISOString();
}

function parseFiledDepartureDate(entity) {
  const flightPlan = entity?.flight_plan || {};
  const departureRaw = String(flightPlan.deptime || "").replace(/[^\d]/g, "").padStart(4, "0");

  if (departureRaw.length !== 4) {
    return null;
  }

  const parsedHours = Number(departureRaw.slice(0, 2));
  const parsedMinutes = Number(departureRaw.slice(2, 4));

  if (!Number.isFinite(parsedHours) || !Number.isFinite(parsedMinutes) || parsedHours > 23 || parsedMinutes > 59) {
    return null;
  }

  const referenceDof = parseDofFromRemarks(flightPlan.remarks);
  const base = new Date();
  return referenceDof
    ? new Date(Date.UTC(referenceDof.year, referenceDof.month, referenceDof.day, parsedHours, parsedMinutes, 0, 0))
    : new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate(), parsedHours, parsedMinutes, 0, 0));
}

function isFiledDeparturePlausible(entity, scheduled) {
  const now = new Date();
  const scheduledDiffMinutes = Math.round((scheduled.getTime() - now.getTime()) / 60000);
  const isGrounded = entity?.groundspeed !== undefined && isGroundFlight(entity);

  if (!isGrounded) {
    return scheduledDiffMinutes >= -240;
  }

  if (scheduledDiffMinutes >= -90 && scheduledDiffMinutes <= 24 * 60) {
    return true;
  }

  return false;
}

function buildRealisticDepartureDate(entity) {
  const now = new Date();
  const groundspeed = Number(entity?.groundspeed || 0);
  const minutesUntilDeparture =
    groundspeed > 5 ? 18
    : entity?.flight_plan?.route ? 42
    : 70;

  return new Date(now.getTime() + minutesUntilDeparture * 60000);
}

function parseDurationMinutes(enrouteTime) {
  const raw = String(enrouteTime || "").replace(/[^\d]/g, "");

  if (raw.length < 3) {
    return 120;
  }

  const padded = raw.padStart(4, "0");
  const hours = Number(padded.slice(0, 2));
  const minutes = Number(padded.slice(2, 4));
  return Math.max(35, (hours * 60) + minutes);
}

function addMinutes(timestamp, minutes) {
  return new Date(new Date(timestamp).getTime() + minutes * 60 * 1000).toISOString();
}

function makeFlightId(parts) {
  return crypto.createHash("sha1").update(parts.join("|")).digest("hex").slice(0, 16);
}

function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return `${hours}h ${String(remaining).padStart(2, "0")}m`;
}

function toTitleCase(rawValue) {
  return String(rawValue || "")
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function inferFlightNumber(callsign) {
  const match = String(callsign || "").match(/\d+[A-Z]*$/);
  return match ? match[0] : "0001";
}

function getReservedSeats(flightId) {
  return new Set(bookingsState.reservedSeatsByFlight[flightId] || []);
}

function hashToUnitInterval(value) {
  const hash = crypto.createHash("sha1").update(String(value)).digest();
  const integer = hash.readUInt32BE(0);
  return integer / 0xffffffff;
}

function getSyntheticOccupancyRatio(flight) {
  const base =
    flight.sourceType === "active_ground" ? 0.88
    : flight.sourceType === "prefiled" ? 0.82
    : 0.9;
  const variance = (hashToUnitInterval(`${flight.id}|load`) * 0.12) - 0.04;
  return Math.max(0.72, Math.min(0.98, base + variance));
}

function buildSyntheticReservedSeatSet(flight, allSeatIds, realReservedSeats) {
  const targetOpenSeats =
    flight.sourceType === "active_ground"
      ? Math.max(1, Math.min(5, Math.round(1 + (hashToUnitInterval(`${flight.id}|lastseats`) * 4))))
      : Math.max(8, Math.min(28, Math.round(allSeatIds.length * (1 - getSyntheticOccupancyRatio(flight)))));
  const openSeatSet = new Set();
  const scoredSeats = allSeatIds
    .map((seatId) => ({
      seatId,
      score: hashToUnitInterval(`${flight.id}|seat|${seatId}`),
    }))
    .sort((left, right) => left.score - right.score);

  for (const entry of scoredSeats) {
    if (openSeatSet.size >= targetOpenSeats) {
      break;
    }

    if (realReservedSeats.has(entry.seatId)) {
      continue;
    }

    openSeatSet.add(entry.seatId);
  }

  const syntheticReservedSeats = new Set();

  for (const seatId of allSeatIds) {
    if (realReservedSeats.has(seatId)) {
      syntheticReservedSeats.add(seatId);
      continue;
    }

    if (!openSeatSet.has(seatId)) {
      syntheticReservedSeats.add(seatId);
    }
  }

  return syntheticReservedSeats;
}

function chooseSeatTemplate(airlineCode, aircraftCode) {
  const specific = specificSeatTemplates[`${airlineCode}|${aircraftCode}`];

  if (specific) {
    return specific;
  }

  const family = getAircraftMeta(aircraftCode).family;
  return genericSeatTemplates[family] || genericSeatTemplates.narrow;
}

function buildSeatMap(flight) {
  const template = chooseSeatTemplate(flight.airlineCode, flight.aircraftCode);
  const realReservedSeats = getReservedSeats(flight.id);
  const allSeatIds = template.cabins.flatMap((cabinDefinition) => {
    return cabinDefinition.rows.flatMap((rowNumber) => {
      return cabinDefinition.columns.map((column) => `${rowNumber}${column}`);
    });
  });
  const reservedSeats = buildSyntheticReservedSeatSet(flight, allSeatIds, realReservedSeats);
  const cabins = [];
  let availableSeatCount = 0;

  for (const cabinDefinition of template.cabins) {
    const rows = [];

    for (const rowNumber of cabinDefinition.rows) {
      const seats = [];

      for (const column of cabinDefinition.columns) {
        const seatId = `${rowNumber}${column}`;
        const category =
          cabinDefinition.cabin === "first" || cabinDefinition.cabin === "business"
            ? "premium"
            : cabinDefinition.premiumRows.includes(rowNumber) || cabinDefinition.cabin === "economy_plus" || cabinDefinition.cabin === "premium_economy"
              ? "extra_legroom"
              : "standard";
        const isReserved = reservedSeats.has(seatId);

        if (!isReserved) {
          availableSeatCount += 1;
        }

        seats.push({
          id: seatId,
          column,
          status: isReserved ? "reserved" : "available",
          category,
          cabin: cabinDefinition.cabin,
          priceDelta:
            category === "premium" ? 185
            : category === "extra_legroom" ? 48
            : 0,
        });
      }

      rows.push({
        number: rowNumber,
        seats,
      });
    }

    cabins.push({
      cabin: cabinDefinition.cabin,
      label: cabinDefinition.cabin.replace(/_/g, " "),
      rows,
    });
  }

  return {
    label: template.label,
    cabins,
    availableSeatCount,
  };
}

function enrichAirport(airportMap, icao) {
  const airport = airportMap.get(icao);

  if (!airport) {
    return {
      icao,
      label: icao,
      city: "",
      country: "",
      latitude: null,
      longitude: null,
      timezone: null,
    };
  }

  return {
    icao,
    label: `${airport.city || airport.name} (${icao})`,
    name: airport.name,
    city: airport.city,
    country: airport.country,
    latitude: airport.latitude,
    longitude: airport.longitude,
    timezone: airport.timezone || null,
  };
}

function haversineMiles(origin, destination) {
  if (!origin || !destination) {
    return null;
  }

  const toRadians = (degrees) => (degrees * Math.PI) / 180;
  const earthRadiusMiles = 3958.8;
  const deltaLat = toRadians(destination.latitude - origin.latitude);
  const deltaLon = toRadians(destination.longitude - origin.longitude);
  const lat1 = toRadians(origin.latitude);
  const lat2 = toRadians(destination.latitude);
  const a = Math.sin(deltaLat / 2) ** 2
    + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;

  return Math.round(earthRadiusMiles * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function estimateDistanceMiles(originAirport, destinationAirport) {
  const exactDistance = haversineMiles(originAirport, destinationAirport);

  if (exactDistance) {
    return exactDistance;
  }

  const originIcao = originAirport?.icao || "";
  const destinationIcao = destinationAirport?.icao || "";

  if (originIcao.slice(0, 1) === destinationIcao.slice(0, 1)) {
    return 550;
  }

  if (originIcao.slice(0, 2) === destinationIcao.slice(0, 2)) {
    return 820;
  }

  return 3100;
}

function getHistoryWindow(days = HISTORY_LOOKBACK_DAYS) {
  const to = new Date();
  const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);
  return {
    from: from.toISOString(),
    to: to.toISOString(),
    days,
  };
}

function average(numbers) {
  if (!numbers.length) {
    return 0;
  }

  return numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
}

function pickPrimaryAircraftCode(aircraftCounts) {
  let bestAircraft = "";
  let bestCount = -1;

  for (const [aircraftCode, count] of aircraftCounts.entries()) {
    if (count > bestCount) {
      bestAircraft = aircraftCode;
      bestCount = count;
    }
  }

  return bestAircraft;
}

function buildRouteKey(origin, destination) {
  return `${origin}|${destination}`;
}

function isPrefiledFlightCanceled(departureIso) {
  const departureTime = new Date(departureIso).getTime();

  if (!Number.isFinite(departureTime)) {
    return false;
  }

  return (Date.now() - departureTime) >= 120 * 60000;
}

function computeFare(flight, context) {
  const passengerCount = sanitizePassengers(context.passengers, 1);
  const checkedBags = sanitizeCheckedBags(context.checkedBags, passengerCount);
  const basePerPassenger = 48 + (flight.distanceMiles * 0.115);
  const demandMultiplier =
    flight.sourceType === "active_ground" ? 2.35
    : flight.sourceType === "prefiled" ? 1.07
    : 0.94;
  const widebodyMultiplier = getAircraftMeta(flight.aircraftCode).family === "regional"
    ? 0.84
    : getAircraftMeta(flight.aircraftCode).family === "narrow"
      ? 1
      : 1.12;
  const airlineMultiplier =
    ["QTR", "UAE", "SIA", "KLM", "BAW"].includes(flight.airlineCode) ? 1.12
    : ["DAL", "UAL", "AAL", "AFR", "DLH"].includes(flight.airlineCode) ? 1.05
    : 1;
  const passengerFare = Math.round(basePerPassenger * demandMultiplier * widebodyMultiplier * airlineMultiplier);
  const bagFees = checkedBags * 42;
  const subtotal = (passengerFare * passengerCount) + bagFees;
  const taxes = Math.round(subtotal * 0.118);

  return {
    passengerCount,
    checkedBags,
    passengerFare,
    subtotal,
    taxes,
    total: subtotal + taxes,
    currency: "USD",
  };
}

function buildFlightFromEntity(entity, sourceType, airportMap) {
  const flightPlan = entity?.flight_plan;

  if (!flightPlan) {
    return null;
  }

  const origin = normalizeIcao(flightPlan.departure);
  const destination = normalizeIcao(flightPlan.arrival);

  if (!origin || !destination || origin === destination) {
    return null;
  }

  const airlineCode = extractAirlineCode(entity.callsign);
  const aircraftCode = normalizeAircraftCode(flightPlan.aircraft_short || flightPlan.aircraft_faa || flightPlan.aircraft);
  const departureIso = parseScheduledDepartureDate(entity);
  const durationMinutes = parseDurationMinutes(flightPlan.enroute_time);
  const arrivalIso = addMinutes(departureIso, durationMinutes);
  const originAirport = enrichAirport(airportMap, origin);
  const destinationAirport = enrichAirport(airportMap, destination);
  const distanceMiles = estimateDistanceMiles(originAirport, destinationAirport);
  const branding = airlineBranding[airlineCode] || { color: "#12486b", accent: "#ff6b4a" };
  const isCanceled = sourceType === "prefiled" && isPrefiledFlightCanceled(departureIso);
  const id = makeFlightId([
    sourceType,
    entity.callsign,
    origin,
    destination,
    aircraftCode,
    departureIso.slice(0, 16),
    entity.cid || entity.logon_time || entity.last_updated || "",
  ]);

  const flight = {
    id,
    sourceType,
    sourceLabel:
      sourceType === "active_ground" ? "Live aircraft on the ground"
      : sourceType === "prefiled" ? (isCanceled ? "Canceled" : "Scheduled")
      : "Likely return flight",
    confidence:
      sourceType === "active_ground" ? "high"
      : sourceType === "prefiled" ? "medium"
      : "low",
    guaranteeNote:
      sourceType === "inferred_return"
        ? "This return was inferred from recent history and may not actually be flown."
        : null,
    airlineCode,
    airlineName: getAirlineName(airlineCode),
    branding,
    isCanceled,
    callsign: entity.callsign,
    flightNumber: sourceType === "inferred_return" ? null : inferFlightNumber(entity.callsign),
    origin,
    destination,
    originAirport,
    destinationAirport,
    aircraftCode,
    aircraftName: getAircraftMeta(aircraftCode).name,
    departureIso,
    arrivalIso,
    durationMinutes,
    durationLabel: formatDuration(durationMinutes),
    distanceMiles,
    pilotName: entity.name || null,
    notes:
      sourceType === "active_ground" ? "Aircraft is currently on the ground and appears ready for departure."
      : sourceType === "prefiled" ? (isCanceled ? "This prefiled departure is well past its scheduled departure time." : "Flight comes from an active prefile in the VATSIM network feed.")
      : null,
    historyReference: null,
  };

  flight.seatMap = buildSeatMap(flight);
  flight.fare = computeFare(flight, { passengers: 1, checkedBags: 0 });
  return flight;
}

function dedupeFlights(flights) {
  const seen = new Map();

  for (const flight of flights) {
    if (!flight) {
      continue;
    }

    const key = `${flight.callsign}|${flight.origin}|${flight.destination}|${flight.sourceType === "active_ground" ? "live" : flight.departureIso.slice(0, 13)}`;
    const existing = seen.get(key);

    if (!existing || sourcePriority(flight.sourceType) < sourcePriority(existing.sourceType)) {
      seen.set(key, flight);
    }
  }

  return Array.from(seen.values());
}

function sourcePriority(sourceType) {
  if (sourceType === "active_ground") {
    return 0;
  }

  if (sourceType === "prefiled") {
    return 1;
  }

  return 2;
}

async function getLiveInventory() {
  await ensureFreshSnapshot();

  const airportMap = await getAirportIndex();
  const pilots = Array.isArray(latestSnapshot?.pilots) ? latestSnapshot.pilots : [];
  const prefiles = Array.isArray(latestSnapshot?.prefiles) ? latestSnapshot.prefiles : [];

  const activeGroundFlights = pilots
    .filter((pilot) => pilot?.flight_plan && isGroundFlight(pilot))
    .map((pilot) => buildFlightFromEntity(pilot, "active_ground", airportMap));

  const prefileFlights = prefiles
    .filter((prefile) => prefile?.flight_plan)
    .map((prefile) => buildFlightFromEntity(prefile, "prefiled", airportMap));

  const flights = dedupeFlights([...activeGroundFlights, ...prefileFlights]).sort((left, right) => {
    return new Date(left.departureIso).getTime() - new Date(right.departureIso).getTime();
  });

  for (const flight of flights) {
    searchFlightCache.set(flight.id, { flight, cachedAt: Date.now() });
  }

  return flights;
}

async function fetchStatsimFlights(pathname, params) {
  const query = new URLSearchParams(params);
  const url = `${STATSIM_BASE_URL}${pathname}?${query.toString()}`;
  return await fetchJson(url, {
    timeoutMs: STATSIM_REQUEST_TIMEOUT_MS,
    headers: {
      "X-API-Key": STATSIM_API_KEY,
    },
  });
}

function summarizeHistoricalRoutes(origin, flights, airportMap, lookbackDays) {
  const grouped = new Map();

  for (const item of flights) {
    const routeOrigin = normalizeIcao(item.departure);
    const routeDestination = normalizeIcao(item.destination);

    if (!routeOrigin || !routeDestination || routeOrigin !== origin || routeOrigin === routeDestination) {
      continue;
    }

    const key = buildRouteKey(routeOrigin, routeDestination);
    const airlineCode = extractAirlineCode(item.callsign);
    const aircraftCode = normalizeIcao(item.aircraft);
    const durationMinutes =
      item.departed && item.arrived
        ? Math.max(30, Math.round((new Date(item.arrived).getTime() - new Date(item.departed).getTime()) / 60000))
        : 0;
    const departedAt = item.departed || item.loggedOn || null;

    if (!grouped.has(key)) {
      grouped.set(key, {
        origin: routeOrigin,
        destination: routeDestination,
        flights: 0,
        durationMinutes: [],
        latestDepartureIso: null,
        airlines: new Map(),
        aircraftCounts: new Map(),
      });
    }

    const summary = grouped.get(key);
    summary.flights += 1;

    if (durationMinutes) {
      summary.durationMinutes.push(durationMinutes);
    }

    if (departedAt && (!summary.latestDepartureIso || new Date(departedAt) > new Date(summary.latestDepartureIso))) {
      summary.latestDepartureIso = departedAt;
    }

    summary.aircraftCounts.set(aircraftCode, (summary.aircraftCounts.get(aircraftCode) || 0) + 1);

    if (!summary.airlines.has(airlineCode)) {
      summary.airlines.set(airlineCode, {
        airlineCode,
        airlineName: getAirlineName(airlineCode),
        flights: 0,
      });
    }

    summary.airlines.get(airlineCode).flights += 1;
  }

  return Array.from(grouped.values())
    .map((summary) => {
      const originAirport = enrichAirport(airportMap, summary.origin);
      const destinationAirport = enrichAirport(airportMap, summary.destination);
      const distanceMiles = estimateDistanceMiles(originAirport, destinationAirport);
      const airlines = Array.from(summary.airlines.values())
        .sort((left, right) => right.flights - left.flights)
        .map((airline) => ({
          ...airline,
          weeklyFrequency: Math.max(1, Math.round((airline.flights * 7) / lookbackDays)),
        }));
      const primaryAirline = airlines[0];

      return {
        id: makeFlightId(["route", summary.origin, summary.destination]),
        origin: summary.origin,
        destination: summary.destination,
        originAirport,
        destinationAirport,
        totalFlights: summary.flights,
        weeklyFrequency: Math.max(1, Math.round((summary.flights * 7) / lookbackDays)),
        averageDurationMinutes: Math.max(35, Math.round(average(summary.durationMinutes) || 120)),
        averageDurationLabel: formatDuration(Math.max(35, Math.round(average(summary.durationMinutes) || 120))),
        latestDepartureIso: summary.latestDepartureIso,
        distanceMiles,
        airlines,
        primaryAirlineCode: primaryAirline?.airlineCode || "GEN",
        primaryAirlineName: primaryAirline?.airlineName || "Mixed carriers",
        primaryAircraftCode: pickPrimaryAircraftCode(summary.aircraftCounts),
      };
    })
    .sort((left, right) => {
      if (right.weeklyFrequency !== left.weeklyFrequency) {
        return right.weeklyFrequency - left.weeklyFrequency;
      }

      return left.distanceMiles - right.distanceMiles;
    });
}

async function getHistoricalRoutesFromOrigin(origin, lookbackDays = HISTORY_LOOKBACK_DAYS) {
  if (!STATSIM_API_KEY || !origin) {
    return [];
  }

  const cacheKey = `routes:${origin}:${lookbackDays}`;
  const cached = routeHistoryCache.get(cacheKey);

  if (cached && (Date.now() - cached.cachedAt) < STATSIM_CACHE_MS) {
    return cached.routes;
  }

  const airportMap = await getAirportIndex();
  const window = getHistoryWindow(lookbackDays);
  let flights = [];

  try {
    flights = await fetchStatsimFlights("/api/Flights/IcaoOrigin", {
      icao: origin,
      from: window.from,
      to: window.to,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (!message.includes("returned 404")) {
      console.error("[airline-backend] Route history lookup failed:", error);
    }

    routeHistoryCache.set(cacheKey, { cachedAt: Date.now(), routes: [] });
    return [];
  }

  const routes = summarizeHistoricalRoutes(origin, flights, airportMap, window.days);
  routeHistoryCache.set(cacheKey, { cachedAt: Date.now(), routes });
  return routes;
}

function scoreRouteForDestination(route, destinationAirport) {
  const routeDistanceToGoal = estimateDistanceMiles(route.destinationAirport, destinationAirport);
  return (routeDistanceToGoal / 1000) - (route.weeklyFrequency * 0.35) + (route.averageDurationMinutes / 500);
}

function buildHeuristicLeg(origin, destination, airportMap, legIndex) {
  const originAirport = enrichAirport(airportMap, origin);
  const destinationAirport = enrichAirport(airportMap, destination);
  const distanceMiles = estimateDistanceMiles(originAirport, destinationAirport);
  const averageDurationMinutes = Math.max(50, Math.round((distanceMiles / 500) * 60));

  return {
    id: makeFlightId(["heuristic-leg", origin, destination, String(legIndex)]),
    origin,
    destination,
    originAirport,
    destinationAirport,
    totalFlights: 0,
    weeklyFrequency: 0,
    averageDurationMinutes,
    averageDurationLabel: formatDuration(averageDurationMinutes),
    latestDepartureIso: null,
    distanceMiles,
    airlines: [],
    primaryAirlineCode: "GEN",
    primaryAirlineName: "Mixed carriers",
    primaryAircraftCode: "",
    legIndex,
    connectionWarning: "Historical weekly frequency could not be confirmed quickly for this leg.",
  };
}

async function buildObservedRouteSet() {
  const liveFlights = await getLiveInventory();
  return new Set(liveFlights.map((flight) => buildRouteKey(flight.origin, flight.destination)));
}

async function routeHasEvidence(origin, destination, observedRouteSet, historyRouteCache) {
  const routeKey = buildRouteKey(origin, destination);

  if (observedRouteSet.has(routeKey)) {
    return true;
  }

  if (!historyRouteCache.has(origin)) {
    try {
      const routes = await getHistoricalRoutesFromOrigin(origin, WEEKLY_FREQUENCY_LOOKBACK_DAYS);
      historyRouteCache.set(origin, new Set(routes.map((route) => buildRouteKey(route.origin, route.destination))));
    } catch {
      historyRouteCache.set(origin, new Set());
    }
  }

  return historyRouteCache.get(origin).has(routeKey);
}

async function buildFallbackItineraries(origin, destination) {
  const airportMap = await getAirportIndex();
  const destinationAirport = enrichAirport(airportMap, destination);
  const observedRouteSet = await buildObservedRouteSet();
  const historyRouteCache = new Map();
  const hubCandidates = GLOBAL_HUBS
    .filter((hub) => hub !== origin && hub !== destination)
    .map((hub) => ({
      hub,
      score: estimateDistanceMiles(enrichAirport(airportMap, origin), enrichAirport(airportMap, hub))
        + estimateDistanceMiles(enrichAirport(airportMap, hub), destinationAirport),
    }))
    .sort((left, right) => left.score - right.score)
    .slice(0, 6);

  const itineraries = [];
  if (await routeHasEvidence(origin, destination, observedRouteSet, historyRouteCache)) {
    const directLeg = buildHeuristicLeg(origin, destination, airportMap, 0);
    itineraries.push({
      id: makeFlightId(["fallback", origin, destination, "direct"]),
      origin,
      destination,
      legCount: 1,
      stopCount: 0,
      totalDurationMinutes: directLeg.averageDurationMinutes,
      totalDurationLabel: directLeg.averageDurationLabel,
      weeklyFrequency: 0,
      notes: "Historical route frequency was not available quickly, so this itinerary uses a route that was still observed in live or historical data.",
      legs: [directLeg],
    });
  }

  for (const { hub } of hubCandidates) {
    const firstLegObserved = await routeHasEvidence(origin, hub, observedRouteSet, historyRouteCache);
    const secondLegObserved = await routeHasEvidence(hub, destination, observedRouteSet, historyRouteCache);

    if (!firstLegObserved || !secondLegObserved) {
      continue;
    }

    const firstLeg = buildHeuristicLeg(origin, hub, airportMap, 0);
    const secondLeg = buildHeuristicLeg(hub, destination, airportMap, 1);
    const totalDurationMinutes = firstLeg.averageDurationMinutes + secondLeg.averageDurationMinutes + MIN_CONNECTION_MINUTES;
    itineraries.push({
      id: makeFlightId(["fallback", origin, destination, hub]),
      origin,
      destination,
      legCount: 2,
      stopCount: 1,
      totalDurationMinutes,
      totalDurationLabel: formatDuration(totalDurationMinutes),
      weeklyFrequency: 0,
      notes: "Historical route frequency was not available quickly, but both legs were observed in live or historical data.",
      legs: [firstLeg, secondLeg],
    });
  }

  return itineraries.slice(0, MAX_ITINERARY_RESULTS);
}

async function findHistoricalItineraries(origin, destination) {
  if (!origin || !destination || origin === destination) {
    return [];
  }

  const airportMap = await getAirportIndex();
  const destinationAirport = enrichAirport(airportMap, destination);
  const queue = [{
    airports: [origin],
    legs: [],
    score: 0,
  }];
  const results = [];
  const seen = new Map();

  while (queue.length && results.length < MAX_ITINERARY_RESULTS) {
    queue.sort((left, right) => {
      if (left.legs.length !== right.legs.length) {
        return left.legs.length - right.legs.length;
      }

      return left.score - right.score;
    });

    const currentPath = queue.shift();
    const currentAirport = currentPath.airports[currentPath.airports.length - 1];

    if (currentAirport === destination && currentPath.legs.length) {
      results.push(currentPath);
      continue;
    }

    if (currentPath.legs.length >= MAX_ITINERARY_LEGS) {
      continue;
    }

    const routes = await getHistoricalRoutesFromOrigin(currentAirport, HISTORY_LOOKBACK_DAYS);
    const rankedRoutes = routes
      .filter((route) => !currentPath.airports.includes(route.destination))
      .sort((left, right) => scoreRouteForDestination(left, destinationAirport) - scoreRouteForDestination(right, destinationAirport))
      .slice(0, MAX_ROUTES_PER_AIRPORT);

    for (const route of rankedRoutes) {
      const nextLegCount = currentPath.legs.length + 1;
      const nextScore = currentPath.score + scoreRouteForDestination(route, destinationAirport) + nextLegCount;
      const seenKey = `${route.destination}|${nextLegCount}`;

      if (seen.has(seenKey) && seen.get(seenKey) <= nextScore) {
        continue;
      }

      seen.set(seenKey, nextScore);
      queue.push({
        airports: [...currentPath.airports, route.destination],
        legs: [...currentPath.legs, route],
        score: nextScore,
      });
    }
  }

  const fastItineraries = results
    .map((path, index) => {
      const totalDurationMinutes = path.legs.reduce((sum, leg) => sum + leg.averageDurationMinutes, 0)
        + Math.max(0, path.legs.length - 1) * MIN_CONNECTION_MINUTES;
      const itineraryWeeklyFrequency = path.legs.reduce((minFrequency, leg) => {
        return Math.min(minFrequency, leg.weeklyFrequency);
      }, Number.POSITIVE_INFINITY);

      return {
        id: makeFlightId(["itinerary", origin, destination, String(index), ...path.airports]),
        origin,
        destination,
        legCount: path.legs.length,
        stopCount: Math.max(0, path.legs.length - 1),
        totalDurationMinutes,
        totalDurationLabel: formatDuration(totalDurationMinutes),
        weeklyFrequency: Number.isFinite(itineraryWeeklyFrequency) ? itineraryWeeklyFrequency : 0,
        notes: itineraryWeeklyFrequency <= 1
          ? "This itinerary appears to operate only about once per week."
          : null,
        legs: path.legs.map((leg, legIndex) => ({
          ...leg,
          legIndex,
          connectionWarning: leg.weeklyFrequency <= 1 ? "This leg appears to operate about once per week." : null,
        })),
      };
    })
    .sort((left, right) => {
      if (left.legCount !== right.legCount) {
        return left.legCount - right.legCount;
      }

      if (right.weeklyFrequency !== left.weeklyFrequency) {
        return right.weeklyFrequency - left.weeklyFrequency;
      }

      return left.totalDurationMinutes - right.totalDurationMinutes;
    });

  const uniqueOrigins = Array.from(new Set(fastItineraries.flatMap((itinerary) => itinerary.legs.map((leg) => leg.origin))));
  const refinedRouteMaps = new Map();

  await Promise.all(uniqueOrigins.map(async (routeOrigin) => {
    try {
      const refinedRoutes = await getHistoricalRoutesFromOrigin(routeOrigin, WEEKLY_FREQUENCY_LOOKBACK_DAYS);
      refinedRouteMaps.set(routeOrigin, new Map(refinedRoutes.map((route) => [buildRouteKey(route.origin, route.destination), route])));
    } catch {
      refinedRouteMaps.set(routeOrigin, new Map());
    }
  }));

  return fastItineraries.map((itinerary) => {
    const legs = itinerary.legs.map((leg) => {
      const refined = refinedRouteMaps.get(leg.origin)?.get(buildRouteKey(leg.origin, leg.destination));
      return refined ? {
        ...leg,
        weeklyFrequency: refined.weeklyFrequency,
        connectionWarning: refined.weeklyFrequency <= 1 ? "This leg appears to operate about once per week." : null,
      } : leg;
    });
    const weeklyFrequency = legs.reduce((minFrequency, leg) => {
      return Math.min(minFrequency, leg.weeklyFrequency);
    }, Number.POSITIVE_INFINITY);

    return {
      ...itinerary,
      weeklyFrequency: Number.isFinite(weeklyFrequency) ? weeklyFrequency : itinerary.weeklyFrequency,
      notes: weeklyFrequency <= 1 ? "This itinerary appears to operate only about once per week." : null,
      legs,
    };
  });
}

async function getInferredReturnFlights(origin, destination, liveFlights) {
  if (!STATSIM_API_KEY || !origin) {
    return [];
  }

  const cacheKey = `${origin}|${destination || "*"}`;
  const cached = statsimCache.get(cacheKey);

  if (cached && (Date.now() - cached.cachedAt) < STATSIM_CACHE_MS) {
    return cached.flights;
  }

  const airportMap = await getAirportIndex();
  const now = new Date();
  const lookbackStart = new Date(now.getTime() - 72 * 60 * 60 * 1000);
  let historyFlights = [];
  let laterDepartures = [];

  try {
    historyFlights = await fetchStatsimFlights("/api/Flights/IcaoDestination", {
      icao: origin,
      from: lookbackStart.toISOString(),
      to: now.toISOString(),
    });
    laterDepartures = await fetchStatsimFlights("/api/Flights/IcaoOrigin", {
      icao: origin,
      from: lookbackStart.toISOString(),
      to: now.toISOString(),
    });
  } catch (error) {
    console.error("[airline-backend] StatSim lookup failed:", error);
    statsimCache.set(cacheKey, { cachedAt: Date.now(), flights: [] });
    return [];
  }

  const liveKeys = new Set(liveFlights.map((flight) => `${flight.airlineCode}|${flight.origin}|${flight.destination}|${flight.aircraftCode}`));

  const inferredFlights = dedupeFlights(historyFlights
    .filter((item) => normalizeIcao(item.destination) === origin)
    .filter((item) => !destination || normalizeIcao(item.departure) === destination)
    .map((item) => {
      const reverseOrigin = normalizeIcao(item.destination);
      const reverseDestination = normalizeIcao(item.departure);

      if (!reverseOrigin || !reverseDestination || reverseOrigin === reverseDestination) {
        return null;
      }

      const aircraftCode = normalizeAircraftCode(item.aircraft);
      const airlineCode = extractAirlineCode(item.callsign);
      const routeKey = `${airlineCode}|${reverseOrigin}|${reverseDestination}|${aircraftCode}`;

      if (liveKeys.has(routeKey)) {
        return null;
      }

      const historicalArrivalIso = item.arrived || item.loggedOn || null;
      const hasSubsequentDeparture = laterDepartures.some((departureFlight) => {
        const departureAirlineCode = extractAirlineCode(departureFlight.callsign);
        const departureTime = departureFlight.departed || departureFlight.loggedOn || null;

        if (!historicalArrivalIso || !departureTime) {
          return false;
        }

        if (departureAirlineCode !== airlineCode) {
          return false;
        }

        if (new Date(departureTime) <= new Date(historicalArrivalIso)) {
          return false;
        }

        return true;
      });

      if (hasSubsequentDeparture) {
        return null;
      }

      const historicalDuration = item.departed && item.arrived
        ? Math.max(45, Math.round((new Date(item.arrived).getTime() - new Date(item.departed).getTime()) / 60000))
        : 150;
      const historicalArrival = historicalArrivalIso ? new Date(historicalArrivalIso) : new Date(now);
      const scheduledDeparture = new Date(historicalArrival.getTime() + TURNAROUND_MINUTES * 60000);

      while (scheduledDeparture < now) {
        scheduledDeparture.setUTCDate(scheduledDeparture.getUTCDate() + 1);
      }

      const originAirport = enrichAirport(airportMap, reverseOrigin);
      const destinationAirport = enrichAirport(airportMap, reverseDestination);
      const distanceMiles = estimateDistanceMiles(originAirport, destinationAirport);
      const branding = airlineBranding[airlineCode] || { color: "#12486b", accent: "#ff6b4a" };
      const id = makeFlightId([
        "inferred_return",
        item.callsign,
        reverseOrigin,
        reverseDestination,
        aircraftCode,
        scheduledDeparture.toISOString().slice(0, 16),
      ]);

      const flight = {
        id,
        sourceType: "inferred_return",
        sourceLabel: "Likely return from recent history",
        confidence: "low",
        guaranteeNote: "This result is inferred from a previous arrival and is not guaranteed to operate.",
        airlineCode,
        airlineName: getAirlineName(airlineCode),
        branding,
        callsign: item.callsign,
        flightNumber: null,
        origin: reverseOrigin,
        destination: reverseDestination,
        originAirport,
        destinationAirport,
        aircraftCode,
        aircraftName: getAircraftMeta(aircraftCode).name,
        departureIso: scheduledDeparture.toISOString(),
        arrivalIso: addMinutes(scheduledDeparture.toISOString(), historicalDuration),
        durationMinutes: historicalDuration,
        durationLabel: formatDuration(historicalDuration),
        distanceMiles,
        pilotName: null,
        notes: null,
        historyReference: {
          callsign: item.callsign,
          arrivedAt: item.arrived || null,
          historicalOrigin: normalizeIcao(item.departure),
          historicalDestination: normalizeIcao(item.destination),
        },
      };

      flight.seatMap = buildSeatMap(flight);
      flight.fare = computeFare(flight, { passengers: 1, checkedBags: 0 });
      return flight;
    })
    .filter(Boolean));

  inferredFlights.sort((left, right) => {
    return new Date(left.departureIso).getTime() - new Date(right.departureIso).getTime();
  });

  for (const flight of inferredFlights) {
    searchFlightCache.set(flight.id, { flight, cachedAt: Date.now() });
  }

  statsimCache.set(cacheKey, { cachedAt: Date.now(), flights: inferredFlights });
  return inferredFlights;
}

function filterFlights(flights, origin, destination) {
  return flights.filter((flight) => {
    if (origin && flight.origin !== origin) {
      return false;
    }

    if (destination && flight.destination !== destination) {
      return false;
    }

    return true;
  });
}

function sortFlightsByUsefulness(flights) {
  return [...flights].sort((left, right) => {
    const leftPriority = sourcePriority(left.sourceType);
    const rightPriority = sourcePriority(right.sourceType);

    if (leftPriority !== rightPriority) {
      return leftPriority - rightPriority;
    }

    return new Date(left.departureIso).getTime() - new Date(right.departureIso).getTime();
  });
}

function summarizeAvailability(flight) {
  return {
    totalSeats: flight.seatMap.cabins.reduce((sum, cabin) => {
      return sum + cabin.rows.reduce((rowSum, row) => rowSum + row.seats.length, 0);
    }, 0),
    availableSeats: flight.seatMap.availableSeatCount,
  };
}

function buildSearchResponse(flights, queryContext) {
  return flights.map((flight) => {
    const fare = computeFare(flight, queryContext);
    return {
      ...flight,
      fare,
      availability: summarizeAvailability(flight),
    };
  });
}

async function getAirportSuggestions() {
  const flights = await getLiveInventory();
  const airportMap = await getAirportIndex();
  const airportCodes = new Set();

  for (const flight of flights) {
    airportCodes.add(flight.origin);
    airportCodes.add(flight.destination);
  }

  return Array.from(airportCodes)
    .sort()
    .map((icao) => enrichAirport(airportMap, icao));
}

function pruneSearchCache() {
  const now = Date.now();

  for (const [key, entry] of searchFlightCache.entries()) {
    if ((now - entry.cachedAt) > (60 * 60 * 1000)) {
      searchFlightCache.delete(key);
    }
  }
}

function resolveFlightFromCache(flightId) {
  pruneSearchCache();
  return searchFlightCache.get(flightId)?.flight || null;
}

function generateBookingReference() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let reference = "";

  for (let index = 0; index < 6; index += 1) {
    reference += alphabet[Math.floor(Math.random() * alphabet.length)];
  }

  return reference;
}

function generateTicketNumber() {
  return Array.from({ length: 13 }, () => Math.floor(Math.random() * 10)).join("");
}

function generateBoardingPass(flight, passenger, seatId, bookingReference, sequenceIndex, checkedBags) {
  const departure = new Date(flight.departureIso);
  const operationalCode = flight.flightNumber || inferFlightNumber(flight.callsign) || "RTN";
  const gateLetter = String.fromCharCode(65 + (sequenceIndex % 6));
  const gateNumber = String((operationalCode.charCodeAt(0) + sequenceIndex) % 28 + 1).padStart(2, "0");
  const gate = `${gateLetter}${gateNumber}`;
  const boardingTime = new Date(departure.getTime() - 40 * 60 * 1000).toISOString();
  const zone =
    seatId.startsWith("1") || seatId.startsWith("2") || seatId.startsWith("3") ? "1"
    : seatId.startsWith("4") || seatId.startsWith("5") || seatId.startsWith("6") ? "2"
    : "3";

  return {
    passengerName: `${toTitleCase(passenger.firstName)} ${toTitleCase(passenger.lastName)}`,
    seat: seatId,
    gate,
    zone,
    group: zone,
    bookingReference,
    ticketNumber: generateTicketNumber(),
    barcodeValue: `${bookingReference}${seatId}${operationalCode}${sequenceIndex + 1}`,
    boardingTime,
    departureIso: flight.departureIso,
    arrivalIso: flight.arrivalIso,
    flightNumber: flight.flightNumber,
    callsign: flight.callsign,
    origin: flight.origin,
    destination: flight.destination,
    originAirport: flight.originAirport,
    destinationAirport: flight.destinationAirport,
    airlineName: flight.airlineName,
    airlineCode: flight.airlineCode,
    boardingPassTheme: getBoardingPassTheme(flight.airlineCode),
    aircraftName: flight.aircraftName,
    aircraftCode: flight.aircraftCode,
    checkedBags,
  };
}

async function handleSearch(requestUrl, response) {
  const origin = normalizeIcao(requestUrl.searchParams.get("origin"));
  const destination = normalizeIcao(requestUrl.searchParams.get("destination"));
  const passengers = sanitizePassengers(requestUrl.searchParams.get("passengers"), 1);
  const checkedBags = sanitizeCheckedBags(requestUrl.searchParams.get("checkedBags"), passengers);

  const liveFlights = await getLiveInventory();
  const matchingLiveFlights = filterFlights(liveFlights, origin, destination);
  const inferredFlights = origin
    ? await getInferredReturnFlights(origin, destination, liveFlights)
    : [];
  const combinedFlights = sortFlightsByUsefulness(dedupeFlights([...matchingLiveFlights, ...inferredFlights]))
    .slice(0, SEARCH_RESULT_LIMIT);
  const flights = buildSearchResponse(combinedFlights, { passengers, checkedBags });

  sendJson(response, 200, {
    query: {
      origin,
      destination,
      passengers,
      checkedBags,
    },
    counts: {
      live: matchingLiveFlights.length,
      inferred: inferredFlights.length,
      returned: flights.length,
    },
    flights,
  });
}

async function handleItinerarySearch(requestUrl, response) {
  const origin = normalizeIcao(requestUrl.searchParams.get("origin"));
  const destination = normalizeIcao(requestUrl.searchParams.get("destination"));

  if (!origin || !destination) {
    sendJson(response, 400, { error: "Origin and destination are required." });
    return;
  }

  let itineraries = [];

  try {
    itineraries = await Promise.race([
      findHistoricalItineraries(origin, destination),
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error("timeout")), ITINERARY_SEARCH_TIMEOUT_MS);
      }),
    ]);
  } catch {
    itineraries = [];
  }

  if (!itineraries.length) {
    itineraries = await buildFallbackItineraries(origin, destination);
  }

  sendJson(response, 200, {
    query: { origin, destination },
    counts: {
      itineraries: itineraries.length,
    },
    itineraries,
  });
}

function collectAvailableSeats(flight) {
  const seatMap = buildSeatMap(flight);
  const availableSeats = new Map();

  for (const cabin of seatMap.cabins) {
    for (const row of cabin.rows) {
      for (const seat of row.seats) {
        if (seat.status === "available") {
          availableSeats.set(seat.id, seat);
        }
      }
    }
  }

  return {
    seatMap,
    availableSeats,
  };
}

function validatePassengerSelections(flight, passengers) {
  if (!Array.isArray(passengers) || !passengers.length) {
    return { error: "At least one passenger is required." };
  }

  const { seatMap, availableSeats } = collectAvailableSeats(flight);
  const seenSeats = new Set();

  for (const passenger of passengers) {
    if (!passenger?.firstName || !passenger?.lastName) {
      return { error: "Each passenger needs a first and last name." };
    }

    const seatId = String(passenger.seat || "").toUpperCase();

    if (!seatId || !availableSeats.has(seatId)) {
      return { error: `Seat ${seatId || "(missing)"} is no longer available.` };
    }

    if (seenSeats.has(seatId)) {
      return { error: `Seat ${seatId} was selected more than once.` };
    }

    seenSeats.add(seatId);
  }

  return {
    seatMap,
    availableSeats,
  };
}

async function handleBookingCreation(request, response) {
  let payload;

  try {
    payload = await readJsonBody(request);
  } catch {
    sendJson(response, 400, { error: "Invalid JSON body" });
    return;
  }

  const flightId = String(payload.flightId || "");
  const passengers = Array.isArray(payload.passengers) ? payload.passengers : [];
  const checkedBags = sanitizeCheckedBags(payload.checkedBags, passengers.length || 1);
  const flight = resolveFlightFromCache(flightId);

  if (!flight) {
    sendJson(response, 404, { error: "Flight not found. Search again to refresh live availability." });
    return;
  }

  const validation = validatePassengerSelections(flight, passengers);

  if (validation.error) {
    sendJson(response, validation.error.includes("no longer available") ? 409 : 400, { error: validation.error });
    return;
  }

  const { availableSeats } = validation;

  const baseFare = computeFare(flight, { passengers: passengers.length, checkedBags });
  const seatFees = passengers.reduce((sum, passenger) => {
    const seat = availableSeats.get(String(passenger.seat).toUpperCase());
    return sum + (seat?.priceDelta || 0);
  }, 0);
  const total = baseFare.total + seatFees;
  const bookingReference = generateBookingReference();
  const bookedAt = new Date().toISOString();
  const boardingPasses = passengers.map((passenger, index) => {
    return generateBoardingPass(
      flight,
      passenger,
      String(passenger.seat).toUpperCase(),
      bookingReference,
      index,
      checkedBags,
    );
  });

  if (!bookingsState.reservedSeatsByFlight[flight.id]) {
    bookingsState.reservedSeatsByFlight[flight.id] = [];
  }

  for (const passenger of passengers) {
    bookingsState.reservedSeatsByFlight[flight.id].push(String(passenger.seat).toUpperCase());
  }

  const booking = {
    id: makeFlightId([flight.id, bookingReference, bookedAt]),
    bookingReference,
    bookedAt,
    checkedBags,
    passengerCount: passengers.length,
    flightSnapshot: flight,
    passengers: passengers.map((passenger) => ({
      firstName: toTitleCase(passenger.firstName),
      lastName: toTitleCase(passenger.lastName),
      seat: String(passenger.seat).toUpperCase(),
    })),
    price: {
      ...baseFare,
      seatFees,
      total,
    },
    boardingPasses,
  };

  bookingsState.bookings.push(booking);
  persistBookingsState();
  searchFlightCache.set(flight.id, { flight: { ...flight, seatMap: buildSeatMap(flight) }, cachedAt: Date.now() });

  sendJson(response, 201, booking);
}

async function handleItineraryBookingCreation(request, response) {
  let payload;

  try {
    payload = await readJsonBody(request);
  } catch {
    sendJson(response, 400, { error: "Invalid JSON body" });
    return;
  }

  const segments = Array.isArray(payload.segments) ? payload.segments : [];

  if (!segments.length) {
    sendJson(response, 400, { error: "At least one itinerary segment is required." });
    return;
  }

  const checkedBags = sanitizeCheckedBags(payload.checkedBags, (segments[0]?.passengers || []).length || 1);
  const bookingReference = generateBookingReference();
  const bookedAt = new Date().toISOString();
  const validatedSegments = [];

  for (const [segmentIndex, segment] of segments.entries()) {
    const flight = resolveFlightFromCache(String(segment.flightId || ""));

    if (!flight) {
      sendJson(response, 404, { error: `Segment ${segmentIndex + 1} could not be found. Refresh availability and try again.` });
      return;
    }

    const validation = validatePassengerSelections(flight, segment.passengers);

    if (validation.error) {
      sendJson(response, validation.error.includes("no longer available") ? 409 : 400, { error: `Segment ${segmentIndex + 1}: ${validation.error}` });
      return;
    }

    validatedSegments.push({
      flight,
      passengers: segment.passengers,
      availableSeats: validation.availableSeats,
    });
  }

  let grandTotal = 0;
  const segmentBookings = [];
  const allBoardingPasses = [];

  for (const [segmentIndex, segment] of validatedSegments.entries()) {
    const passengerCount = segment.passengers.length;
    const baseFare = computeFare(segment.flight, { passengers: passengerCount, checkedBags });
    const seatFees = segment.passengers.reduce((sum, passenger) => {
      const seat = segment.availableSeats.get(String(passenger.seat).toUpperCase());
      return sum + (seat?.priceDelta || 0);
    }, 0);
    const segmentTotal = baseFare.total + seatFees;
    grandTotal += segmentTotal;

    if (!bookingsState.reservedSeatsByFlight[segment.flight.id]) {
      bookingsState.reservedSeatsByFlight[segment.flight.id] = [];
    }

    for (const passenger of segment.passengers) {
      bookingsState.reservedSeatsByFlight[segment.flight.id].push(String(passenger.seat).toUpperCase());
    }

    const boardingPasses = segment.passengers.map((passenger, passengerIndex) => {
      return {
        ...generateBoardingPass(
          segment.flight,
          passenger,
          String(passenger.seat).toUpperCase(),
          bookingReference,
          passengerIndex,
          checkedBags,
        ),
        segmentIndex,
      };
    });

    allBoardingPasses.push(...boardingPasses);
    segmentBookings.push({
      segmentIndex,
      flightSnapshot: segment.flight,
      passengers: segment.passengers.map((passenger) => ({
        firstName: toTitleCase(passenger.firstName),
        lastName: toTitleCase(passenger.lastName),
        seat: String(passenger.seat).toUpperCase(),
      })),
      price: {
        ...baseFare,
        seatFees,
        total: segmentTotal,
      },
      boardingPasses,
    });
  }

  const itineraryBooking = {
    id: makeFlightId(["itinerary-booking", bookingReference, bookedAt]),
    bookingReference,
    bookedAt,
    checkedBags,
    passengerCount: (validatedSegments[0]?.passengers || []).length,
    segments: segmentBookings,
    price: {
      currency: "USD",
      total: grandTotal,
    },
    boardingPasses: allBoardingPasses,
  };

  bookingsState.bookings.push(itineraryBooking);
  persistBookingsState();

  for (const segment of validatedSegments) {
    searchFlightCache.set(segment.flight.id, {
      flight: { ...segment.flight, seatMap: buildSeatMap(segment.flight) },
      cachedAt: Date.now(),
    });
  }

  sendJson(response, 201, itineraryBooking);
}

function handleBookingLookup(requestUrl, response) {
  const bookingReference = String(requestUrl.searchParams.get("reference") || "").trim().toUpperCase();

  if (!bookingReference) {
    sendJson(response, 400, { error: "Missing booking reference" });
    return;
  }

  const booking = bookingsState.bookings.find((entry) => entry.bookingReference === bookingReference);

  if (!booking) {
    sendJson(response, 404, { error: "Booking not found" });
    return;
  }

  sendJson(response, 200, booking);
}

function serveStaticFile(requestPath, response) {
  const relativePath = requestPath === "/" ? "index.html" : requestPath.replace(/^\/+/, "");
  const normalizedPath = path.normalize(relativePath).replace(/^(\.\.[/\\])+/, "");
  const localPath = path.join(ROOT, normalizedPath);

  if (!localPath.startsWith(ROOT)) {
    sendJson(response, 403, { error: "Forbidden" });
    return;
  }

  fs.stat(localPath, (statError, stats) => {
    if (statError || !stats.isFile()) {
      sendJson(response, 404, { error: "Not found" });
      return;
    }

    const extension = path.extname(localPath).toLowerCase();
    const contentType = CONTENT_TYPES[extension] || "application/octet-stream";
    const stream = fs.createReadStream(localPath);

    response.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": extension === ".html" ? "no-store" : "public, max-age=300",
    });

    stream.pipe(response);
    stream.on("error", () => {
      response.destroy();
    });
  });
}

async function requestHandler(request, response) {
  const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);

  try {
    if (request.method === "GET" && url.pathname === "/api/health") {
      await ensureFreshSnapshot();
      sendJson(response, 200, {
        ok: Boolean(latestSnapshot),
        lastSuccessAt: lastSuccessAt ? lastSuccessAt.toISOString() : null,
        lastError,
        statsimEnabled: Boolean(STATSIM_API_KEY),
        bookingCount: bookingsState.bookings.length,
      });
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/overview") {
      const flights = await getLiveInventory();
      const airports = await getAirportSuggestions();

      sendJson(response, 200, {
        updatedAt: latestSnapshot?._backend?.lastSuccessAt || null,
        statsimEnabled: Boolean(STATSIM_API_KEY),
        totals: {
          liveGround: flights.filter((flight) => flight.sourceType === "active_ground").length,
          prefiled: flights.filter((flight) => flight.sourceType === "prefiled").length,
          airports: airports.length,
          bookings: bookingsState.bookings.length,
          itineraryRouting: STATSIM_API_KEY ? 1 : 0,
        },
        airports,
      });
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/itineraries") {
      await handleItinerarySearch(url, response);
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/search") {
      await handleSearch(url, response);
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/bookings") {
      await handleBookingCreation(request, response);
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/itinerary-bookings") {
      await handleItineraryBookingCreation(request, response);
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/bookings") {
      handleBookingLookup(url, response);
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/vatsim-data") {
      await ensureFreshSnapshot();
      sendJson(response, latestSnapshot ? 200 : 503, latestSnapshot || {
        error: "VATSIM snapshot not ready yet",
        lastError,
      });
      return;
    }

    if (request.method !== "GET" && request.method !== "POST") {
      sendText(response, 405, "Method not allowed");
      return;
    }

    serveStaticFile(url.pathname, response);
  } catch (error) {
    console.error("[airline-backend] Request failed:", error);
    sendJson(response, 500, {
      error: "Internal server error",
      detail: error instanceof Error ? error.message : String(error),
    });
  }
}

if (require.main === module) {
  const server = http.createServer(requestHandler);

  server.listen(PORT, () => {
    console.log(`[airline-backend] Serving ${ROOT} at http://localhost:${PORT}`);
    startPolling();
    getAirportIndex().catch((error) => {
      console.error("[airline-backend] Airport preload failed:", error);
    });
  });
}

module.exports = {
  requestHandler,
};

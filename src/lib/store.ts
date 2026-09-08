import fs from "fs";
import path from "path";
import type { AnalyticsEvent, LogCategory, LogSeverity, StoreData } from "./types";
import { buildSeedData } from "./seed";
import { uid, nowISO } from "./utils";

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_FILE = path.join(DATA_DIR, "store.json");
const STORE_OBJECT = "store.json";

function bucketName(): string | undefined {
  const name = process.env.GCS_BUCKET || process.env.ALEX_DATA_BUCKET;
  return name && name.trim() ? name.trim() : undefined;
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function normalizeStore(raw: Partial<StoreData> | null | undefined): StoreData {
  const seed = buildSeedData();
  if (!raw) return seed;
  return {
    leads: raw.leads ?? [],
    conversations: raw.conversations ?? [],
    logs: raw.logs ?? [],
    users: raw.users?.length ? raw.users : seed.users,
    deliveries: raw.deliveries ?? [],
    pageviews: raw.pageviews ?? [],
    chatStarts: raw.chatStarts ?? [],
    events: raw.events ?? [],
    config: raw.config ? { ...seed.config, ...raw.config } : seed.config,
    sessions: raw.sessions ?? {},
  };
}

/** Serialize store writes so read-modify-write races stay ordered in-process. */
let chain: Promise<unknown> = Promise.resolve();

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = chain.then(fn, fn);
  chain = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

let memoryCache: StoreData | null = null;
let gcsClient: import("@google-cloud/storage").Storage | null = null;

async function getGcs() {
  if (!gcsClient) {
    const { Storage } = await import("@google-cloud/storage");
    gcsClient = new Storage();
  }
  return gcsClient;
}

async function readLocal(): Promise<StoreData> {
  ensureDataDir();
  if (!fs.existsSync(STORE_FILE)) {
    const seed = buildSeedData();
    fs.writeFileSync(STORE_FILE, JSON.stringify(seed, null, 2), "utf-8");
    return seed;
  }
  const raw = JSON.parse(fs.readFileSync(STORE_FILE, "utf-8")) as Partial<StoreData>;
  return normalizeStore(raw);
}

async function writeLocal(data: StoreData): Promise<void> {
  ensureDataDir();
  fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), "utf-8");
}

async function readGcs(bucket: string): Promise<StoreData> {
  const storage = await getGcs();
  const file = storage.bucket(bucket).file(STORE_OBJECT);
  const [exists] = await file.exists();
  if (!exists) {
    const seed = buildSeedData();
    await file.save(JSON.stringify(seed, null, 2), {
      contentType: "application/json",
      resumable: false,
    });
    return seed;
  }
  const [buf] = await file.download();
  const raw = JSON.parse(buf.toString("utf-8")) as Partial<StoreData>;
  return normalizeStore(raw);
}

async function writeGcs(bucket: string, data: StoreData): Promise<void> {
  const storage = await getGcs();
  await storage.bucket(bucket).file(STORE_OBJECT).save(JSON.stringify(data, null, 2), {
    contentType: "application/json",
    resumable: false,
  });
}

async function appendEventNdjson(bucket: string, event: AnalyticsEvent): Promise<void> {
  try {
    const day = event.createdAt.slice(0, 10);
    const objectPath = `events/${day}.ndjson`;
    const storage = await getGcs();
    const file = storage.bucket(bucket).file(objectPath);
    const line = JSON.stringify(event) + "\n";
    const [exists] = await file.exists();
    let prior = "";
    if (exists) {
      const [buf] = await file.download();
      prior = buf.toString("utf-8");
    }
    await file.save(prior + line, {
      contentType: "application/x-ndjson",
      resumable: false,
    });
  } catch (err) {
    console.warn("[store] NDJSON event append failed", err);
  }
}

/** Load into memory cache (must be called under withLock). */
async function loadUnlocked(): Promise<StoreData> {
  if (memoryCache) return memoryCache;
  const bucket = bucketName();
  const data = bucket ? await readGcs(bucket) : await readLocal();
  memoryCache = data;
  return data;
}

/** Persist memory cache (must be called under withLock). */
async function persistUnlocked(data: StoreData): Promise<void> {
  if (!data.events) data.events = [];
  memoryCache = data;
  const bucket = bucketName();
  if (bucket) {
    await writeGcs(bucket, data);
  } else {
    await writeLocal(data);
  }
}

export async function getStore(): Promise<StoreData> {
  return withLock(() => loadUnlocked());
}

export async function saveStore(data: StoreData): Promise<void> {
  return withLock(() => persistUnlocked(data));
}

/**
 * Mutate store under a single lock (preferred for read-modify-write).
 * Avoids nested getStore+saveStore lock deadlocks.
 */
export async function updateStore(mutator: (store: StoreData) => void | Promise<void>): Promise<StoreData> {
  return withLock(async () => {
    const store = await loadUnlocked();
    await mutator(store);
    await persistUnlocked(store);
    return store;
  });
}

export async function resetStore(): Promise<StoreData> {
  return withLock(async () => {
    const seed = buildSeedData();
    await persistUnlocked(seed);
    return seed;
  });
}

export async function appendLog(
  category: LogCategory,
  severity: LogSeverity,
  message: string,
  meta?: Record<string, unknown>
) {
  await updateStore((store) => {
    store.logs.unshift({
      id: `log_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
      category,
      severity,
      message,
      meta,
      createdAt: nowISO(),
    });
    if (store.logs.length > 2000) store.logs = store.logs.slice(0, 2000);
  });
}

export type TrackEventInput = Omit<AnalyticsEvent, "id" | "createdAt"> & {
  createdAt?: string;
};

/** Append analytics event to store.events (+ optional GCS NDJSON). */
export async function trackEvent(input: TrackEventInput): Promise<AnalyticsEvent> {
  const event: AnalyticsEvent = {
    id: uid("evt"),
    createdAt: input.createdAt || nowISO(),
    type: input.type,
    visitorId: input.visitorId,
    sessionId: input.sessionId,
    path: input.path,
    referrer: input.referrer,
    device: input.device,
    utm: input.utm,
    step: input.step,
    leadId: input.leadId,
    conversationId: input.conversationId,
    meta: input.meta,
  };

  await updateStore((store) => {
    if (!store.events) store.events = [];
    store.events.push(event);
    if (store.events.length > 20000) {
      store.events = store.events.slice(store.events.length - 20000);
    }
  });

  const bucket = bucketName();
  if (bucket) {
    void appendEventNdjson(bucket, event);
  }

  return event;
}

export function storageMode(): "gcs" | "local" {
  return bucketName() ? "gcs" : "local";
}

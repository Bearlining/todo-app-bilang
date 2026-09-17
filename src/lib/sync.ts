// URL hash sync — encode/decode the whole todo list into a shareable URL hash.
//
// Why hash (not query string): the hash is never sent to the server, so we can
// fit a fairly large blob here without polluting analytics / caching layers.
//
// Format:
//   #sync=<base64url-encoded gzip-deflated JSON>
// Older browsers that don't support CompressionStream fall back to plain
// base64url(JSON). Both shapes are auto-detected on decode.

import type { Todo } from '../types/todo';

const PREFIX = 'sync=';
const VERSION = 1;

// ---------- base64url helpers ----------

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  // btoa exists in browsers and is fine for the latin1 range we get from above.
  const b64 = btoa(binary);
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToBytes(s: string): Uint8Array {
  let b64 = s.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4 !== 0) b64 += '=';
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// ---------- compression helpers ----------

async function compress(input: string): Promise<Uint8Array> {
  if (typeof CompressionStream === 'undefined') {
    // Fallback: no compression, just utf-8 bytes.
    return new TextEncoder().encode(input);
  }
  const stream = new Blob([input]).stream().pipeThrough(new CompressionStream('gzip'));
  const buf = await new Response(stream).arrayBuffer();
  return new Uint8Array(buf);
}

async function decompress(bytes: Uint8Array, compressed: boolean): Promise<string> {
  if (!compressed) {
    return new TextDecoder().decode(bytes);
  }
  if (typeof DecompressionStream === 'undefined') {
    throw new Error('Cannot decompress: DecompressionStream not supported in this browser.');
  }
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
  const buf = await new Response(stream).arrayBuffer();
  return new TextDecoder().decode(buf);
}

// ---------- payload shape ----------

interface SyncPayload {
  v: number;
  ts: number; // generation timestamp (ms)
  todos: SerialisedTodo[];
}

interface SerialisedTodo {
  i: string;
  t: string;
  d: string;
  c: boolean;
  p: 'low' | 'medium' | 'high';
  cat: string;
  tg: string[];
  cr: number | null;
  dd: number | null;
  rt: number | null;
  cp: number | null;
  a: boolean;
  aa: number | null;
  rpt: 'none' | 'daily' | 'weekly' | 'monthly';
  rpe: number | null;
  st: { i: string; t: string; c: boolean }[];
}

function serialiseTodo(todo: Todo): SerialisedTodo {
  return {
    i: todo.id,
    t: todo.title,
    d: todo.description,
    c: todo.isCompleted,
    p: todo.priority,
    cat: todo.category,
    tg: todo.tags,
    // Date instances are round-tripped through JSON.stringify (which makes
    // them ISO strings), so on re-load `createdAt` may be a string OR a Date.
    // Normalise to ms-since-epoch.
    cr: toEpoch(todo.createdAt),
    dd: toEpoch(todo.dueDate),
    rt: toEpoch(todo.reminderTime),
    cp: toEpoch(todo.completedAt),
    a: todo.isArchived,
    aa: toEpoch(todo.archivedAt),
    rpt: todo.repeatType,
    rpe: toEpoch(todo.repeatEndDate),
    st: todo.subTasks.map((s) => ({ i: s.id, t: s.title, c: s.isCompleted })),
  };
}

// Normalise a value that *should* be a Date into ms-since-epoch.
// Accepts Date | string | number | null | undefined.
function toEpoch(v: unknown): number | null {
  if (v == null) return null;
  if (v instanceof Date) return v.getTime();
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    const t = new Date(v).getTime();
    return isNaN(t) ? null : t;
  }
  return null;
}

function deserialiseTodo(s: SerialisedTodo): Todo {
  return {
    id: s.i,
    title: s.t,
    description: s.d,
    isCompleted: s.c,
    priority: s.p,
    category: s.cat,
    tags: s.tg || [],
    createdAt: s.cr != null ? new Date(s.cr) : new Date(),
    dueDate: s.dd != null ? new Date(s.dd) : null,
    reminderTime: s.rt != null ? new Date(s.rt) : null,
    completedAt: s.cp != null ? new Date(s.cp) : null,
    isArchived: !!s.a,
    archivedAt: s.aa != null ? new Date(s.aa) : null,
    repeatType: s.rpt,
    repeatEndDate: s.rpe != null ? new Date(s.rpe) : null,
    subTasks: (s.st || []).map((st) => ({
      id: st.i,
      title: st.t,
      isCompleted: !!st.c,
    })),
  };
}

// ---------- public API ----------

export interface SyncResult {
  payload: SyncPayload;
  todos: Todo[];
}

export async function encodeSync(todos: Todo[]): Promise<string> {
  const payload: SyncPayload = {
    v: VERSION,
    ts: Date.now(),
    todos: todos.map(serialiseTodo),
  };
  const json = JSON.stringify(payload);
  const compressed = await compress(json);
  return bytesToBase64Url(compressed);
}

export async function decodeSync(encoded: string): Promise<SyncResult> {
  const bytes = base64UrlToBytes(encoded);

  // Magic sniff: gzip starts with 0x1f 0x8b. If absent, treat as uncompressed.
  const compressed = bytes.length >= 2 && bytes[0] === 0x1f && bytes[1] === 0x8b;
  const json = await decompress(bytes, compressed);
  const payload = JSON.parse(json) as SyncPayload;

  if (!payload || typeof payload !== 'object' || !Array.isArray(payload.todos)) {
    throw new Error('Invalid sync payload.');
  }
  const todos = payload.todos.map(deserialiseTodo);
  return { payload, todos };
}

export function buildSyncUrl(encoded: string): string {
  const base = window.location.origin + window.location.pathname;
  return `${base}#${PREFIX}${encoded}`;
}

export function readSyncHash(): string | null {
  const hash = window.location.hash;
  if (!hash || !hash.startsWith(`#${PREFIX}`)) return null;
  return hash.slice(PREFIX.length + 1);
}

export function clearSyncHash(): void {
  // Use replaceState so we don't pollute history with a back-button entry.
  if (window.location.hash.startsWith(`#${PREFIX}`)) {
    const url = window.location.origin + window.location.pathname + window.location.search;
    window.history.replaceState(null, '', url);
  }
}

export function formatHashSize(encoded: string): { chars: number; approxKb: number } {
  // base64url is 4 chars per 3 bytes; very close to 1 char per 0.75 byte.
  const bytes = (encoded.length * 3) / 4;
  return { chars: encoded.length, approxKb: Math.max(1, Math.round(bytes / 102.4) / 10) };
}

export async function copySyncText(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
  } else {
    throw new Error('Clipboard API not available.');
  }
}

export function summaryFor(todos: Todo[]): {
  total: number;
  completed: number;
  pending: number;
  archived: number;
} {
  let completed = 0;
  let archived = 0;
  for (const t of todos) {
    if (t.isCompleted) completed++;
    if (t.isArchived) archived++;
  }
  return {
    total: todos.length,
    completed,
    pending: todos.length - completed - archived,
    archived,
  };
}
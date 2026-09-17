// SyncDialog — shows incoming sync data from the URL hash and lets the user
// pick: merge, replace, or discard. Designed to be mounted at app level so it
// can intercept `#sync=...` hashes regardless of which page the user lands on.

import { useEffect, useState } from 'react';
import { X, Download, Upload, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from '../../i18n';
import {
  decodeSync,
  readSyncHash,
  clearSyncHash,
  summaryFor,
} from '../../lib/sync';
import type { Todo } from '../../types/todo';

interface IncomingSync {
  count: number;
  completed: number;
  archived: number;
  pending: number;
  sample: { title: string; priority: string; dueDateLabel: string }[];
}

interface Props {
  // Provided by parent (typically Settings page). The dialog lives at app
  // level so it can be triggered by URL hash even before the user opens
  // Settings.
  onMerge: (incoming: Todo[]) => { added: number; existing: number };
  onReplace: (incoming: Todo[]) => void;
  onDiscard: () => void;
  existingCount: number;
}

export function SyncDialog({ onMerge, onReplace, onDiscard, existingCount }: Props) {
  const { t } = useTranslation();
  const [incoming, setIncoming] = useState<IncomingSync | null>(null);
  const [rawTodos, setRawTodos] = useState<Todo[] | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [status, setStatus] = useState<'idle' | 'merged' | 'replaced' | 'discarded' | 'error'>('idle');
  const [statusDetail, setStatusDetail] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Listen for #sync=... on mount and whenever the hash changes.
  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      const encoded = readSyncHash();
      if (!encoded) return;
      try {
        const { todos } = await decodeSync(encoded);
        if (cancelled) return;
        const summary = summaryFor(todos);
        const sample = todos.slice(0, 5).map((todo) => ({
          title: todo.title || '(untitled)',
          priority: todo.priority,
          dueDateLabel: todo.dueDate
            ? new Date(todo.dueDate).toLocaleDateString()
            : '—',
        }));
        setRawTodos(todos);
        setIncoming({ ...summary, sample });
        setStatus('idle');
        setStatusDetail('');
      } catch (err) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : 'Unknown error';
        setErrorMsg(msg);
        setStatus('error');
        // Bad data — wipe the hash so the dialog doesn't keep popping up.
        clearSyncHash();
      }
    };

    check();
    window.addEventListener('hashchange', check);
    return () => {
      cancelled = true;
      window.removeEventListener('hashchange', check);
    };
  }, []);

  if (status === 'error') {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl max-w-sm w-full p-6">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{t('settings.sync.detected.title')}</h3>
              <p className="text-sm text-gray-500 mt-1">{errorMsg}</p>
            </div>
          </div>
          <button
            onClick={() => setStatus('idle')}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-pink-300 to-peach-300 text-white font-medium"
          >
            OK
          </button>
        </div>
      </div>
    );
  }

  if (!incoming || !rawTodos) return null;

  const handleMerge = () => {
    const result = onMerge(rawTodos);
    setStatusDetail(t('settings.sync.detected.merged', { added: result.added, existing: result.existing }));
    setStatus('merged');
    clearSyncHash();
  };

  const handleReplace = () => {
    onReplace(rawTodos);
    setStatusDetail(t('settings.sync.detected.replaced'));
    setStatus('replaced');
    clearSyncHash();
  };

  const handleDiscard = () => {
    onDiscard();
    setStatusDetail(t('settings.sync.detected.discarded'));
    setStatus('discarded');
    clearSyncHash();
  };

  const handleClose = () => {
    setIncoming(null);
    setRawTodos(null);
    setShowPreview(false);
  };

  // Post-action confirmation screen (lighter)
  if (status !== 'idle') {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl max-w-sm w-full p-6">
          <p className="text-gray-700">{statusDetail}</p>
          <button
            onClick={handleClose}
            className="mt-4 w-full h-11 rounded-xl bg-gradient-to-r from-mint-300 to-sky-300 text-white font-medium"
          >
            OK
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{t('settings.sync.detected.title')}</h3>
            <p className="text-sm text-gray-500 mt-1">
              {t('settings.sync.detected.desc', { count: incoming.count })}
            </p>
          </div>
          <button onClick={handleDiscard} aria-label="Close">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Quick summary */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <SummaryBox label="Total" value={incoming.count} />
          <SummaryBox label="Done" value={incoming.completed} />
          <SummaryBox label="Open" value={incoming.pending} />
        </div>
        {existingCount > 0 && (
          <p className="text-xs text-gray-500 mb-4">
            You currently have {existingCount} todo{existingCount === 1 ? '' : 's'} on this device.
          </p>
        )}

        {/* Optional preview of first few items */}
        {showPreview && (
          <ul className="border border-gray-100 rounded-xl divide-y divide-gray-100 mb-4 max-h-48 overflow-y-auto">
            {incoming.sample.map((item, i) => (
              <li key={i} className="px-3 py-2 text-sm flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    item.priority === 'high'
                      ? 'bg-pink-400'
                      : item.priority === 'medium'
                      ? 'bg-peach-400'
                      : 'bg-mint-400'
                  }`}
                />
                <span className="flex-1 truncate text-gray-700">{item.title}</span>
                <span className="text-xs text-gray-400">{item.dueDateLabel}</span>
              </li>
            ))}
          </ul>
        )}

        <button
          onClick={() => setShowPreview((v) => !v)}
          className="flex items-center gap-1 text-xs text-pink-500 mb-4"
        >
          {showPreview ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          {t('settings.sync.detected.preview')}
        </button>

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={handleMerge}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-mint-300 to-sky-300 text-white font-medium flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            {t('settings.sync.detected.merge')}
          </button>
          <button
            onClick={handleReplace}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-pink-300 to-peach-300 text-white font-medium flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4" />
            {t('settings.sync.detected.replace')}
          </button>
          <button
            onClick={handleDiscard}
            className="w-full h-11 rounded-xl bg-gray-100 text-gray-600 font-medium"
          >
            {t('settings.sync.detected.discard')}
          </button>
        </div>
      </div>
    </div>
  );
}

function SummaryBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-pink-50 rounded-xl px-3 py-2 text-center">
      <div className="text-lg font-semibold text-gray-800">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}
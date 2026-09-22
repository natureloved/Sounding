/**
 * User pasted document ingestion adapter.
 */

import { Snapshot } from '../types.js';
import { getAnchorVerdict } from '../calendar/anchor.js';

export function createUserDocSnapshot(
  ticker: string,
  content: string,
  docName: string = 'user-notes',
  timestamp: string = new Date().toISOString()
): Snapshot {
  return {
    id: `snap-doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    source_id: `doc-${docName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
    source_name: docName,
    kind: 'user_doc',
    content: content.trim(),
    retrieved_at: timestamp,
    anchor_verdict: getAnchorVerdict(ticker, timestamp),
    provenance: 'user-submitted'
  };
}

/**
 * Sounding Append-Only Storage (SQLite via node:sqlite in Node, MemoryStorage in browser)
 */

import {
  Thesis,
  Snapshot,
  Conclusion,
  Attribution,
  Run,
  SourceCoverageStat
} from '../types.js';
import { assertI1, assertI7 } from './schema.js';

export interface StorageBackend {
  insertThesis(thesis: Thesis): void;
  insertSnapshot(snapshot: Snapshot): void;
  insertConclusion(conclusion: Conclusion): void;
  insertAttribution(attribution: Attribution): void;
  insertRun(run: Run): void;
  getThesis(id: string): Thesis | undefined;
  getSnapshot(id: string): Snapshot | undefined;
  getConclusion(id: string): Conclusion | undefined;
  getAttribution(conclusionId: string): Attribution | undefined;
  getAllConclusions(): Array<{ conclusion: Conclusion; attribution: Attribution }>;
  getCoverageStats(): SourceCoverageStat[];
}

/**
 * Universal In-Memory Storage Backend
 */
export class MemoryStorage implements StorageBackend {
  private theses = new Map<string, Thesis>();
  private snapshots = new Map<string, Snapshot>();
  private conclusions = new Map<string, Conclusion>();
  private attributions = new Map<string, Attribution>(); // key: conclusion_id
  private runs: Run[] = [];

  insertThesis(thesis: Thesis): void {
    this.theses.set(thesis.id, thesis);
  }

  insertSnapshot(snapshot: Snapshot): void {
    this.snapshots.set(snapshot.id, snapshot);
    this.snapshots.set(snapshot.source_name, snapshot);
  }

  insertConclusion(conclusion: Conclusion): void {
    this.conclusions.set(conclusion.id, conclusion);
  }

  insertAttribution(attribution: Attribution): void {
    assertI7(attribution); // Enforce Invariant I7
    this.attributions.set(attribution.conclusion_id, attribution);
  }

  insertRun(run: Run): void {
    this.runs.push(run);
  }

  getThesis(id: string): Thesis | undefined {
    return this.theses.get(id);
  }

  getSnapshot(id: string): Snapshot | undefined {
    return this.snapshots.get(id);
  }

  getConclusion(id: string): Conclusion | undefined {
    return this.conclusions.get(id);
  }

  getAttribution(conclusionId: string): Attribution | undefined {
    return this.attributions.get(conclusionId);
  }

  getAllConclusions(): Array<{ conclusion: Conclusion; attribution: Attribution }> {
    const list: Array<{ conclusion: Conclusion; attribution: Attribution }> = [];
    for (const [id, conclusion] of this.conclusions.entries()) {
      const attribution = this.attributions.get(id);
      if (attribution) {
        assertI1(conclusion, attribution); // Enforce Invariant I1
        list.push({ conclusion, attribution });
      }
    }
    return list;
  }

  getCoverageStats(): SourceCoverageStat[] {
    const statMap = new Map<string, SourceCoverageStat>();

    for (const snap of this.snapshots.values()) {
      if (!statMap.has(snap.source_name)) {
        statMap.set(snap.source_name, {
          source_name: snap.source_name,
          kind: snap.kind,
          total_captured: 0,
          times_load_bearing: 0,
          load_bearing_ratio: 0,
          last_anchor_verdict: snap.anchor_verdict
        });
      }
      const stat = statMap.get(snap.source_name)!;
      stat.total_captured++;
      stat.last_anchor_verdict = snap.anchor_verdict;
    }

    for (const attr of this.attributions.values()) {
      for (const lb of attr.load_bearing_set) {
        if (statMap.has(lb)) {
          statMap.get(lb)!.times_load_bearing++;
        }
      }
    }

    const results = Array.from(statMap.values());
    for (const r of results) {
      r.load_bearing_ratio = r.total_captured > 0 ? r.times_load_bearing / r.total_captured : 0;
    }

    return results.sort((a, b) => b.times_load_bearing - a.times_load_bearing);
  }
}

/**
 * SQLite Storage (Node only)
 */
function createStorage(): StorageBackend {
  const isNode = typeof process !== 'undefined' && process.versions && process.versions.node;
  if (!isNode) {
    return new MemoryStorage();
  }

  try {
    const { DatabaseSync } = require('node:sqlite');
    const path = require('node:path');
    const fs = require('node:fs');

    const dbPath = process.env.SOUNDING_DB || path.resolve(process.cwd(), 'data', 'sounding.sqlite');
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const db = new DatabaseSync(dbPath);
    const memory = new MemoryStorage();

    db.exec(`
      CREATE TABLE IF NOT EXISTS theses (
        id TEXT PRIMARY KEY,
        text TEXT NOT NULL,
        ticker TEXT NOT NULL,
        stated_at TEXT NOT NULL,
        user_position TEXT
      );

      CREATE TABLE IF NOT EXISTS snapshots (
        id TEXT PRIMARY KEY,
        source_id TEXT NOT NULL,
        source_name TEXT NOT NULL,
        kind TEXT NOT NULL,
        content TEXT NOT NULL,
        retrieved_at TEXT NOT NULL,
        anchor_verdict TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS conclusions (
        id TEXT PRIMARY KEY,
        thesis_id TEXT NOT NULL,
        snapshot_set TEXT NOT NULL,
        direction TEXT NOT NULL,
        confidence_band TEXT NOT NULL,
        rationale TEXT NOT NULL,
        cited_sources TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS attributions (
        id TEXT PRIMARY KEY,
        conclusion_id TEXT NOT NULL,
        load_bearing_set TEXT NOT NULL,
        inherited_anchor TEXT NOT NULL,
        robust INTEGER NOT NULL,
        noise_figure REAL NOT NULL,
        tested_removals TEXT NOT NULL,
        offending_sources TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS runs (
        id TEXT PRIMARY KEY,
        thesis_id TEXT NOT NULL,
        model_id TEXT NOT NULL,
        temperature REAL NOT NULL,
        seed TEXT,
        started_at TEXT NOT NULL
      );
    `);

    return {
      insertThesis(thesis: Thesis): void {
        memory.insertThesis(thesis);
        const stmt = db.prepare(
          `INSERT OR REPLACE INTO theses (id, text, ticker, stated_at, user_position) VALUES (?, ?, ?, ?, ?)`
        );
        stmt.run(thesis.id, thesis.text, thesis.ticker, thesis.stated_at, thesis.user_position || null);
      },

      insertSnapshot(snapshot: Snapshot): void {
        memory.insertSnapshot(snapshot);
        const stmt = db.prepare(
          `INSERT OR REPLACE INTO snapshots (id, source_id, source_name, kind, content, retrieved_at, anchor_verdict) VALUES (?, ?, ?, ?, ?, ?, ?)`
        );
        stmt.run(
          snapshot.id,
          snapshot.source_id,
          snapshot.source_name,
          snapshot.kind,
          snapshot.content,
          snapshot.retrieved_at,
          snapshot.anchor_verdict
        );
      },

      insertConclusion(conclusion: Conclusion): void {
        memory.insertConclusion(conclusion);
        const stmt = db.prepare(
          `INSERT OR REPLACE INTO conclusions (id, thesis_id, snapshot_set, direction, confidence_band, rationale, cited_sources, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        );
        stmt.run(
          conclusion.id,
          conclusion.thesis_id,
          JSON.stringify(conclusion.snapshot_set),
          conclusion.direction,
          conclusion.confidence_band,
          conclusion.rationale,
          JSON.stringify(conclusion.cited_sources),
          conclusion.created_at
        );
      },

      insertAttribution(attribution: Attribution): void {
        assertI7(attribution);
        memory.insertAttribution(attribution);
        const stmt = db.prepare(
          `INSERT OR REPLACE INTO attributions (id, conclusion_id, load_bearing_set, inherited_anchor, robust, noise_figure, tested_removals, offending_sources, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        );
        stmt.run(
          attribution.id,
          attribution.conclusion_id,
          JSON.stringify(attribution.load_bearing_set),
          attribution.inherited_anchor,
          attribution.robust ? 1 : 0,
          attribution.noise_figure,
          JSON.stringify(attribution.tested_removals),
          attribution.offending_sources ? JSON.stringify(attribution.offending_sources) : null,
          attribution.created_at
        );
      },

      insertRun(run: Run): void {
        memory.insertRun(run);
        const stmt = db.prepare(
          `INSERT OR REPLACE INTO runs (id, thesis_id, model_id, temperature, seed, started_at) VALUES (?, ?, ?, ?, ?, ?)`
        );
        stmt.run(run.id, run.thesis_id, run.model_id, run.temperature, run.seed || null, run.started_at);
      },

      getThesis(id: string): Thesis | undefined {
        return memory.getThesis(id);
      },

      getSnapshot(id: string): Snapshot | undefined {
        return memory.getSnapshot(id);
      },

      getConclusion(id: string): Conclusion | undefined {
        return memory.getConclusion(id);
      },

      getAttribution(conclusionId: string): Attribution | undefined {
        return memory.getAttribution(conclusionId);
      },

      getAllConclusions(): Array<{ conclusion: Conclusion; attribution: Attribution }> {
        return memory.getAllConclusions();
      },

      getCoverageStats(): SourceCoverageStat[] {
        return memory.getCoverageStats();
      }
    };
  } catch {
    return new MemoryStorage();
  }
}

export const db: StorageBackend = createStorage();

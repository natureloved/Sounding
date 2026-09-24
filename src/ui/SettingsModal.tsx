import React, { useState, useEffect } from 'react';
import { WorkbenchSettings } from '../types.js';

interface SettingsModalProps {
  settings: WorkbenchSettings;
  onSave: (settings: WorkbenchSettings) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ settings, onSave, onClose }) => {
  const [apiKey, setApiKey] = useState(settings.apiKey || '');
  const [baseUrl, setBaseUrl] = useState(settings.baseUrl || 'https://hackathon.bitgetops.com/v1');
  const [model, setModel] = useState(settings.model || 'qwen3.8-max');
  const [mcpServerUrl, setMcpServerUrl] = useState(settings.mcpServerUrl || '');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      setTestResult({
        success: true,
        message: '✓ Preloaded Demo Mode Active: Deterministic offline engine ready (0ms latency, zero credentials required).'
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);
    const start = Date.now();

    try {
      // In browser, route via /api/chat to eliminate CORS ('Failed to fetch')
      const isBrowser = typeof window !== 'undefined';
      const endpoint = isBrowser ? '/api/chat' : `${baseUrl}/chat/completions`;

      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey.trim() ? { Authorization: `Bearer ${apiKey.trim()}` } : {})
        },
        body: JSON.stringify({
          model,
          baseUrl,
          ...(apiKey.trim() ? { apiKey: apiKey.trim() } : {}),
          messages: [{ role: 'user', content: 'Ping: reply with "pong"' }],
          max_tokens: 5
        })
      });

      const elapsed = Date.now() - start;
      if (resp.ok) {
        setTestResult({
          success: true,
          message: `✓ Connected successfully to ${model} (${elapsed}ms latency)!`
        });
      } else {
        const errorText = await resp.text();
        let displayError = errorText.slice(0, 100);
        try {
          const parsedErr = JSON.parse(errorText);
          if (parsedErr.error) displayError = typeof parsedErr.error === 'string' ? parsedErr.error : JSON.stringify(parsedErr.error);
        } catch {}
        setTestResult({
          success: false,
          message: `HTTP ${resp.status}: ${displayError}`
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Connection failed: ${err.message || 'Network error'}`
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    onSave({
      apiKey: apiKey.trim(),
      baseUrl: baseUrl.trim(),
      model: model.trim(),
      mcpServerUrl: mcpServerUrl.trim()
    });
    onClose();
  };

  const handleResetDemo = () => {
    setApiKey('');
    setTestResult({
      success: true,
      message: '✓ Reset to Preloaded Demo Mode (Zero Credentials)'
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 700, fontSize: '15px', color: '#ffffff' }}>
              ⚙️ Workbench Gateway &amp; Model Settings
            </span>
            <span
              style={{
                fontSize: '10px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 'var(--radius-pill)',
                background: apiKey.trim() ? 'var(--accent-emerald-dim)' : 'var(--accent-cyan-dim)',
                color: apiKey.trim() ? 'var(--accent-emerald)' : 'var(--accent-cyan)',
                border: `1px solid ${apiKey.trim() ? 'var(--accent-emerald-border)' : 'var(--accent-cyan-border)'}`
              }}
            >
              {apiKey.trim() ? 'Live LLM Configured' : 'Preloaded Demo Mode Active'}
            </span>
          </div>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Zero-friction helper notice */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-inner)',
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              fontSize: '12px',
              color: 'var(--text-secondary)',
              lineHeight: 1.5
            }}
          >
            <strong style={{ color: 'var(--accent-emerald)' }}>⚡ Instant Preloaded Demo Mode:</strong>{' '}
            No API key is required to evaluate Sounding. By default, Sounding runs deterministically on its offline causal removal engine and live Bitget market indicators. Connect your Bitget Qwen key below to enable live cloud LLM inference.
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                BITGET QWEN / OPENAI API KEY <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(OPTIONAL)</span>
              </label>
              {apiKey.trim() && (
                <button
                  type="button"
                  onClick={handleResetDemo}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent-amber)',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Clear Key &amp; Return to Demo Mode
                </button>
              )}
            </div>
            <input
              type="password"
              className="thesis-input"
              style={{ width: '100%' }}
              placeholder="sk-qwen-... (Leave empty for instant preloaded demo)"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
              Default: If blank, Sounding operates deterministically on its offline derivation engine.
            </span>
          </div>

          {/* Security Disclosure (Item 2) */}
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-inner)',
              background: 'rgba(56, 189, 248, 0.06)',
              border: '1px solid rgba(56, 189, 248, 0.18)',
              fontSize: '11px',
              color: 'var(--text-secondary)',
              lineHeight: 1.5
            }}
          >
            <strong style={{ color: 'var(--accent-cyan)' }}>🔒 Client-Side Key Handling Disclosure:</strong>
            <div style={{ marginTop: '3px' }}>
              Sounding is a read-only trading attribution desk. Your API key, if you provide one, is stored strictly in your browser session memory (localStorage / React state). Requests are relayed through Sounding's own serverless proxy (/api/chat), which forwards them to the Bitget Qwen gateway (<code>hackathon.bitgetops.com</code>) and never logs, persists, or shares keys. If no personal key is configured, the proxy uses its own server-side key so the live LLM engine works out of the box.
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              GATEWAY BASE URL
            </label>
            <input
              type="text"
              className="thesis-input"
              style={{ width: '100%', fontFamily: 'var(--font-mono)', fontSize: '12px' }}
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
            />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
              Bitget Official: <code>https://hackathon.bitgetops.com/v1</code>
            </span>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              DERIVATION MODEL ID
            </label>
            <select
              className="thesis-input"
              style={{ width: '100%', fontFamily: 'var(--font-mono)' }}
              value={model}
              onChange={(e) => setModel(e.target.value)}
            >
              <option value="qwen3.8-max">qwen3.8-max (Bitget Recommended)</option>
              <option value="qwen2.5-72b-instruct">qwen2.5-72b-instruct</option>
              <option value="deepseek-v3">deepseek-v3</option>
              <option value="gpt-4o-mini">gpt-4o-mini</option>
            </select>
          </div>

          {/* Bitget MCP Server URL */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              BITGET-MCP-SERVER URL (US DATA &amp; FUNDAMENTALS LAYER)
            </label>
            <input
              type="text"
              className="thesis-input"
              value={mcpServerUrl}
              onChange={(e) => setMcpServerUrl(e.target.value)}
              placeholder="e.g. https://mcp.yourdomain.com (Optional)"
            />
            <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
              Official data layer for US stocks/ETF quotes &amp; fundamentals (e.g. <code>npx bitget-mcp-server</code>).
            </span>
          </div>

          {/* Ping Test */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '4px' }}>
            <button
              type="button"
              className="pill-btn"
              onClick={handleTestConnection}
              disabled={isTesting}
            >
              {isTesting ? 'Pinging Gateway...' : '⚡ Test Live Ping'}
            </button>
            {testResult && (
              <span
                style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  color: testResult.success ? 'var(--accent-emerald)' : 'var(--accent-rose)'
                }}
              >
                {testResult.message}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px', borderTop: '1px solid var(--border-hairline)', paddingTop: '16px' }}>
            <button className="pill-btn" onClick={onClose}>
              Cancel
            </button>
            <button className="execute-btn" style={{ padding: '8px 20px' }} onClick={handleSave}>
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

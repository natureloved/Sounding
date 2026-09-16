import React, { useState } from 'react';
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
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      setTestResult({
        success: false,
        message: 'Please provide a Bitget Qwen or OpenAI-compatible API key first.'
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);
    const start = Date.now();

    try {
      const resp = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey.trim()}`
        },
        body: JSON.stringify({
          model,
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
        setTestResult({
          success: false,
          message: `HTTP ${resp.status}: ${errorText.slice(0, 100)}`
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
      model: model.trim()
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '560px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span style={{ fontWeight: 700, fontSize: '15px', color: '#ffffff' }}>
            ⚙️ Workbench Gateway &amp; Model Settings
          </span>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              BITGET QWEN / OPENAI API KEY
            </label>
            <input
              type="password"
              className="thesis-input"
              style={{ width: '100%' }}
              placeholder="sk-qwen-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
              Default: If blank, Sounding operates deterministically on its offline derivation engine.
            </span>
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

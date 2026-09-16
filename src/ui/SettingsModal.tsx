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
        message: 'ERROR: PROVIDE A BITGET QWEN OR OPENAI-COMPATIBLE API KEY.'
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
          message: `[+] CONNECTED SUCCESSFULLY TO ${model} (${elapsed}MS LATENCY)`
        });
      } else {
        const errorText = await resp.text();
        setTestResult({
          success: false,
          message: `[!] HTTP ${resp.status}: ${errorText.slice(0, 100)}`
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `[!] CONNECTION FAILED: ${err.message || 'NETWORK ERROR'}`
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
          <span style={{ fontWeight: 800, fontSize: '13px', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>
            [ SYSTEM CONFIG // BITGET QWEN GATEWAY & INFERENCE MODEL ]
          </span>
          <button className="close-btn" onClick={onClose}>
            [X]
          </button>
        </div>

        <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '4px', letterSpacing: '0.05em' }}>
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
            <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
              DEFAULT: SOUNDING RUNS DETERMINISTICALLY VIA OFFLINE DERIVATION ENGINE IF UNSET.
            </span>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '4px', letterSpacing: '0.05em' }}>
              GATEWAY BASE URL
            </label>
            <input
              type="text"
              className="thesis-input"
              style={{ width: '100%' }}
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
            />
            <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
              OFFICIAL GATEWAY: <code>https://hackathon.bitgetops.com/v1</code>
            </span>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '4px', letterSpacing: '0.05em' }}>
              DERIVATION MODEL ID
            </label>
            <select
              className="thesis-input"
              style={{ width: '100%' }}
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '6px' }}>
            <button
              type="button"
              className="pill-btn"
              onClick={handleTestConnection}
              disabled={isTesting}
            >
              {isTesting ? '[ PINGING GATEWAY... ]' : '[ TEST GATEWAY PING ]'}
            </button>
            {testResult && (
              <span
                style={{
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  color: testResult.success ? 'var(--phosphor-green)' : 'var(--hazard-red)'
                }}
              >
                {testResult.message}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px', borderTop: '1px solid var(--border-tactical)', paddingTop: '12px' }}>
            <button className="pill-btn" onClick={onClose}>
              [ CANCEL ]
            </button>
            <button className="execute-btn" style={{ padding: '8px 20px' }} onClick={handleSave}>
              [ SAVE SETTINGS ]
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

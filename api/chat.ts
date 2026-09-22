/**
 * Vercel Serverless Function: /api/chat
 * Proxies LLM requests to Bitget Qwen Gateway (https://hackathon.bitgetops.com/v1)
 * Eliminates browser CORS ('Failed to fetch') and keeps API keys secure.
 */

export default async function handler(req: any, res: any) {
  // 1. CORS headers allowing browser invocations
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const {
      model = 'qwen3.8-max',
      messages,
      temperature = 0,
      max_tokens,
      response_format,
      baseUrl: clientBaseUrl,
      apiKey: clientApiKey
    } = body;

    // Extract API key: Bearer header > client body > server environment
    const authHeader = req.headers.authorization || req.headers.Authorization;
    let token = '';
    if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim();
    }
    const apiKey = (clientApiKey || token || process.env.BITGET_QWEN_API_KEY || process.env.OPENAI_API_KEY || '').trim();

    if (!apiKey) {
      return res.status(401).json({
        error: 'No API key provided. Please provide an API key in Gateway Settings or set BITGET_QWEN_API_KEY in Vercel.'
      });
    }

    const baseUrl = (clientBaseUrl || process.env.BITGET_GATEWAY_URL || 'https://hackathon.bitgetops.com/v1').replace(/\/+$/, '');

    // Payload for upstream Qwen gateway
    const upstreamPayload: any = {
      model,
      temperature,
      messages: messages || [{ role: 'user', content: 'Ping: reply with "pong"' }]
    };
    if (typeof max_tokens === 'number') upstreamPayload.max_tokens = max_tokens;
    if (response_format) upstreamPayload.response_format = response_format;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    let upstreamResp = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(upstreamPayload),
      signal: controller.signal
    });

    // If 400 Bad Request and response_format was used, retry without response_format
    if (!upstreamResp.ok && upstreamResp.status === 400 && upstreamPayload.response_format) {
      delete upstreamPayload.response_format;
      upstreamResp = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify(upstreamPayload),
        signal: controller.signal
      });
    }

    clearTimeout(timeout);

    const data = await upstreamResp.text();
    res.setHeader('Content-Type', 'application/json');
    if (typeof res.status === 'function') {
      res.status(upstreamResp.status);
    } else {
      res.statusCode = upstreamResp.status;
    }
    if (typeof res.send === 'function') {
      return res.send(data);
    }
    return res.end(data);
  } catch (err: any) {
    if (typeof res.status === 'function') {
      return res.status(500).json({
        error: `Proxy error: ${err.message || 'Failed to connect to gateway'}`
      });
    }
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ error: `Proxy error: ${err.message || 'Failed to connect to gateway'}` }));
  }
}

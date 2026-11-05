const TOGETHER_URL = 'https://api.together.xyz/v1/chat/completions';
const MODEL = process.env.TOGETHER_MODEL || 'mistralai/Mixtral-8x7B-Instruct-v0.1';
const MAX_MESSAGE_CHARS = 2000;
const MAX_HISTORY = 4;

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

// The system prompt lives on the server so callers can't repurpose this endpoint
// (and the API key behind it) as a general-purpose LLM proxy.
function buildSystemPrompt(context) {
  const base =
    'You are a helpful medical assistant who explains breast ultrasound AI results to patients ' +
    'in simple, empathetic terms. Keep responses brief and clear. You are not a doctor: always ' +
    'encourage the user to consult a medical professional for diagnosis and treatment decisions. ' +
    'Politely decline questions unrelated to health or the analysis.';

  const diagnosis = ['Benign', 'Malignant'].includes(context?.diagnosis) ? context.diagnosis : null;
  const confidence = Number(context?.confidence);
  if (diagnosis && Number.isFinite(confidence)) {
    return `${base} Assume the user is referring to a breast ultrasound classified by an AI model as "${diagnosis}" with ${confidence.toFixed(1)}% confidence unless they say otherwise.`;
  }
  return base;
}

export async function POST(req) {
  if (!process.env.TOGETHER_API_KEY) {
    console.error('[Chatbot] TOGETHER_API_KEY is not set');
    return json({ error: 'Assistant is not configured' }, 503);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const messages = (Array.isArray(body?.messages) ? body.messages : [])
    .filter(
      (m) =>
        m &&
        ['user', 'assistant'].includes(m.role) &&
        typeof m.content === 'string' &&
        m.content.trim() !== ''
    )
    .slice(-MAX_HISTORY)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_CHARS) }));

  if (messages.at(-1)?.role !== 'user') {
    return json({ error: 'No user message' }, 400);
  }

  try {
    const response = await fetch(TOGETHER_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'system', content: buildSystemPrompt(body.context) }, ...messages],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      console.error('[Together API Error]', response.status, await response.text());
      return json({ error: 'Assistant is unavailable right now' }, 502);
    }

    const data = await response.json();
    const assistant = data?.choices?.[0]?.message?.content || 'No response from assistant.';
    return json({ assistant });
  } catch (e) {
    console.error('[Chatbot Error]', e);
    return json({ error: 'Failed to fetch assistant reply' }, 500);
  }
}

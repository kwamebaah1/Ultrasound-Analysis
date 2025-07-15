export async function POST(req) {
  try {
    const { messages } = await req.json();
    console.log("process.env.HUGGINGFACE_API_KEY", process.env.HUGGINGFACE_API_KEY)
    const user = messages.find(m => m.role === 'user')?.content;
    if (!user) {
      return new Response(JSON.stringify({ error: 'No user message' }), { status: 400 });
    }

    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
    method: 'POST',
    headers: {
        Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
        messages: [
        { role: 'system', content: 'You are a helpful medical assistant.' },
        { role: 'user', content: user },
        ],
        temperature: 0.7,
        max_tokens: 300,
    }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[HF ERROR]', errText);
      throw new Error(`HF API error: ${response.statusText}`);
    }

    const data = await response.json();
    const assistant = data?.choices?.[0]?.message?.content || 'No response from assistant.';

    return new Response(JSON.stringify({ assistant }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (e) {
    console.error('[Chatbot Error]', e);
    return new Response(JSON.stringify({ error: 'Failed to fetch assistant reply' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

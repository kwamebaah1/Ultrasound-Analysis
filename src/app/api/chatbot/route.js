export async function POST(req) {
  try {
    const body = await req.json();
    const { messages = [], systemPrompt } = body;

    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')?.content;
    if (!lastUserMessage?.trim()) {
      return new Response(JSON.stringify({ error: 'No user message' }), { status: 400 });
    }

    const nonSystemMessages = messages
      .filter(
        (m) =>
          m &&
          typeof m.role === 'string' &&
          ['user', 'assistant'].includes(m.role) &&
          typeof m.content === 'string' &&
          m.content.trim() !== ''
      )
      .slice(-4);

    const sanitizedMessages = [
      { role: 'system', content: systemPrompt },
      ...nonSystemMessages
    ];

    console.log('Sending sanitized payload:', JSON.stringify(sanitizedMessages, null, 2));

    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
        messages: sanitizedMessages,
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[Together API Error]', errText);
      return new Response(JSON.stringify({ error: 'LLM error', details: errText }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const assistant = data?.choices?.[0]?.message?.content || 'No response from assistant.';

    return new Response(JSON.stringify({ assistant }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (e) {
    console.error('[Chatbot Error]', e);
    return new Response(JSON.stringify({ error: 'Failed to fetch assistant reply' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

'use client';

import { useState } from 'react';

export default function ChatBot({ initialAdvice, diagnosis, confidence }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: initialAdvice }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
  if (!input.trim()) return;

  const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    const filteredMessages = newMessages
        .filter((msg, idx) => msg.role && msg.content?.trim() && !(idx === 0 && msg.role === 'assistant')) // remove initial assistant
        .slice(-4); // last 4 clean messages

    try {
        const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            messages: [
            {
                role: 'system',
                content: diagnosis && confidence
                ? `You are a helpful medical assistant. Assume the user is referring to a breast ultrasound diagnosis of "${diagnosis}" with ${confidence.toFixed(1)}% confidence unless otherwise specified. Be empathetic, brief, and guide users clearly.`
                : 'You are a helpful medical assistant.',
            },
            ...filteredMessages
            ]
        }),
        });

        const result = await response.json();

        if (result.assistant) {
        setMessages([...newMessages, { role: 'assistant', content: result.assistant }]);
        } else if (result.error) {
        console.error('Assistant returned error:', result.error, result.details);
        }
    } catch (err) {
        console.error('Chatbot error:', err);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="mt-8 p-4 bg-white rounded-lg shadow-md border">
      <h3 className="text-lg font-semibold text-blue-700 mb-3">Ask Follow-up Questions</h3>
      <div className="h-60 overflow-y-auto bg-gray-50 p-3 rounded mb-4 border text-sm">
        {messages.map((msg, index) => (
          <div key={index} className={`mb-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block p-2 rounded-lg ${msg.role === 'user' ? 'bg-blue-100 text-blue-900' : 'bg-gray-200 text-gray-800'}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && <p className="text-xs text-gray-500">Loading...</p>}
      </div>

      <div className="flex items-center">
        <input
          type="text"
          placeholder="Ask a question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-grow p-2 border border-gray-300 rounded-l-lg focus:outline-none"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </div>
  );
}

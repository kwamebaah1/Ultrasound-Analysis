'use client';

import { useState } from 'react';

// Shared conversation state for the inline and expanded chat views.
export default function useChat({ initialAdvice, diagnosis, confidence }) {
  const [messages, setMessages] = useState([{ role: 'assistant', content: initialAdvice }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const send = async (text) => {
    const content = text.trim();
    if (!content || loading) return;

    const newMessages = [...messages, { role: 'user', content }];
    setMessages(newMessages);
    setLoading(true);
    setError('');

    // Drop the auto-generated opening message; send the most recent turns only.
    const history = newMessages
      .filter((m, idx) => m.role && m.content?.trim() && !(idx === 0 && m.role === 'assistant'))
      .slice(-3);

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, context: { diagnosis, confidence } }),
      });
      const result = await response.json();

      if (result.assistant) {
        setMessages([...newMessages, { role: 'assistant', content: result.assistant }]);
      } else {
        setError(result.error || 'The assistant could not respond. Please try again.');
      }
    } catch (err) {
      console.error('Chatbot error:', err);
      setError('Could not reach the assistant. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return { messages, loading, error, send };
}

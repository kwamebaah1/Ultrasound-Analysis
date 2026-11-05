'use client';

import { useEffect, useRef, useState } from 'react';
import { FiAlertCircle, FiSend } from 'react-icons/fi';
import MessageBubble from './MessageBubble';

// Message list + composer, shared by the inline card and the expanded dialog.
const ChatThread = ({ chat, className = '', autoFocus = false }) => {
  const { messages, loading, error, send } = chat;
  const [input, setInput] = useState('');
  const listRef = useRef(null);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading, error]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    send(input);
    setInput('');
  };

  return (
    <div className={`flex min-h-0 flex-col ${className}`}>
      <div ref={listRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
        {messages.map((message, index) => (
          <MessageBubble key={index} message={message} />
        ))}
        {loading && <MessageBubble message={{ role: 'assistant' }} isLoading />}
        {error && (
          <p className="flex items-center gap-1.5 text-xs text-red-700" role="alert">
            <FiAlertCircle aria-hidden /> {error}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-slate-100 p-3">
        <label htmlFor="chat-input" className="sr-only">
          Ask a question
        </label>
        <input
          id="chat-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about this result…"
          autoFocus={autoFocus}
          className="h-9 flex-1 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          aria-label="Send message"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-brand-600 text-white hover:bg-brand-700 disabled:bg-slate-200 disabled:text-slate-400"
        >
          <FiSend size={15} />
        </button>
      </form>
    </div>
  );
};

export default ChatThread;

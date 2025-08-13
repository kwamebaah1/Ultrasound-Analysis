'use client';

import { useState, useRef } from 'react';
import { FiSend, FiMaximize2 } from 'react-icons/fi';
import MessageBubble from './MessageBubble';
import FullPageChat from './FullPageChat';

const ChatBot = ({ initialAdvice, diagnosis, confidence }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: initialAdvice }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showFullPage, setShowFullPage] = useState(false);
  const messagesEndRef = useRef(null);

  const sendMessage = async () => {
  if (!input.trim()) return;

  const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    const filteredMessages = newMessages
        .filter((msg, idx) => msg.role && msg.content?.trim() && !(idx === 0 && msg.role === 'assistant'))
        .slice(-3);

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

  if (showFullPage) {
    return (
      <FullPageChat
        initialMessages={messages}
        onClose={() => setShowFullPage(false)}
        diagnosis={diagnosis}
        confidence={confidence}
      />
    );
  }

  return (
    <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="font-medium text-gray-800">AI Medical Assistant</h3>
        <button
          onClick={() => setShowFullPage(true)}
          className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100 transition-colors"
          title="Expand chat"
        >
          <FiMaximize2 size={16} />
        </button>
      </div>

      <div className="h-48 overflow-y-auto p-4 space-y-3">
        {messages.map((message, index) => (
          <MessageBubble 
            key={index}
            message={message}
            isFirst={index === 0}
          />
        ))}
        {loading && (
          <MessageBubble 
            message={{ role: 'assistant', content: '...' }}
            isLoading={true}
          />
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask a question..."
            className="flex-1 px-3 py-2 text-sm text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            <FiSend size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
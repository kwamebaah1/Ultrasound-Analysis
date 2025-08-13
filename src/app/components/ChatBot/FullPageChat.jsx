'use client';

import { useState, useEffect, useRef } from 'react';
import { FiSend, FiX, FiArrowLeft } from 'react-icons/fi';
import MessageBubble from './MessageBubble';

const FullPageChat = ({ initialMessages, onClose, diagnosis, confidence }) => {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-teal-600 p-4 text-white flex items-center justify-between">
        <button 
          onClick={onClose}
          className="p-2 rounded-full hover:bg-white/20 transition-colors"
        >
          <FiArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-semibold">Medical AI Assistant</h2>
        <button 
          onClick={onClose}
          className="p-2 rounded-full hover:bg-white/20 transition-colors"
        >
          <FiX size={20} />
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
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

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type your question..."
            className="flex-1 p-3 border border-gray-300 text-black rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            <FiSend size={18} />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          This AI assistant provides general information only. Always consult your doctor for medical advice.
        </p>
      </div>
    </div>
  );
};

export default FullPageChat;
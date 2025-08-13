'use client';

import { FiUser, FiMessageSquare } from 'react-icons/fi';

const MessageBubble = ({ message, isFirst, isLoading }) => {
  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start gap-2`}>
        <div className={`mt-1 flex-shrink-0 ${message.role === 'user' ? 'text-blue-600' : 'text-teal-600'}`}>
          {message.role === 'user' ? <FiUser size={14} /> : <FiMessageSquare size={14} />}
        </div>
        <div
          className={`px-3 py-2 rounded-lg text-sm ${
            message.role === 'user'
              ? 'bg-blue-100 text-blue-900 rounded-br-none'
              : 'bg-gray-100 text-gray-800 rounded-bl-none'
          } ${isLoading ? 'animate-pulse' : ''}`}
        >
          {isLoading && !message.content ? '...' : message.content}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
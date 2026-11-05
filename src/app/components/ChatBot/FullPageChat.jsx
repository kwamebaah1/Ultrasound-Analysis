'use client';

import { useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import ChatThread from './ChatThread';

// Expanded view of the same conversation (state is owned by ChatBot via useChat).
const FullPageChat = ({ chat, onClose }) => {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-center bg-slate-900/40 sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="chat-dialog-title"
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-2xl flex-col bg-white shadow-xl sm:h-[80vh] sm:rounded-lg sm:border sm:border-slate-200"
      >
        <header className="flex items-center border-b border-slate-200 px-5 py-3.5">
          <h2 id="chat-dialog-title" className="text-sm font-semibold text-slate-900">
            Ask the assistant
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close"
          >
            <FiX size={16} />
          </button>
        </header>

        <ChatThread chat={chat} className="flex-1" autoFocus />

        <p className="border-t border-slate-100 px-5 py-2.5 text-center text-xs text-slate-500">
          This assistant provides general information only. Always consult your doctor for medical advice.
        </p>
      </div>
    </div>
  );
};

export default FullPageChat;

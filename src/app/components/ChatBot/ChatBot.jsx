'use client';

import { useState } from 'react';
import { FiMaximize2 } from 'react-icons/fi';
import Panel from '../Panel';
import ChatThread from './ChatThread';
import FullPageChat from './FullPageChat';
import useChat from './useChat';

const ChatBot = ({ initialAdvice, diagnosis, confidence }) => {
  const chat = useChat({ initialAdvice, diagnosis, confidence });
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <Panel
        title="Ask the assistant"
        className="overflow-hidden [&>div]:p-0"
        actions={
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="inline-flex h-7 w-7 items-center justify-center rounded text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            aria-label="Expand chat"
            title="Expand"
          >
            <FiMaximize2 size={14} />
          </button>
        }
      >
        {expanded ? (
          <p className="flex h-72 items-center justify-center text-sm text-slate-500">
            Conversation open in expanded view.
          </p>
        ) : (
          <ChatThread chat={chat} className="h-72" />
        )}
      </Panel>

      {expanded && <FullPageChat chat={chat} onClose={() => setExpanded(false)} />}
    </>
  );
};

export default ChatBot;

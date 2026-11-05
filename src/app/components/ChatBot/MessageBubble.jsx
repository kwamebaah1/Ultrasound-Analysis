'use client';

const MessageBubble = ({ message, isLoading }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
          isUser ? 'bg-brand-600 text-white' : 'border border-slate-200 bg-slate-50 text-slate-800'
        }`}
      >
        {isLoading ? (
          <span className="flex gap-1 py-1" aria-label="Assistant is typing">
            {[0, 150, 300].map((d) => (
              <span
                key={d}
                className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400"
                style={{ animationDelay: `${d}ms` }}
              />
            ))}
          </span>
        ) : (
          <span className="whitespace-pre-wrap">{message.content}</span>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;

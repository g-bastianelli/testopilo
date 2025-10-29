import { cn } from '@testopilo/ui';
import type { ChatMessage as ChatMessageType } from '@lmnp/shared';
import ReactMarkdown from 'react-markdown';

type ChatMessageProps = {
  message: ChatMessageType;
};

function ChatMessage({ message }: ChatMessageProps) {
  return (
    <div
      className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}
    >
      <div
        className={cn(
          'inline-block px-4 py-2 rounded-lg',
          message.role === 'user'
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-foreground prose prose-sm max-w-none'
        )}
      >
        <ReactMarkdown>{message.content}</ReactMarkdown>
      </div>
    </div>
  );
}

export { ChatMessage };
